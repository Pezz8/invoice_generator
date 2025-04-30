import prisma from '../db/prismaClient.js';

/**
 * Hard delete a bike spot by UUID.
 * @param {string} spotUuid - UUID of the bike spot
 */
export async function deleteBikeSpot(spotUuid) {
  return await prisma.bikeSpots.delete({
    where: { uuid: spotUuid },
  });
}
