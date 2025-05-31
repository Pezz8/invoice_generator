import prisma from '../db/prismaClient.js';

export async function getInvoicePartByUuid(uuid) {
  return await prisma.invoice_parts.findUnique({
    where: { uuid },
  });
}

export async function getInvoicePartsByInvoiceUuid(invoiceUuid) {
  return await prisma.invoice_parts.findMany({
    where: { invoiceUuid },
  });
}

export async function getAllInvoiceParts() {
  return await prisma.invoice_parts.findMany();
}
