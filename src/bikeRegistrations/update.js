import prisma from '../db/prismaClient.js';

/**
 * Update a bike registration by UUID.
 * @param {string} bikeUuid - UUID of the bike registration
 * @param {Object} updates - Fields to update
 */
export async function updateBikeRegistration(bikeUuid, updates) {
  return await prisma.bikeRegistrations.update({
    where: { uuid: bikeUuid },
    data: updates,
  });
}
