import { createInvoice } from '../create.js';
import prisma from '../../db/prismaClient.js';
import { createUnit } from '../../units/create.js';

describe('createInvoice', () => {
  let testUnit;

  beforeEach(async () => {
    // Create a dummy unit to link with invoice
    testUnit = await createUnit('Unit A1');
  });

  afterEach(async () => {
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a new invoice linked to a unit', async () => {
    const invoiceData = {
      unitUuid: testUnit.uuid,
      invoiceType: 'standard',
      jobDate: new Date('2025-05-29'),
      totalCost: 100.0,
    };

    const newInvoice = await createInvoice(invoiceData);

    expect(newInvoice).toHaveProperty('uuid');
    expect(newInvoice.unitUuid).toBe(testUnit.uuid);
    expect(newInvoice.totalCost.toNumber()).toBeCloseTo(100.0);
  });
});
