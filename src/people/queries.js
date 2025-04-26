import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all people
export async function getAllPeople() {
  try {
    return await prisma.people.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find person by email (useful for login or lookups)
export async function getPersonByEmail(email) {
  try {
    return await prisma.people.findUnique({
      where: { email },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// Find person by UUID
export async function getPersonByUUID(personUuid) {
  try {
    return await prisma.people.findUnique({
      where: { uuid: personUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all active people (if you added active field)
export async function getActivePeople() {
  try {
    return await prisma.people.findMany({
      where: { active: true },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
