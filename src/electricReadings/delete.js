import prisma from '../db/prismaClient.js';

/**
 * Hard delete a reading by UUID.
 * @param {string} readingUuid
 */
export async function deleteElectricReading(readingUuid) {
  return await prisma.electric_readings.delete({
    where: { uuid: readingUuid },
  });
}
