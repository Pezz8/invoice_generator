import {
  beginTransaction,
  rollbackTransaction,
  closeDb,
  pool,
} from '../setup/dbTestUtils.js';
import { create as createUnit } from '../../src/db/queries/units/units.js';
import { create as createPerson } from '../../src/db/queries/people/people.js';
import {
  create,
  getById,
  getAll,
  update,
  remove,
} from '../../src/db/queries/unitPeople/unitPeople.js';

beforeEach(async () => {
  await beginTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  await closeDb();
});

async function createDependencies({
  unitNumber = '701',
  unitType = 'RESIDENTIAL',
  fullName = 'Cristian Guarino',
  email = 'cris@example.com',
} = {}) {
  const unit = await createUnit({
    unitNumber,
    unitType,
  });

  const person = await createPerson({
    fullName,
    email,
  });

  return { unit, person };
}

describe('unitPeople query module', () => {
  describe('create', () => {
    test('should create a valid unit-person relationship', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '701',
        email: 'owner701@example.com',
      });

      const result = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'OWNER',
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.unit_id).toBe(unit.id);
      expect(result.person_id).toBe(person.id);
      expect(result.occupant_type).toBe('OWNER');
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    test('should persist the created relationship in the database', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '702',
        email: 'tenant702@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'TENANT',
      });

      const dbResult = await pool.query(
        `
          SELECT *
          FROM unit_people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].unit_id).toBe(unit.id);
      expect(dbResult.rows[0].person_id).toBe(person.id);
      expect(dbResult.rows[0].occupant_type).toBe('TENANT');
    });

    test('should reject an invalid occupantType', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '703',
        email: 'invalid703@example.com',
      });

      await expect(
        create({
          unitId: unit.id,
          personId: person.id,
          occupantType: 'INVALID_TYPE',
        })
      ).rejects.toThrow();
    });

    test('should reject an invalid unitId foreign key', async () => {
      const { person } = await createDependencies({
        unitNumber: '704',
        email: 'badunit704@example.com',
      });

      await expect(
        create({
          unitId: '00000000-0000-0000-0000-000000000000',
          personId: person.id,
          occupantType: 'MANAGER',
        })
      ).rejects.toThrow();
    });

    test('should reject an invalid personId foreign key', async () => {
      const { unit } = await createDependencies({
        unitNumber: '705',
        email: 'badperson705@example.com',
      });

      await expect(
        create({
          unitId: unit.id,
          personId: '00000000-0000-0000-0000-000000000000',
          occupantType: 'TENANT',
        })
      ).rejects.toThrow();
    });

    test('should reject a duplicate unit-person-occupantType combination', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '706',
        email: 'duplicate706@example.com',
      });

      await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'OWNER',
      });

      await expect(
        create({
          unitId: unit.id,
          personId: person.id,
          occupantType: 'OWNER',
        })
      ).rejects.toThrow();
    });
  });

  describe('read', () => {
    test('getById should return the matching relationship', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '707',
        email: 'read707@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'MANAGER',
      });

      const result = await getById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.unit_id).toBe(unit.id);
      expect(result.person_id).toBe(person.id);
      expect(result.occupant_type).toBe('MANAGER');
    });

    test('getById should return null when the relationship does not exist', async () => {
      const result = await getById('00000000-0000-0000-0000-000000000000');

      expect(result).toBeNull();
    });

    test('getAll should return all created relationships ordered by unit_id, person_id, occupant_type', async () => {
      const deps1 = await createDependencies({
        unitNumber: '708',
        email: 'a708@example.com',
        fullName: 'A Alpha',
      });
      const deps2 = await createDependencies({
        unitNumber: '709',
        email: 'b709@example.com',
        fullName: 'B Beta',
      });
      const deps3 = await createDependencies({
        unitNumber: '710',
        email: 'c710@example.com',
        fullName: 'C Gamma',
      });

      const rel1 = await create({
        unitId: deps2.unit.id,
        personId: deps2.person.id,
        occupantType: 'TENANT',
      });
      const rel2 = await create({
        unitId: deps1.unit.id,
        personId: deps1.person.id,
        occupantType: 'OWNER',
      });
      const rel3 = await create({
        unitId: deps3.unit.id,
        personId: deps3.person.id,
        occupantType: 'MANAGER',
      });

      const result = await getAll();

      expect(result).toHaveLength(3);

      const expected = [rel1, rel2, rel3]
        .map((row) => ({
          id: row.id,
          unit_id: row.unit_id,
          person_id: row.person_id,
          occupant_type: row.occupant_type,
        }))
        .sort((a, b) => {
          if (a.unit_id !== b.unit_id)
            return a.unit_id.localeCompare(b.unit_id);
          if (a.person_id !== b.person_id)
            return a.person_id.localeCompare(b.person_id);
          return a.occupant_type.localeCompare(b.occupant_type);
        });

      const actual = result.map((row) => ({
        id: row.id,
        unit_id: row.unit_id,
        person_id: row.person_id,
        occupant_type: row.occupant_type,
      }));

      expect(actual).toEqual(expected);
    });
  });

  describe('update', () => {
    test('should update unit_id, person_id, and occupant_type', async () => {
      const originalDeps = await createDependencies({
        unitNumber: '711',
        email: 'original711@example.com',
      });
      const replacementDeps = await createDependencies({
        unitNumber: '712',
        email: 'replacement712@example.com',
        fullName: 'Maria Rossi',
      });

      const created = await create({
        unitId: originalDeps.unit.id,
        personId: originalDeps.person.id,
        occupantType: 'TENANT',
      });

      const result = await update(created.id, {
        unitId: replacementDeps.unit.id,
        personId: replacementDeps.person.id,
        occupantType: 'OWNER',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.unit_id).toBe(replacementDeps.unit.id);
      expect(result.person_id).toBe(replacementDeps.person.id);
      expect(result.occupant_type).toBe('OWNER');
    });

    test('should persist the updated values in the database', async () => {
      const originalDeps = await createDependencies({
        unitNumber: '713',
        email: 'persist713@example.com',
      });
      const replacementDeps = await createDependencies({
        unitNumber: '714',
        email: 'persist714@example.com',
        fullName: 'John Doe',
      });

      const created = await create({
        unitId: originalDeps.unit.id,
        personId: originalDeps.person.id,
        occupantType: 'MANAGER',
      });

      await update(created.id, {
        unitId: replacementDeps.unit.id,
        personId: replacementDeps.person.id,
        occupantType: 'TENANT',
      });

      const dbResult = await pool.query(
        `
          SELECT *
          FROM unit_people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].unit_id).toBe(replacementDeps.unit.id);
      expect(dbResult.rows[0].person_id).toBe(replacementDeps.person.id);
      expect(dbResult.rows[0].occupant_type).toBe('TENANT');
    });

    test('should return null when updating a non-existent relationship', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '715',
        email: 'ghost715@example.com',
      });

      const result = await update('00000000-0000-0000-0000-000000000000', {
        unitId: unit.id,
        personId: person.id,
        occupantType: 'OWNER',
      });

      expect(result).toBeNull();
    });

    test('should reject an invalid occupantType during update', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '716',
        email: 'invalidupdate716@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'OWNER',
      });

      await expect(
        update(created.id, {
          occupantType: 'INVALID_TYPE',
        })
      ).rejects.toThrow();
    });

    test('should reject a duplicate unit-person-occupantType combination during update', async () => {
      const deps1 = await createDependencies({
        unitNumber: '717',
        email: 'dup717@example.com',
      });
      const deps2 = await createDependencies({
        unitNumber: '718',
        email: 'dup718@example.com',
      });

      await create({
        unitId: deps1.unit.id,
        personId: deps1.person.id,
        occupantType: 'OWNER',
      });

      const other = await create({
        unitId: deps2.unit.id,
        personId: deps2.person.id,
        occupantType: 'TENANT',
      });

      await expect(
        update(other.id, {
          unitId: deps1.unit.id,
          personId: deps1.person.id,
          occupantType: 'OWNER',
        })
      ).rejects.toThrow();
    });

    test('should throw when no update fields are provided', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '719',
        email: 'noupdate719@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'TENANT',
      });

      await expect(update(created.id, {})).rejects.toThrow(
        'No fields provided for update.'
      );
    });
  });

  describe('delete', () => {
    test('should delete an existing relationship and return the deleted row', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '720',
        email: 'delete720@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'OWNER',
      });

      const result = await remove(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.unit_id).toBe(unit.id);
      expect(result.person_id).toBe(person.id);
      expect(result.occupant_type).toBe('OWNER');
    });

    test('should remove the relationship from the database', async () => {
      const { unit, person } = await createDependencies({
        unitNumber: '721',
        email: 'gone721@example.com',
      });

      const created = await create({
        unitId: unit.id,
        personId: person.id,
        occupantType: 'MANAGER',
      });

      await remove(created.id);

      const dbResult = await pool.query(
        `
          SELECT *
          FROM unit_people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(0);
    });

    test('should return null when deleting a non-existent relationship', async () => {
      const result = await remove('00000000-0000-0000-0000-000000000000');

      expect(result).toBeNull();
    });
  });
});
