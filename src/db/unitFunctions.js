import prisma from './prismaClient.js';
import { randomUUID } from 'crypto';

// Create a Unit
export async function createUnit(unitNumber) {
  return await prisma.units.create({
    data: {
      unit_number: unitNumber,
      uuid: randomUUID(),
    },
  });
}

// Find a Unit by Unit Number
export async function findUnitByNumber(unitNumber) {
  return await prisma.units.findUnique({
    where: {
      unit_number: unitNumber,
    },
  });
}

// List all Units
export async function listUnits() {
  return await prisma.units.findMany();
}

// Update a Unit's number
export async function updateUnit(unitId, newUnitNumber) {
  return await prisma.units.update({
    where: { id: unitId },
    data: { unit_number: newUnitNumber },
  });
}

// Delete a Unit
export async function deleteUnit(unitId) {
  return await prisma.units.delete({
    where: { id: unitId },
  });
}
