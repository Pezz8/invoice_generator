import pool from '../../client.js';

export async function create(data) {
  const { unitId, personId, occupantType } = data ?? {};

  const result = await pool.query(
    `
      INSERT INTO unit_people (unit_id, person_id, occupant_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [unitId, personId, occupantType]
  );

  return result.rows[0];
}

export async function getById(id) {
  const result = await pool.query(
    `
      SELECT *
      FROM unit_people
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function getAll() {
  const result = await pool.query(
    `
      SELECT *
      FROM unit_people
      ORDER BY unit_id ASC, person_id ASC, occupant_type ASC
    `
  );

  return result.rows;
}

export async function update(id, updates = {}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.unitId !== undefined) {
    fields.push(`unit_id = $${index++}`);
    values.push(updates.unitId);
  }

  if (updates.personId !== undefined) {
    fields.push(`person_id = $${index++}`);
    values.push(updates.personId);
  }

  if (updates.occupantType !== undefined) {
    fields.push(`occupant_type = $${index++}`);
    values.push(updates.occupantType);
  }

  if (!fields.length) {
    throw new Error('No fields provided for update.');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `
      UPDATE unit_people
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return result.rows[0] ?? null;
}

export async function remove(id) {
  const result = await pool.query(
    `
      DELETE FROM unit_people
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
