import {
  beginTransaction,
  rollbackTransaction,
  closeDb,
  pool,
} from '../../../setup/dbTestUtils.js';
import {
  create,
  getById,
  getAll,
  update,
  remove,
} from '../../../../src/db/queries/people/people.js';

beforeEach(async () => {
  await beginTransaction();
});

afterEach(async () => {
  await rollbackTransaction();
});

afterAll(async () => {
  await closeDb();
});

describe('people query module', () => {
  describe('create', () => {
    test('should create a person successfully', async () => {
      const result = await create({
        firstName: 'Cristian',
        middleName: 'A',
        lastName: 'Guarino',
        email: 'cris@example.com',
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.first_name).toBe('Cristian');
      expect(result.middle_name).toBe('A');
      expect(result.last_name).toBe('Guarino');
      expect(result.email).toBe('cris@example.com');
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    test('should allow middleName to be null', async () => {
      const result = await create({
        firstName: 'Maria',
        lastName: 'Rossi',
        email: 'maria@example.com',
      });

      expect(result).toBeDefined();
      expect(result.middle_name).toBeNull();
    });

    test('should persist the created person in the database', async () => {
      const created = await create({
        firstName: 'John',
        middleName: 'B',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      const dbResult = await pool.query(
        `
          SELECT *
          FROM people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].first_name).toBe('John');
      expect(dbResult.rows[0].middle_name).toBe('B');
      expect(dbResult.rows[0].last_name).toBe('Doe');
      expect(dbResult.rows[0].email).toBe('john@example.com');
    });

    test('should reject when firstName is missing', async () => {
      await expect(
        create({
          middleName: 'A',
          lastName: 'Guarino',
          email: 'cris@example.com',
        })
      ).rejects.toThrow();
    });

    test('should reject when lastName is missing', async () => {
      await expect(
        create({
          firstName: 'Cristian',
          middleName: 'A',
          email: 'cris@example.com',
        })
      ).rejects.toThrow();
    });

    test('should allow duplicate email addresses', async () => {
      await create({
        firstName: 'Cristian',
        lastName: 'Guarino',
        email: 'shared@example.com',
      });

      const result = await create({
        firstName: 'Maria',
        lastName: 'Rossi',
        email: 'shared@example.com',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('shared@example.com');
    });
  });

  describe('read', () => {
    test('getById should return the matching person', async () => {
      const created = await create({
        firstName: 'Alice',
        middleName: 'C',
        lastName: 'Brown',
        email: 'alice@example.com',
      });

      const result = await getById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.first_name).toBe('Alice');
      expect(result.middle_name).toBe('C');
      expect(result.last_name).toBe('Brown');
      expect(result.email).toBe('alice@example.com');
    });

    test('getById should return null when the person does not exist', async () => {
      const result = await getById('00000000-0000-0000-0000-000000000000');

      expect(result).toBeNull();
    });

    test('getAll should return all created people ordered by last, first, middle', async () => {
      await create({
        firstName: 'Zoe',
        middleName: null,
        lastName: 'Adams',
        email: 'zoe@example.com',
      });

      await create({
        firstName: 'Aaron',
        middleName: 'B',
        lastName: 'Adams',
        email: 'aaron@example.com',
      });

      await create({
        firstName: 'Mark',
        middleName: null,
        lastName: 'Zimmer',
        email: 'mark@example.com',
      });

      const result = await getAll();

      expect(result).toHaveLength(3);
      expect(
        result.map((person) => [
          person.last_name,
          person.first_name,
          person.middle_name,
        ])
      ).toEqual([
        ['Adams', 'Aaron', 'B'],
        ['Adams', 'Zoe', null],
        ['Zimmer', 'Mark', null],
      ]);
    });
  });

  describe('update', () => {
    test('should update first_name, middle_name, last_name, and email', async () => {
      const created = await create({
        firstName: 'Old',
        middleName: 'M',
        lastName: 'Name',
        email: 'old@example.com',
      });

      const result = await update(created.id, {
        firstName: 'New',
        middleName: 'Middle',
        lastName: 'Person',
        email: 'new@example.com',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.first_name).toBe('New');
      expect(result.middle_name).toBe('Middle');
      expect(result.last_name).toBe('Person');
      expect(result.email).toBe('new@example.com');
    });

    test('should allow middleName to be updated to null', async () => {
      const created = await create({
        firstName: 'Jane',
        middleName: 'Q',
        lastName: 'Public',
        email: 'jane@example.com',
      });

      const result = await update(created.id, {
        middleName: null,
      });

      expect(result).toBeDefined();
      expect(result.middle_name).toBeNull();
    });

    test('should persist the updated values in the database', async () => {
      const created = await create({
        firstName: 'Tom',
        middleName: 'R',
        lastName: 'Smith',
        email: 'tom@example.com',
      });

      await update(created.id, {
        firstName: 'Thomas',
        lastName: 'Smithers',
      });

      const dbResult = await pool.query(
        `
          SELECT *
          FROM people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].first_name).toBe('Thomas');
      expect(dbResult.rows[0].last_name).toBe('Smithers');
    });

    test('should return null when updating a non-existent person', async () => {
      const result = await update('00000000-0000-0000-0000-000000000000', {
        firstName: 'Ghost',
      });

      expect(result).toBeNull();
    });

    test('should throw when no update fields are provided', async () => {
      const created = await create({
        firstName: 'No',
        lastName: 'Changes',
        email: 'nochanges@example.com',
      });

      await expect(update(created.id, {})).rejects.toThrow(
        'No fields provided for update.'
      );
    });
  });

  describe('delete', () => {
    test('should delete an existing person and return the deleted row', async () => {
      const created = await create({
        firstName: 'Delete',
        middleName: 'X',
        lastName: 'Me',
        email: 'delete@example.com',
      });

      const result = await remove(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.first_name).toBe('Delete');
      expect(result.middle_name).toBe('X');
      expect(result.last_name).toBe('Me');
      expect(result.email).toBe('delete@example.com');
    });

    test('should remove the person from the database', async () => {
      const created = await create({
        firstName: 'Gone',
        lastName: 'Soon',
        email: 'gone@example.com',
      });

      await remove(created.id);

      const dbResult = await pool.query(
        `
          SELECT *
          FROM people
          WHERE id = $1
        `,
        [created.id]
      );

      expect(dbResult.rows).toHaveLength(0);
    });

    test('should return null when deleting a non-existent person', async () => {
      const result = await remove('00000000-0000-0000-0000-000000000000');

      expect(result).toBeNull();
    });
  });
});
