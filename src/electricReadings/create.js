import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new reading for a meter.
 * @param {Object} readingData - { meterUuid, readingDate, readingValue }
 */
export async function createElectricReading(
  meterUuid,
  readingDate,
  readingValue
) {
  return prisma.electricReadings.create({
    data: {
      uuid: randomUUID(),
      meterUuid,
      readingDate,
      readingValue,
    },
  });
}
