import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Register a new bike.
 * @param {Object} bikeData - Required fields: person_uuid, unit_uuid, spot_uuid, make_model, color, fee_paid_date
 */
export async function createBikeRegistration(bikeData) {
  return await prisma.bike_registrations.create({
    data: {
      uuid: randomUUID(),
      ...bikeData,
    },
  });
}
