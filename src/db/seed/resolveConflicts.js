import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

import pool from '../client.js';
import { getByUnitNumber } from '../queries/units/units.js';
import { update as updatePerson } from '../queries/people/people.js';
import { create as createUnitPeople } from '../queries/unitPeople/unitPeople.js';

const __dirname = import.meta.dirname;
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const CONFLICTS_PATH = path.resolve(
  PROJECT_ROOT,
  'database/seed/import-conflicts.json'
);

const RESOLUTIONS_PATH = path.resolve(
  PROJECT_ROOT,
  'database/seed/conflict-resolutions.json'
);

async function createRelationshipSafe({ unitId, personId, occupantType }) {
  try {
    return await createUnitPeople({
      unitId,
      personId,
      occupantType,
    });
  } catch (err) {
    if (err.code === '23505') {
      return null;
    }
    throw err;
  }
}

function loadConflicts() {
  if (!fs.existsSync(CONFLICTS_PATH)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(CONFLICTS_PATH, 'utf8'));
}

function saveConflicts(conflicts) {
  fs.writeFileSync(CONFLICTS_PATH, JSON.stringify(conflicts, null, 2));
}

function loadResolutions() {
  if (!fs.existsSync(RESOLUTIONS_PATH)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(RESOLUTIONS_PATH, 'utf8'));
}

function saveResolutions(resolutions) {
  fs.writeFileSync(RESOLUTIONS_PATH, JSON.stringify(resolutions, null, 2));
}

function printConflict(conflict, index, total) {
  console.log('\n========================================');
  console.log(`Conflict ${index + 1} of ${total}`);
  console.log('========================================');
  console.log(`Unit: ${conflict.unitNumber}`);
  console.log(`Occupant Type: ${conflict.occupantType}`);
  console.log(`Incoming Name: ${conflict.incoming.fullName}`);
  console.log(`Incoming Email: ${conflict.incoming.email ?? 'None'}`);
  console.log('\nExisting matches:');

  conflict.matches.forEach((match, i) => {
    console.log(`  [${i + 1}] ${match.fullName} <${match.email ?? 'None'}>`);
    console.log(`      id: ${match.id}`);
  });

  console.log(
    '\nStep 1: choose which existing match refers to the same person.'
  );
  console.log(
    'Then you will choose whether to keep the existing name or use the incoming name.'
  );
  console.log('\nChoose a match:');
  conflict.matches.forEach((match, i) => {
    console.log(`  ${i + 1}. ${match.fullName} <${match.email ?? 'None'}>`);
  });
  console.log('  s. skip this conflict');
  console.log('  q. quit');
}

async function resolveOneConflict(conflict, rl) {
  const unit = await getByUnitNumber(conflict.unitNumber);

  if (!unit) {
    console.log(`Unit ${conflict.unitNumber} not found. Skipping.`);
    return { resolved: false, quit: false };
  }

  while (true) {
    const answer = (await rl.question('\nChoose option: '))
      .trim()
      .toLowerCase();

    if (answer === 's') {
      return { resolved: false, quit: false };
    }

    if (answer === 'q') {
      return { resolved: false, quit: true };
    }

    const matchIndex = Number(answer);

    if (
      !Number.isInteger(matchIndex) ||
      matchIndex < 1 ||
      matchIndex > conflict.matches.length
    ) {
      console.log('Invalid choice. Try again.');
      continue;
    }

    const chosen = conflict.matches[matchIndex - 1];

    console.log('\nSelected match:');
    console.log(`  Existing name: ${chosen.fullName}`);
    console.log(`  Incoming name: ${conflict.incoming.fullName}`);
    console.log('\nStep 2: choose which name to keep.');
    console.log('  1. Keep existing name');
    console.log('  2. Use incoming name');

    const nameChoice = (await rl.question('Choose name option (1/2): '))
      .trim()
      .toLowerCase();

    if (nameChoice !== '1' && nameChoice !== '2') {
      console.log('Invalid choice. Try again.');
      continue;
    }

    const renameToIncoming = nameChoice === '2';

    try {
      await pool.query('BEGIN');

      if (renameToIncoming) {
        const updated = await updatePerson(chosen.id, {
          fullName: conflict.incoming.fullName,
        });

        if (!updated) {
          throw new Error(`Unable to update person ${chosen.id}`);
        }

        console.log(`Updated person name to: ${updated.full_name}`);
      }

      const relationship = await createRelationshipSafe({
        unitId: unit.id,
        personId: chosen.id,
        occupantType: conflict.occupantType,
      });

      if (relationship) {
        console.log('Relationship created.');
      } else {
        console.log('Relationship already existed.');
      }

      await pool.query('COMMIT');
      return {
        resolved: true,
        quit: false,
        resolution: {
          resolvedAt: new Date().toISOString(),
          unitNumber: conflict.unitNumber,
          occupantType: conflict.occupantType,
          incoming: {
            fullName: conflict.incoming.fullName,
            email: conflict.incoming.email ?? null,
          },
          selectedMatch: {
            id: chosen.id,
            fullNameBefore: chosen.fullName,
            email: chosen.email ?? null,
          },
          decision: {
            nameAction: renameToIncoming
              ? 'USED_INCOMING_NAME'
              : 'KEPT_EXISTING_NAME',
            finalFullName: renameToIncoming
              ? conflict.incoming.fullName
              : chosen.fullName,
            relationshipCreated: Boolean(relationship),
          },
        },
      };
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Failed to resolve conflict:', err.message);
      return { resolved: false, quit: false };
    }
  }
}

async function run() {
  const conflicts = loadConflicts();
  const resolutions = loadResolutions();

  if (!conflicts.length) {
    console.log('No conflicts found.');
    return;
  }

  const rl = readline.createInterface({ input, output });

  let resolvedCount = 0;
  const remaining = [];

  try {
    for (let i = 0; i < conflicts.length; i++) {
      const conflict = conflicts[i];
      printConflict(conflict, i, conflicts.length);

      const result = await resolveOneConflict(conflict, rl);

      if (result.quit) {
        remaining.push(...conflicts.slice(i));
        break;
      }

      if (result.resolved) {
        resolvedCount++;
        if (result.resolution) {
          resolutions.push(result.resolution);
        }
      } else {
        remaining.push(conflict);
      }
    }
  } finally {
    rl.close();
  }

  saveConflicts(remaining);
  saveResolutions(resolutions);

  console.log('\n--- RESOLUTION SUMMARY ---');
  console.log(`Resolved: ${resolvedCount}`);
  console.log(`Remaining: ${remaining.length}`);
  console.log(`Conflict file: ${CONFLICTS_PATH}`);
  console.log(`Resolution report: ${RESOLUTIONS_PATH}`);

  await pool.end();
}

run().catch(async (err) => {
  console.error('resolveConflicts failed:', err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
