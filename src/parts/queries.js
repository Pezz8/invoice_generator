import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all parts
export async function getAllParts() {
  try {
    return await prisma.parts.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find part by UUID
export async function getPartByUUID(partUuid) {
  try {
    return await prisma.parts.findUnique({
      where: { uuid: partUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Find part by name (exact match)
export async function getPartByName(partName) {
  try {
    return await prisma.parts.findUnique({
      where: { name: partName },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
