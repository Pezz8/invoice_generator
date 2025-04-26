import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new unit assignment.
 * @param {Object} assignmentData - Required: person_uuid, unit_uuid, role
 */
export async function createUnitAssignment(assignmentData) {
  return await prisma.unit_assignments.create({
    data: {
      uuid: randomUUID(),
      ...assignmentData,
    },
  });
}
