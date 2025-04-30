import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient';

export async function createUnit(unitNumber) {
  return await prisma.units.create({
    data: {
      uuid: randomUUID(),
      unitNumber,
    },
  });
}
