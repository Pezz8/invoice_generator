import prisma from '../db/prismaClient.js';
import { randomUUID } from 'crypto';

export async function createInvoicePart(data) {
  return await prisma.invoice_parts.create({
    data: {
      uuid: randomUUID(),
      ...data,
    },
  });
}
