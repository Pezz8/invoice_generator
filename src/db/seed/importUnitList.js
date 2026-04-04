import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname;
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

import { create as createUnit } from '../queries/units/units.js';
import { create as createUnitPeople } from '../queries/unitPeople/unitPeople.js';
import resolvePerson from './helpers/resolvePerson.js';
import normalizeString from './helpers/normalizeString.js';
import normalizeOccupantType from './helpers/normalizeOccupantType.js';
import { addressBookPath } from '../../../config.js';
import pool from '../client.js';

const FILE_PATH = addressBookPath;
const CONFLICTS_PATH = path.resolve(
  PROJECT_ROOT,
  'database/seed/import-conflicts.json'
);

async function findUnitByNumber(unitNumber) {
  const result = await pool.query(
    `SELECT * FROM units WHERE unit_number = $1`,
    [unitNumber]
  );

  return result.rows[0] || null;
}

async function createRelationshipSafe({ unitId, personId, occupantType }) {
  try {
    return await createUnitPeople({
      unitId,
      personId,
      occupantType,
    });
  } catch (err) {
    // assume duplicate constraint
    if (err.code === '23505') {
      return null;
    }
    throw err;
  }
}

async function runImport() {
  console.log('FILE_PATH:', FILE_PATH);
  console.log('exists:', fs.existsSync(FILE_PATH));
  console.log('isFile:', fs.statSync(FILE_PATH).isFile());

  const fileBuffer = fs.readFileSync(FILE_PATH);
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const conflicts = [];

  let processed = 0;
  let unitsCreated = 0;
  let peopleCreated = 0;
  let relationshipsCreated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // account for header row

    const unitNumber = normalizeString(row['Unit']);
    const fullName = row['Name']?.trim();
    const email = row['Email Address']?.trim() || null;
    const occupantType = normalizeOccupantType(row['Occupant Type']);

    if (!unitNumber || !fullName || !occupantType) {
      skipped++;
      continue;
    }

    processed++;

    let unit = await findUnitByNumber(unitNumber);

    if (!unit) {
      unit = await createUnit({
        unitNumber,
        unitType: 'RESIDENTIAL',
      });
      unitsCreated++;
    }

    const personResult = await resolvePerson({
      fullName,
      email,
      rowNumber,
      unitNumber,
      occupantType,
      conflicts,
    });

    if (personResult.status === 'conflict') {
      skipped++;
      continue;
    }

    if (personResult.status === 'created') {
      peopleCreated++;
    }

    const relationship = await createRelationshipSafe({
      unitId: unit.id,
      personId: personResult.person.id,
      occupantType,
    });

    if (relationship) {
      relationshipsCreated++;
    }
  }

  fs.mkdirSync(path.dirname(CONFLICTS_PATH), { recursive: true });
  if (conflicts.length) {
    fs.writeFileSync(CONFLICTS_PATH, JSON.stringify(conflicts, null, 2));
  }

  console.log('--- IMPORT SUMMARY ---');
  console.log(`Processed: ${processed}`);
  console.log(`Units created: ${unitsCreated}`);
  console.log(`People created: ${peopleCreated}`);
  console.log(`Relationships created: ${relationshipsCreated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Conflicts: ${conflicts.length}`);

  if (conflicts.length) {
    console.log(`Conflict file: ${CONFLICTS_PATH}`);
  }
}

runImport().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
