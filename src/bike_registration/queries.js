import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all bike registrations
export async function getAllBikeRegistrations() {
  try {
    return await prisma.bike_registrations.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find bike registration by UUID
export async function getBikeRegistrationByUUID(bikeUuid) {
  try {
    return await prisma.bike_registrations.findUnique({
      where: { uuid: bikeUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all bikes registered to a person
export async function getBikeRegistrationsByPersonUUID(personUuid) {
  try {
    return await prisma.bike_registrations.findMany({
      where: { person_uuid: personUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all bikes assigned to a unit
export async function getBikeRegistrationsByUnitUUID(unitUuid) {
  try {
    return await prisma.bike_registrations.findMany({
      where: { unit_uuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all active bike registrations (if using active = true for renewals)
export async function getActiveBikeRegistrations() {
  try {
    return await prisma.bike_registrations.findMany({
      where: { active: true },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
