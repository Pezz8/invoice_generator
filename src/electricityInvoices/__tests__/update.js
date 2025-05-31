import prisma from '../../db/prismaClient';
import { updateElectricityInvoiceByUUID } from '../update';
import { getElectricityInvoiceByUUID } from '../queries';
import { createElectricityInvoice } from '../create';
import { createUnit } from '../../units/create';

describe('updateElectricityInvoiceByUUID', () => {
  let testUnit, testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('R102');

    testInvoice = await createElectricityInvoice({
      unitUuid: testUnit.uuid,
      billingStart: new Date('2024-03-01'),
      billingEnd: new Date('2024-03-31'),
      totalUsage: 250,
      supplyCharge: 30.0,
      deliveryCharge: 20.0,
      totalCharge: 50.0,
    });
  });

  afterEach(async () => {
    await prisma.electricity_invoices.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should update total usage and charges for an electricity invoice', async () => {
    const newData = {
      totalUsage: 275,
      supplyCharge: 35.0,
      deliveryCharge: 25.0,
      totalCharge: 60.0,
    };

    const updated = await updateElectricityInvoiceByUUID(
      testInvoice.uuid,
      newData
    );
    expect(updated.totalUsage.toNumber()).toBe(275.0);
    expect(updated.totalCharge.toNumber()).toBe(60.0);

    const fetched = await getElectricityInvoiceByUUID(testInvoice.uuid);
    expect(fetched.totalUsage.toNumber()).toBe(275.0);
    expect(fetched.supplyCharge.toNumber()).toBe(35.0);
  });
});
