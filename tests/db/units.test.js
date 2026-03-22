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

describe('units table', () => {
  test('should create a valid unit', async () => {
    const result = await pool.query(
      `
      INSERT INTO units (unit_number, unit_type)
      VALUES ($1, $2)
      RETURNING *
    `,
      ['101', 'RESIDENTIAL']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].unit_number).toBe('101');
  });

  test('should reject invalid unit_type', async () => {
    await expect(
      pool.query(
        `
        INSERT INTO units (unit_number, unit_type)
        VALUES ($1, $2)
      `,
        ['102', 'INVALID_TYPE']
      )
    ).rejects.toThrow();
  });

  test('should enforce unique unit_number', async () => {
    await pool.query(
      `
      INSERT INTO units (unit_number, unit_type)
      VALUES ($1, $2)
    `,
      ['103', 'RESIDENTIAL']
    );

    await expect(
      pool.query(
        `
        INSERT INTO units (unit_number, unit_type)
        VALUES ($1, $2)
      `,
        ['103', 'RESIDENTIAL']
      )
    ).rejects.toThrow();
  });
});
