import prisma from '../../db/prismaClient.js';
import { randomUUID } from 'crypto';

export async function createInvoicePart(data) {
  return await prisma.invoiceParts.create({
    data: {
      uuid: randomUUID(),
      ...data,
    },
  });
}
