import prisma from '../../db/prismaClient';
import { createElectricityInvoice } from '../create';
import { createUnit } from '../../units/create';

describe('createElectricityInvoice', () => {
  let testUnit;

  beforeEach(async () => {
    testUnit = await createUnit('R100');
  });

  afterEach(async () => {
    await prisma.electricity_invoices.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should create a new electricity invoice', async () => {
    const invoiceData = {
      unitUuid: testUnit.uuid,
      billingStart: new Date('2024-01-01'),
      billingEnd: new Date('2024-01-31'),
      totalUsage: 320.75,
      supplyCharge: 45.0,
      deliveryCharge: 35.25,
      totalCharge: 80.25,
    };

    const invoice = await createElectricityInvoice(invoiceData);

    expect(invoice).not.toBeNull();
    expect(invoice.unitUuid).toBe(testUnit.uuid);
    expect(invoice.totalUsage.toString()).toBe('320.75');
    expect(invoice.totalCharge.toString()).toBe('80.25');
  });
});
