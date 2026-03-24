import pool from '../../client.js';

export async function create(data) {
  const { firstName, middleName = null, lastName, email = null } = data ?? {};

  const result = await pool.query(
    `
      INSERT INTO people (first_name, middle_name, last_name, email)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [firstName, middleName, lastName, email]
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
      ORDER BY last_name ASC, first_name ASC, middle_name ASC NULLS LAST
    `
  );

  return result.rows;
}

export async function update(id, updates = {}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.firstName !== undefined) {
    fields.push(`first_name = $${index++}`);
    values.push(updates.firstName);
  }

  if (updates.middleName !== undefined) {
    fields.push(`middle_name = $${index++}`);
    values.push(updates.middleName);
  }

  if (updates.lastName !== undefined) {
    fields.push(`last_name = $${index++}`);
    values.push(updates.lastName);
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
