import {
  beginTransaction,
  rollbackTransaction,
  closeDb,
  pool,
} from '../../../setup/dbTestUtils.js';
import {
  create,
  getById,
  getByUnitNumber,
  getAll,
  update,
  remove,
} from '../../../../src/db/queries/units/units.js';

beforeEach(async () => {
  await beginTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  await closeDb();
});

describe('units create query', () => {
  test('should create a unit successfully', async () => {
    const result = await create({
      unitNumber: '301',
      unitType: 'RESIDENTIAL',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.unit_number).toBe('301');
    expect(result.unit_type).toBe('RESIDENTIAL');
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });

  test('should persist the created unit in the database', async () => {
    const created = await create({
      unitNumber: '302',
      unitType: 'COMMERCIAL',
    });

    const dbResult = await pool.query(
      `
        SELECT *
        FROM units
        WHERE id = $1
      `,
      [created.id]
    );

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].unit_number).toBe('302');
    expect(dbResult.rows[0].unit_type).toBe('COMMERCIAL');
  });

  test('should reject an invalid unit type', async () => {
    await expect(
      create({
        unitNumber: '303',
        unitType: 'INVALID_TYPE',
      })
    ).rejects.toThrow();
  });

  test('should reject a duplicate unit number', async () => {
    await create({
      unitNumber: '304',
      unitType: 'PUBLIC_HOUSING',
    });

    await expect(
      create({
        unitNumber: '304',
        unitType: 'RESIDENTIAL',
      })
    ).rejects.toThrow();
  });
});

describe('units read query', () => {
  test('getById should return the matching unit', async () => {
    const created = await create({
      unitNumber: '401',
      unitType: 'RESIDENTIAL',
    });

    const result = await getById(created.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(created.id);
    expect(result.unit_number).toBe('401');
    expect(result.unit_type).toBe('RESIDENTIAL');
  });

  test('getById should return null when the unit does not exist', async () => {
    const result = await getById('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
  });

  test('getByUnitNumber should return the matching unit', async () => {
    const created = await create({
      unitNumber: '402',
      unitType: 'COMMERCIAL',
    });

    const result = await getByUnitNumber('402');

    expect(result).toBeDefined();
    expect(result.id).toBe(created.id);
    expect(result.unit_number).toBe('402');
    expect(result.unit_type).toBe('COMMERCIAL');
  });

  test('getByUnitNumber should return null when the unit does not exist', async () => {
    const result = await getByUnitNumber('9999');

    expect(result).toBeNull();
  });

  test('getAll should return all created units ordered by unit_number', async () => {
    await create({
      unitNumber: '405',
      unitType: 'PUBLIC_HOUSING',
    });

    await create({
      unitNumber: '403',
      unitType: 'RESIDENTIAL',
    });

    await create({
      unitNumber: '404',
      unitType: 'COMMERCIAL',
    });

    const result = await getAll();

    expect(result).toHaveLength(3);
    expect(result.map((unit) => unit.unit_number)).toEqual([
      '403',
      '404',
      '405',
    ]);
  });
});

describe('units delete query', () => {
  test('should delete an existing unit and return the deleted row', async () => {
    const created = await create({
      unitNumber: '601',
      unitType: 'RESIDENTIAL',
    });

    const result = await remove(created.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(created.id);
    expect(result.unit_number).toBe('601');
    expect(result.unit_type).toBe('RESIDENTIAL');
  });

  test('should remove the unit from the database', async () => {
    const created = await create({
      unitNumber: '602',
      unitType: 'COMMERCIAL',
    });

    await remove(created.id);

    const dbResult = await pool.query(
      `
        SELECT *
        FROM units
        WHERE id = $1
      `,
      [created.id]
    );

    expect(dbResult.rows).toHaveLength(0);
  });

  test('should return null when deleting a non-existent unit', async () => {
    const result = await remove('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
  });
});

describe('units update query', () => {
  test('should update unit_number and unit_type', async () => {
    const created = await create({
      unitNumber: '501',
      unitType: 'RESIDENTIAL',
    });

    const result = await update(created.id, {
      unitNumber: '502',
      unitType: 'COMMERCIAL',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(created.id);
    expect(result.unit_number).toBe('502');
    expect(result.unit_type).toBe('COMMERCIAL');
  });

  test('should persist the updated values in the database', async () => {
    const created = await create({
      unitNumber: '503',
      unitType: 'PUBLIC_HOUSING',
    });

    await update(created.id, {
      unitNumber: '504',
      unitType: 'RESIDENTIAL',
    });

    const dbResult = await pool.query(
      `
        SELECT *
        FROM units
        WHERE id = $1
      `,
      [created.id]
    );

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].unit_number).toBe('504');
    expect(dbResult.rows[0].unit_type).toBe('RESIDENTIAL');
  });

  test('should return null when updating a non-existent unit', async () => {
    const result = await update('00000000-0000-0000-0000-000000000000', {
      unitNumber: '505',
      unitType: 'COMMERCIAL',
    });

    expect(result).toBeNull();
  });

  test('should reject an invalid unit type', async () => {
    const created = await create({
      unitNumber: '506',
      unitType: 'RESIDENTIAL',
    });

    await expect(
      update(created.id, {
        unitType: 'INVALID_TYPE',
      })
    ).rejects.toThrow();
  });

  test('should reject a duplicate unit number', async () => {
    await create({
      unitNumber: '507',
      unitType: 'RESIDENTIAL',
    });

    const otherUnit = await create({
      unitNumber: '508',
      unitType: 'COMMERCIAL',
    });

    await expect(
      update(otherUnit.id, {
        unitNumber: '507',
      })
    ).rejects.toThrow();
  });

  test('should throw when no update fields are provided', async () => {
    const created = await create({
      unitNumber: '509',
      unitType: 'PUBLIC_HOUSING',
    });

    await expect(update(created.id, {})).rejects.toThrow(
      'No fields provided for update.'
    );
  });
});
