import prisma from '../../db/prismaClient.js';
import {
  getAllPeople,
  getPersonByEmail,
  getPersonByUUID,
  getActivePeople,
} from '../queries.js';

describe('people queries', () => {
  let activePerson, inactivePerson;

  beforeEach(async () => {
    activePerson = await prisma.people.create({
      data: {
        uuid: crypto.randomUUID(),
        name: 'John Active',
        email: 'john.active@example.com',
        active: true,
      },
    });

    inactivePerson = await prisma.people.create({
      data: {
        uuid: crypto.randomUUID(),
        name: 'Jane Inactive',
        email: 'jane.inactive@example.com',
        active: false,
      },
    });
  });

  afterEach(async () => {
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('getAllPeople should return all people', async () => {
    const people = await getAllPeople();
    const emails = people.map((p) => p.email);
    expect(emails).toContain('john.active@example.com');
    expect(emails).toContain('jane.inactive@example.com');
  });

  test('getPersonByEmail should return the correct person', async () => {
    const person = await getPersonByEmail('john.active@example.com');
    expect(person).not.toBeNull();
    expect(person.name).toBe('John Active');
  });

  test('getPersonByUUID should return the correct person', async () => {
    const person = await getPersonByUUID(activePerson.uuid);
    expect(person).not.toBeNull();
    expect(person.email).toBe('john.active@example.com');
  });

  test('getActivePeople should return only active people', async () => {
    const activePeople = await getActivePeople();
    expect(activePeople.length).toBe(1);
    expect(activePeople[0].email).toBe('john.active@example.com');
  });
});
