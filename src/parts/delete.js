import prisma from '../db/prismaClient.js';

/**
 * Hard delete a part by UUID.
 * @param {string} partUuid - UUID of the part
 */
export async function deletePartByUUID(partUuid) {
  return await prisma.parts.delete({
    where: { uuid: partUuid },
  });
}

/**
 * Soft delete a part by setting its active field to false.
 * @param {string} partUuid - UUID of the part
 */
export async function softDeletePartByUUID(partUuid) {
  return await prisma.parts.update({
    where: { uuid: partUuid },
    data: { active: false },
  });
}
