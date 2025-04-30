import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all unit assignments
export async function getAllUnitAssignments() {
  try {
    return await prisma.unitAssignments.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find assignment by UUID
export async function getUnitAssignmentByUUID(assignmentUuid) {
  try {
    return await prisma.unitAssignments.findUnique({
      where: { uuid: assignmentUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List assignments for a specific unit (by unit UUID)
export async function getAssignmentsByUnitUUID(unitUuid) {
  try {
    return await prisma.unitAssignments.findMany({
      where: { unitUuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List assignments for a specific person (by person UUID)
export async function getAssignmentsByPersonUUID(personUuid) {
  try {
    return await prisma.unitAssignments.findMany({
      where: { personUuid: personUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
