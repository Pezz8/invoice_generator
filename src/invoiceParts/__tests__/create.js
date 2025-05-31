import prisma from '../../db/prismaClient.js';
import { createInvoice } from '../../invoices/create';
import { createUnit } from '../../units/create.js';

import { createInvoicePart } from '../create.js';

describe('createInvoicePart', () => {
  let testUnit;
  let testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('Q2');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceNumber: 'INV-PART-001',
      invoiceType: 'standard',
      jobDate: new Date('2025-05-29'),
      totalCost: 100,
    });
  });

  afterEach(async () => {
    await prisma.invoice_parts.deleteMany();
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a part linked to an invoice', async () => {
    const partData = {
      invoiceUuid: testInvoice.uuid,
      partName: 'Replacement Filter',
      quantity: 2,
      unitCost: 25.0,
      totalCost: 50.0,
    };
    const part = await createInvoicePart(partData);
    expect(part).toHaveProperty('uuid');
    expect(part.invoiceUuid).toBe(testInvoice.uuid);
    expect(part.partName).toBe('Replacement Filter');
    expect(part.totalCost.toNumber()).toBeCloseTo(50.0);
  });
});
