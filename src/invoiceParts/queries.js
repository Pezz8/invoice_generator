import prisma from '../../db/prismaClient.js';

export async function getInvoicePartByUuid(uuid) {
  return await prisma.invoiceParts.findUnique({
    where: { uuid },
  });
}

export async function getInvoicePartsByInvoiceUuid(invoiceUuid) {
  return await prisma.invoiceParts.findMany({
    where: { invoiceUuid },
  });
}

export async function getAllInvoiceParts() {
  return await prisma.invoiceParts.findMany();
}
