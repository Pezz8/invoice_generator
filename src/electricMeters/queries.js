import prisma from '../db/prismaClient.js';
import { errorHandler } from '../db/errorHandler';

// Get all meters
export async function getAllElectricMeters() {
  try {
    return await prisma.electric_meters.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find meter by UUID
export async function getElectricMeterByUUID(meterUuid) {
  try {
    return await prisma.electric_meters.findUnique({
      where: { uuid: meterUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Get all meters for a specific unit
export async function getElectricMetersByUnitUUID(unitUuid) {
  try {
    return await prisma.electric_meters.findMany({
      where: { unitUuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
