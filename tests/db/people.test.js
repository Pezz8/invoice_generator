import {
  beginTransaction,
  rollbackTransaction,
  closeDb,
  pool,
} from '../setup/dbTestUtils.js';

beforeEach(async () => {
  await beginTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  await closeDb();
});

describe('people table', () => {
  test('should create a valid person', async () => {
    const result = await pool.query(
      `
        INSERT INTO people (full_name, email)
        VALUES ($1, $2)
        RETURNING *
      `,
      ['Cristian Guarino', 'cris@example.com']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].full_name).toBe('Cristian Guarino');
    expect(result.rows[0].email).toBe('cris@example.com');
  });

  test('should require full_name', async () => {
    await expect(
      pool.query(
        `
          INSERT INTO people (full_name, email)
          VALUES ($1, $2)
        `,
        [null, 'cris@example.com']
      )
    ).rejects.toThrow();
  });

  test('should allow email to be null', async () => {
    const result = await pool.query(
      `
        INSERT INTO people (full_name, email)
        VALUES ($1, $2)
        RETURNING *
      `,
      ['Maria Rossi', null]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].email).toBeNull();
  });

  test('should allow duplicate email addresses', async () => {
    await pool.query(
      `
        INSERT INTO people (full_name, email)
        VALUES ($1, $2)
      `,
      ['Cristian Guarino', 'shared@example.com']
    );

    const result = await pool.query(
      `
        INSERT INTO people (full_name, email)
        VALUES ($1, $2)
        RETURNING *
      `,
      ['Maria Rossi', 'shared@example.com']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].email).toBe('shared@example.com');
  });
});
