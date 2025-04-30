import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new bike spot.
 * @param {Object} spotData - Required: spot_number, rack_position
 */
export async function createBikeSpot(spotData) {
  return await prisma.bikeSpots.create({
    data: {
      uuid: randomUUID(),
      ...spotData,
    },
  });
}
