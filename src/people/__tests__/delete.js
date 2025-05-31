import { createPerson } from '../create.js';
import { deletePerson, softDeletePerson } from '../delete.js';
import { getPersonByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('deletePerson functions', () => {
  let person;

  beforeEach(async () => {
    person = await createPerson({
      name: 'Test Delete User',
      email: 'delete@example.com',
    });
  });

  afterEach(async () => {
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should hard delete a person', async () => {
    await deletePerson(person.uuid);
    const result = await getPersonByUUID(person.uuid);
    expect(result).toBeNull();
  });

  test('should soft delete a person (mark as inactive)', async () => {
    await softDeletePerson(person.uuid);
    const result = await getPersonByUUID(person.uuid);
    expect(result).not.toBeNull();
    expect(result.active).toBe(false);
  });
});
