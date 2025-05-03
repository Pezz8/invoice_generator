import prisma from '../db/prismaClient.js';

/**
 * Hard delete a unit by UUID.
 * Be careful — this actually removes the unit from the database.
 *
 * @param {string} unitUuid - The UUID of the unit to delete.
 */
export async function deleteUnit(unitUuid) {
  return await prisma.units.delete({
    where: { uuid: unitUuid },
  });
}
