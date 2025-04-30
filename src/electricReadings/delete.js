import prisma from '../db/prismaClient.js';

/**
 * Hard delete a reading by UUID.
 * @param {string} readingUuid
 */
export async function deleteElectricReading(readingUuid) {
  return await prisma.electricReadings.delete({
    where: { uuid: readingUuid },
  });
}
