import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all unit assignments
export async function getAllUnitAssignments() {
  try {
    return await prisma.unit_assignments.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find assignment by UUID
export async function getUnitAssignmentByUUID(assignmentUuid) {
  try {
    return await prisma.unit_assignments.findUnique({
      where: { uuid: assignmentUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List assignments for a specific unit (by unit UUID)
export async function getAssignmentsByUnitUUID(unitUuid) {
  try {
    return await prisma.unit_assignments.findMany({
      where: { unit_uuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List assignments for a specific person (by person UUID)
export async function getAssignmentsByPersonUUID(personUuid) {
  try {
    return await prisma.unit_assignments.findMany({
      where: { person_uuid: personUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
