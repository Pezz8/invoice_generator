import prisma from '../../db/prismaClient';
import { createInvoice } from '../../invoices/create';
import { createUnit } from '../../units/create';
import { createInvoicePart } from '../create';
import { getInvoicePartByUuid } from '../queries';
import { updateInvoicePartByUUID } from '../update';

describe('getInvoicePart', () => {
  let testUnit;
  let testInvoice;
  let testInvoicePart1;
  let testInvoicePart2;

  beforeEach(async () => {
    testUnit = await createUnit('Q9');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceNumber: 'INV-Test-Delete',
      invoiceType: 'test',
      jobDate: new Date('2025-05-30'),
      totalCost: 120,
    });
    testInvoicePart1 = await createInvoicePart({
      invoiceUuid: testInvoice.uuid,
      partName: 'Test Filter',
      quantity: 4,
      unitCost: 20.0,
      totalCost: 80.0,
    });
    testInvoicePart2 = await createInvoicePart({
      invoiceUuid: testInvoice.uuid,
      partName: 'Test Battery',
      quantity: 5,
      unitCost: 2.0,
      totalCost: 10.0,
    });
  });

  afterEach(async () => {
    await prisma.invoice_parts.deleteMany();
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the quantity and total cost of an invoice part', async () => {
    await updateInvoicePartByUUID(testInvoicePart1.uuid, {
      quantity: 10,
      totalCost: 200.0,
    });

    const updatedPart = await getInvoicePartByUuid(testInvoicePart1.uuid);
    expect(updatedPart.quantity).toBe(10);
    expect(updatedPart.totalCost.toNumber()).toBeCloseTo(200.0);
  });
});
