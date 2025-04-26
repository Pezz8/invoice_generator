import prisma from '../db/prismaClient.js';

/**
 * Update a part by UUID.
 * @param {string} partUuid - UUID of the part
 * @param {Object} updates - Fields to update (name, unit_cost, etc.)
 */
export async function updatePart(partUuid, updates) {
  return await prisma.parts.update({
    where: { uuid: partUuid },
    data: updates,
  });
}
