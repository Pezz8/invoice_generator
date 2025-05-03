import prisma from '../db/prismaClient.js';

/**
 * Update a unit by UUID.
 * @param {string} unitUuid - The UUID of the unit to update.
 * @param {Object} updates - The fields to update (ex: { unit_number: "100B" }).
 */
export async function updateUnit(unitUuid, updates) {
  return prisma.units.update({
    where: { uuid: unitUuid },
    data: updates,
  });
}

/**
 * Soft delete a unit by UUID.
 * Marks the unit as inactive instead of removing it from the database.
 *
 * @param {string} unitUuid - The UUID of the unit to deactivate.
 */
export async function deactivateUnit(unitUuid) {
  return prisma.units.update({
    where: { uuid: unitUuid },
    data: { active: false },
  });
}

export async function updateUnitNumber(unitUuid, unitNumber) {
  return prisma.units.update({
    where: { uuid: unitUuid },
    data: { unitNumber: unitNumber },
  });
}

export async function updateToAffordable(unitUuid) {
  return prisma.units.update({
    where: { uuid: unitUuid },
    data: { affordable: true },
  });
}

export async function updateToNotAffordable(unitUuid) {
  return prisma.units.update({
    where: { uuid: unitUuid },
    data: { affordable: false },
  });
}
