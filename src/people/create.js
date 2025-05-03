import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new person.
 * @param {Object} personData - { name, email }
 */
export async function createPerson(name, email) {
  return prisma.people.create({
    data: {
      uuid: randomUUID(),
      name,
      email,
    },
  });
}
