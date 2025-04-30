import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all bike spots
export async function getAllBikeSpots() {
  try {
    return await prisma.bikeSpots.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find a bike spot by UUID
export async function getBikeSpotByUUID(spotUuid) {
  try {
    return await prisma.bikeSpots.findUnique({
      where: { uuid: spotUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Find a bike spot by spot number
export async function getBikeSpotBySpotNumber(spotNumber) {
  try {
    return await prisma.bikeSpots.findUnique({
      where: { spotNumber: spotNumber },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Get available (unassigned) bike spots
export async function getAvailableBikeSpots() {
  try {
    return await prisma.bikeSpots.findMany({
      where: {
        bikeRegistrations: {
          none: {},
        },
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
