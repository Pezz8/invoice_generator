import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new electric meter linked to a unit.
 * @param {Object} meterData - { unitUuid, meterName }
 */
export async function createElectricMeter(meterData) {
  return await prisma.electric_meters.create({
    data: {
      uuid: randomUUID(),
      unitUuid,
      meterName,
    },
  });
}
