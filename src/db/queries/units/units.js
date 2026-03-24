import pool from '../../client.js';

export async function create(data) {
  const { unitNumber, unitType } = data ?? {};

  const result = await pool.query(
    `
      INSERT INTO units (unit_number, unit_type)
      VALUES ($1, $2)
      RETURNING *
    `,
    [unitNumber, unitType]
  );

  return result.rows[0];
}

export async function getById(id) {
  const result = await pool.query(
    `
      SELECT *
      FROM units
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function getByUnitNumber(unitNumber) {
  const result = await pool.query(
    `
      SELECT *
      FROM units
      WHERE unit_number = $1
    `,
    [unitNumber]
  );

  return result.rows[0] ?? null;
}

export async function getAll() {
  const result = await pool.query(
    `
      SELECT *
      FROM units
      ORDER BY unit_number ASC
    `
  );

  return result.rows;
}

export async function update(id, updates = {}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.unitNumber !== undefined) {
    fields.push(`unit_number = $${index++}`);
    values.push(updates.unitNumber);
  }

  if (updates.unitType !== undefined) {
    fields.push(`unit_type = $${index++}`);
    values.push(updates.unitType);
  }

  if (!fields.length) {
    throw new Error('No fields provided for update.');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `
      UPDATE units
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
      DELETE FROM units
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
