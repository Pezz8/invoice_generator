import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new electric meter linked to a unit.
 * @param {Object} meterData - { unit_uuid, meter_name }
 */
export async function createElectricMeter(meterData) {
  return await prisma.electric_meters.create({
    data: {
      uuid: randomUUID(),
      ...meterData,
    },
  });
}
