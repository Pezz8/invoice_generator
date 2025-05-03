import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new unit assignment.
 * @param {Object} assignmentData - Required: personUuid, unitUuid, role
 */
export async function createUnitAssignment(personUuid, unitUuid, role) {
  return await prisma.unitAssignments.create({
    data: {
      uuid: randomUUID(),
      personUuid,
      unitUuid,
      role,
    },
  });
}
