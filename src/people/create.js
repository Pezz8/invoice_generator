import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new person.
 * @param {Object} personData - { name, email }
 */
export async function createPerson(personData) {
  return await prisma.people.create({
    data: {
      uuid: randomUUID(),
      ...personData,
    },
  });
}
