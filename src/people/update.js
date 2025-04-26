import prisma from '../db/prismaClient.js';

/**
 * Update a person's info by UUID.
 * @param {string} personUuid - UUID of the person
 * @param {Object} updates - Fields to update (ex: { name: "John Doe" })
 */
export async function updatePerson(personUuid, updates) {
  return await prisma.people.update({
    where: { uuid: personUuid },
    data: updates,
  });
}
