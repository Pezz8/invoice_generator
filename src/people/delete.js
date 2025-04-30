import prisma from '../db/prismaClient.js';

/**
 * Hard delete a person by UUID.
 * @param {string} personUuid - UUID of the person
 */
export async function deletePerson(personUuid) {
  return await prisma.people.delete({
    where: { uuid: personUuid },
  });
}

/**
 * Soft delete a person by UUID (mark as inactive).
 * @param {string} personUuid - UUID of the person
 */
export async function softDeletePerson(personUuid) {
  return await prisma.people.update({
    where: { uuid: personUuid },
    data: { active: false },
  });
}
