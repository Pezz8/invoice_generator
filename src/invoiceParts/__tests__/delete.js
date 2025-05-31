import prisma from '../../db/prismaClient';
import { createInvoice } from '../../invoices/create';
import { deleteInvoicePartByUUID } from '../../invoiceParts/delete';
import { createUnit } from '../../units/create';
import { createInvoicePart } from '../create';
import { getInvoicePartByUuid } from '../queries';

describe('deleteInvoicePartByUUID', () => {
  let testUnit;
  let testInvoice;
  let testInvoicePart;

  beforeEach(async () => {
    testUnit = await createUnit('Q9');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceNumber: 'INV-Test-Delete',
      invoiceType: 'test',
      jobDate: new Date('2025-05-30'),
      totalCost: 120,
    });
    testInvoicePart = await createInvoicePart({
      invoiceUuid: testInvoice.uuid,
      partName: 'Test Filter',
      quantity: 4,
      unitCost: 20.0,
      totalCost: 80.0,
    });
  });

  afterEach(async () => {
    await prisma.invoice_parts.deleteMany();
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should delete a part linked to an invoice', async () => {
    await deleteInvoicePartByUUID(testInvoicePart.uuid);
    const result = await getInvoicePartByUuid(testInvoicePart.uuid);
    expect(result).toBeNull();
  });
});
