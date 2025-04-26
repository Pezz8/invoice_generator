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

export async function getUnitByUUID(unitUuid) {
  try {
    return await prisma.units.findUnique({
      where: {
        uuid: unitUuid,
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

export async function getActiveUnits() {
  try {
    return await prisma.units.findMany({
      where: {
        active: true,
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

export async function getAffordableUnits() {
  try {
    return await prisma.units.findMany({
      where: {
        affordable: true,
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
