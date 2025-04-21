import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

export async function getAllUnits() {
  return await prisma.units.findMany();
}

export async function getUnitByNumber(unitNumber) {
  try {
    return await prisma.units.findUnique({
      where: {
        unit_number: unitNumber,
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
