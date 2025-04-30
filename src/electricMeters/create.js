import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new electric meter linked to a unit.
 * @param {Object} meterData - { unitUuid, meterName }
 */
export async function createElectricMeter(meterData) {
  return await prisma.electricMeters.create({
    data: {
      uuid: randomUUID(),
      ...meterData,
    },
  });
}
