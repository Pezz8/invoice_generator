import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all bike spots
export async function getAllBikeSpots() {
  try {
    return await prisma.bike_spots.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find a bike spot by UUID
export async function getBikeSpotByUUID(spotUuid) {
  try {
    return await prisma.bike_spots.findUnique({
      where: { uuid: spotUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Find a bike spot by spot number
export async function getBikeSpotBySpotNumber(spotNumber) {
  try {
    return await prisma.bike_spots.findUnique({
      where: { spot_number: spotNumber },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Get available (unassigned) bike spots
export async function getAvailableBikeSpots() {
  try {
    return await prisma.bike_spots.findMany({
      where: {
        bike_registrations: {
          none: {},
        },
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
