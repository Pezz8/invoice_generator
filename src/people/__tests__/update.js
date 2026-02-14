import { updatePerson } from '../update.js';
import { createPerson } from '../create.js';
import { getPersonByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updatePerson', () => {
  let person;

  beforeEach(async () => {
    person = await createPerson({
      name: 'Initial Name',
      email: 'initial@example.com',
    });
  });

  afterEach(async () => {
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the name of a person', async () => {
    await updatePerson(person.uuid, { name: 'Updated Name' });
    const updated = await getPersonByUUID(person.uuid);
    expect(updated.name).toBe('Updated Name');
    expect(updated.email).toBe('initial@example.com'); // unchanged
  });

  test('should update the active flag of a person', async () => {
    await updatePerson(person.uuid, { active: false });
    const updated = await getPersonByUUID(person.uuid);
    expect(updated.active).toBe(false);
  });
});
