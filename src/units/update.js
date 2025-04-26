import prisma from '../db/prismaClient.js';

/**
 * Update a unit by UUID.
 * @param {string} unitUuid - The UUID of the unit to update.
 * @param {Object} updates - The fields to update (ex: { unit_number: "100B" }).
 */
export async function updateUnit(unitUuid, updates) {
  return await prisma.units.update({
    where: { uuid: unitUuid },
    data: updates,
  });
}
