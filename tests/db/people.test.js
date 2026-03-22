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
        INSERT INTO people (first_name, middle_name, last_name, email)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      ['Cristian', 'A', 'Guarino', 'cris@example.com']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].first_name).toBe('Cristian');
    expect(result.rows[0].middle_name).toBe('A');
    expect(result.rows[0].last_name).toBe('Guarino');
    expect(result.rows[0].email).toBe('cris@example.com');
  });

  test('should allow middle_name to be null', async () => {
    const result = await pool.query(
      `
        INSERT INTO people (first_name, middle_name, last_name, email)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      ['Cristian', null, 'Guarino', 'cris@example.com']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].middle_name).toBeNull();
  });

  test('should require first_name', async () => {
    await expect(
      pool.query(
        `
          INSERT INTO people (first_name, middle_name, last_name, email)
          VALUES ($1, $2, $3, $4)
        `,
        [null, null, 'Guarino', 'cris@example.com']
      )
    ).rejects.toThrow();
  });

  test('should require last_name', async () => {
    await expect(
      pool.query(
        `
          INSERT INTO people (first_name, middle_name, last_name, email)
          VALUES ($1, $2, $3, $4)
        `,
        ['Cristian', null, null, 'cris@example.com']
      )
    ).rejects.toThrow();
  });

  test('should allow duplicate email addresses', async () => {
    await pool.query(
      `
        INSERT INTO people (first_name, middle_name, last_name, email)
        VALUES ($1, $2, $3, $4)
      `,
      ['Cristian', null, 'Guarino', 'shared@example.com']
    );

    const result = await pool.query(
      `
        INSERT INTO people (first_name, middle_name, last_name, email)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      ['Maria', null, 'Rossi', 'shared@example.com']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].email).toBe('shared@example.com');
  });
});
