import prisma from '../../db/prismaClient.js';

export async function deleteInvoicePart(uuid) {
  return await prisma.invoiceParts.delete({
    where: { uuid },
  });
}
