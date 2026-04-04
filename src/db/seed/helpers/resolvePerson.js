import pool from '../../client.js';
import { create as createPerson } from '../../queries/people/people.js';
import normalizeString from './normalizeString.js';

function buildConflict({
  rowNumber,
  unitNumber,
  occupantType,
  incoming,
  matches,
}) {
  return {
    type: 'PERSON_NAME_EMAIL_CONFLICT',
    rowNumber,
    unitNumber,
    occupantType,
    incoming,
    matches: matches.map((match) => ({
      id: match.id,
      fullName: match.full_name,
      email: match.email,
    })),
  };
}

export default async function resolvePerson({
  fullName,
  email = null,
  rowNumber = null,
  unitNumber = null,
  occupantType = null,
  conflicts = [],
}) {
  const normalizedFullName = normalizeString(fullName);
  const normalizedEmail = normalizeString(email);

  if (!normalizedFullName) {
    throw new Error('resolvePerson requires a fullName value.');
  }

  if (normalizedEmail) {
    const byEmailResult = await pool.query(
      `
        SELECT *
        FROM people
        WHERE LOWER(TRIM(email)) = $1
        ORDER BY full_name ASC
      `,
      [normalizedEmail]
    );

    if (byEmailResult.rows.length === 0) {
      const person = await createPerson({
        fullName,
        email,
      });

      return { status: 'created', person };
    }

    const exactNameMatch = byEmailResult.rows.find(
      (row) => normalizeString(row.full_name) === normalizedFullName
    );

    if (exactNameMatch) {
      return { status: 'found', person: exactNameMatch };
    }

    conflicts.push(
      buildConflict({
        rowNumber,
        unitNumber,
        occupantType,
        incoming: {
          fullName,
          email,
        },
        matches: byEmailResult.rows,
      })
    );

    return { status: 'conflict', person: null };
  }

  const byNameResult = await pool.query(
    `
      SELECT *
      FROM people
      WHERE LOWER(TRIM(full_name)) = $1
      ORDER BY full_name ASC
    `,
    [normalizedFullName]
  );

  if (byNameResult.rows.length === 0) {
    const person = await createPerson({
      fullName,
      email,
    });

    return { status: 'created', person };
  }

  if (byNameResult.rows.length === 1) {
    return { status: 'found', person: byNameResult.rows[0] };
  }

  conflicts.push(
    buildConflict({
      rowNumber,
      unitNumber,
      occupantType,
      incoming: {
        fullName,
        email,
      },
      matches: byNameResult.rows,
    })
  );

  return { status: 'conflict', person: null };
}
