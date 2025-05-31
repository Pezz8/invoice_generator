import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Register a new bike.
 * @param {Object} bikeData - Required fields: personUuid, unitUuid, spotUuid, makeModel, color, feePaidDate
 */
export async function createBikeRegistration(bikeData) {
  return await prisma.bike_registrations.create({
    data: {
      uuid: randomUUID(),
      ...bikeData,
    },
  });
}
