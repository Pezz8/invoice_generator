import { createPerson } from '../create.js';
import prisma from '../../db/prismaClient.js';

describe('createPerson', () => {
  afterEach(async () => {
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a new person with a name and email', async () => {
    const personData = {
      name: 'Alice Example',
      email: 'alice@example.com',
    };

    const result = await createPerson(personData);

    expect(result).toHaveProperty('uuid');
    expect(result.name).toBe('Alice Example');
    expect(result.email).toBe('alice@example.com');
  });
});
