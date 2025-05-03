import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient';

export async function createUnit(unitNumber) {
  return prisma.units.create({
    data: {
      uuid: randomUUID(),
      unitNumber,
    },
  });
}
