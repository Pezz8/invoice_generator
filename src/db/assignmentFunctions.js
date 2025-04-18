import prisma from "./prismaClient.js";

// Assign a Person to a Unit
export async function assignPersonToUnit(
  unitId,
  personId,
  role,
  startDate = null
) {
  return await prisma.unit_assignments.create({
    data: {
      unit_id: unitId,
      person_id: personId,
      role: role,
      active: true,
      start_date: startDate,
    },
  });
}

// Find all Assignments for a Unit
export async function findAssignmentsByUnit(unitId) {
  return await prisma.unit_assignments.findMany({
    where: {
      unit_id: unitId,
    },
    include: {
      people: true,
    },
  });
}

// Update an Assignment (role and active status)
export async function updateAssignment(assignmentId, newRole, newActiveStatus) {
  return await prisma.unit_assignments.update({
    where: { id: assignmentId },
    data: {
      role: newRole,
      active: newActiveStatus,
    },
  });
}

// Delete an Assignment
export async function deleteAssignment(assignmentId) {
  return await prisma.unit_assignments.delete({
    where: { id: assignmentId },
  });
}
