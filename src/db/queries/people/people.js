import pool from '../../client.js';

export async function create(data) {
  const { fullName, email = null } = data ?? {};

  const result = await pool.query(
    `
      INSERT INTO people (full_name, email)
      VALUES ($1, $2)
      RETURNING *
    `,
    [fullName, email]
  );

  return result.rows[0];
}

export async function getById(id) {
  const result = await pool.query(
    `
      SELECT *
      FROM people
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
      FROM people
      ORDER BY full_name ASC
    `
  );

  return result.rows;
}

export async function update(id, updates = {}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.fullName !== undefined) {
    fields.push(`full_name = $${index++}`);
    values.push(updates.fullName);
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(updates.email);
  }

  if (!fields.length) {
    throw new Error('No fields provided for update.');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `
      UPDATE people
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
      DELETE FROM people
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
