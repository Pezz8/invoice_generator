import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new part.
 * @param {Object} partData - Required: name, unit_cost
 */
export async function createPart(name, unitCost) {
  return await prisma.parts.create({
    data: {
      uuid: randomUUID(),
      name,
      unitCost,
    },
  });
}
