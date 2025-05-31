import prisma from '../../db/prismaClient';
import { deleteElectricityInvoiceByUUID } from '../delete';
import { createElectricityInvoice } from '../create';
import { getElectricityInvoiceByUUID } from '../queries';
import { createUnit } from '../../units/create';

describe('softDeleteElectricityInvoiceByUUID', () => {
  let testUnit, testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('R103');

    testInvoice = await createElectricityInvoice({
      unitUuid: testUnit.uuid,
      billingStart: new Date('2024-05-01'),
      billingEnd: new Date('2024-05-31'),
      totalUsage: 400,
      supplyCharge: 55.0,
      deliveryCharge: 45.0,
      totalCharge: 100.0,
    });
  });

  afterEach(async () => {
    await prisma.electricity_invoices.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should mark the electricity invoice as inactive', async () => {
    await deleteElectricityInvoiceByUUID(testInvoice.uuid);
    const fetched = await getElectricityInvoiceByUUID(testInvoice.uuid);
    expect(fetched).toBeNull();
  });
});
