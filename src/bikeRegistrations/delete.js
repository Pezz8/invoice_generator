import prisma from '../db/prismaClient.js';

/**
 * Soft delete a bike registration by UUID (marks it as inactive).
 * @param {string} bikeUuid - UUID of the bike registration
 */
export async function softDeleteBikeRegistration(bikeUuid) {
  return await prisma.bikeRegistrations.update({
    where: { uuid: bikeUuid },
    data: { active: false },
  });
}
