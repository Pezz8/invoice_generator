import prisma from '../db/prismaClient.js';

/**
 * Soft delete an electric meter (set active = false).
 * @param {string} meterUuid
 */
export async function softDeleteElectricMeter(meterUuid) {
  return await prisma.electric_meters.update({
    where: { uuid: meterUuid },
    data: { active: false },
  });
}
