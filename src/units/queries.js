import prisma from '../db/prismaClient';

export async function getAllUnits() {
  return await prisma.units.findMany();
}

export async function getUnitByNumber(unitNumber) {
  return await prisma.units.findUnique({
    where: {
      unit_number: unitNumber,
    },
  });
}
