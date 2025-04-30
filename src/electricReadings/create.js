import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new reading for a meter.
 * @param {Object} readingData - { meterUuid, readingDate, readingValue }
 */
export async function createElectricReading(readingData) {
  return await prisma.electricReadings.create({
    data: {
      uuid: randomUUID(),
      ...readingData,
    },
  });
}
