import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new bike spot.
 * @param {Object} spotData - Required: spot_number, rack_position
 */
export async function createBikeSpot(spotData) {
  return await prisma.bike_spots.create({
    data: {
      uuid: randomUUID(),
      ...spotData,
    },
  });
}
