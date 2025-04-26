import prisma from '../db/prismaClient.js';

/**
 * Update a bike spot by UUID.
 * @param {string} spotUuid - UUID of the bike spot
 * @param {Object} updates - Fields to update
 */
export async function updateBikeSpot(spotUuid, updates) {
  return await prisma.bike_spots.update({
    where: { uuid: spotUuid },
    data: updates,
  });
}
