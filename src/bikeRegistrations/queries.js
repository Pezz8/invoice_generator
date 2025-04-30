import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all bike registrations
export async function getAllBikeRegistrations() {
  try {
    return await prisma.bikeRegistrations.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find bike registration by UUID
export async function getBikeRegistrationByUUID(bikeUuid) {
  try {
    return await prisma.bikeRegistrations.findUnique({
      where: { uuid: bikeUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all bikes registered to a person
export async function getBikeRegistrationsByPersonUUID(personUuid) {
  try {
    return await prisma.bikeRegistrations.findMany({
      where: { personUuid: personUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all bikes assigned to a unit
export async function getBikeRegistrationsByUnitUUID(unitUuid) {
  try {
    return await prisma.bikeRegistrations.findMany({
      where: { unitUuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all active bike registrations (if using active = true for renewals)
export async function getActiveBikeRegistrations() {
  try {
    return await prisma.bikeRegistrations.findMany({
      where: { active: true },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
