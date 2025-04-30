import prisma from '../db/prismaClient.js';

/**
 * Update a unit assignment by UUID.
 * @param {string} assignmentUuid - UUID of the assignment
 * @param {Object} updates - Fields to update (role, etc.)
 */
export async function updateUnitAssignment(assignmentUuid, updates) {
  return await prisma.unitAssignments.update({
    where: { uuid: assignmentUuid },
    data: updates,
  });
}
