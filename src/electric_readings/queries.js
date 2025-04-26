import prisma from '../db/prismaClient.js';
import { errorHandler } from '../db/errorHandler';

// Get all readings
export async function getAllElectricReadings() {
  try {
    return await prisma.electric_readings.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find reading by UUID
export async function getElectricReadingByUUID(readingUuid) {
  try {
    return await prisma.electric_readings.findUnique({
      where: { uuid: readingUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all readings for a specific meter
export async function getElectricReadingsByMeterUUID(meterUuid) {
  try {
    return await prisma.electric_readings.findMany({
      where: { meter_uuid: meterUuid },
      orderBy: { reading_date: 'asc' }, // Order readings chronologically
    });
  } catch (e) {
    return errorHandler(e);
  }
}
