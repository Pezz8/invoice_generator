import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient';

export async function createUnit(unitNumber) {
  // Here we do any validation and error handling
  return await prisma.units.create({
    data: {
      unit_number: unitNumber,
      uuid: randomUUID(),
    },
  });
}
