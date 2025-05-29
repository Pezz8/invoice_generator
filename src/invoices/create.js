import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

export async function createInvoice(invoiceData) {
  return await prisma.invoices.create({
    data: {
      uuid: randomUUID(),
      ...invoiceData,
    },
  });
}
