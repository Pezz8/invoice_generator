import prisma from '../db/prismaClient.js';

/**
 * Hard delete a part by UUID.
 * @param {string} partUuid - UUID of the part
 */
export async function deletePart(partUuid) {
  return await prisma.parts.delete({
    where: { uuid: partUuid },
  });
}
