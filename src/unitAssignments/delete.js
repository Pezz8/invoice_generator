import prisma from '../db/prismaClient.js';

/**
 * Hard delete a unit assignment by UUID.
 * @param {string} assignmentUuid - UUID of the assignment
 */
export async function deleteUnitAssignment(assignmentUuid) {
  return await prisma.unit_assignments.delete({
    where: { uuid: assignmentUuid },
  });
}
