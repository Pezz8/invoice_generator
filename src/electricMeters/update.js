import prisma from '../db/prismaClient.js';

/**
 * Update an electric meter by UUID.
 * @param {string} meterUuid
 * @param {Object} updates
 */
export async function updateElectricMeter(meterUuid, updates) {
  return await prisma.electric_meters.update({
    where: { uuid: meterUuid },
    data: updates,
  });
}
