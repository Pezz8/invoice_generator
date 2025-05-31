import prisma from '../../db/prismaClient';
import {
  getElectricityInvoiceByUUID,
  getElectricityInvoicesByUnitUUID,
  getAllElectricityInvoices,
} from '../queries';
import { createElectricityInvoice } from '../create';
import { createUnit } from '../../units/create';

describe('Electricity Invoice Queries', () => {
  let testUnit, invoice1, invoice2;

  beforeEach(async () => {
    testUnit = await createUnit('R101');

    invoice1 = await createElectricityInvoice({
      unitUuid: testUnit.uuid,
      billingStart: new Date('2024-01-01'),
      billingEnd: new Date('2024-01-31'),
      totalUsage: 300,
      supplyCharge: 40.0,
      deliveryCharge: 30.0,
      totalCharge: 70.0,
    });

    invoice2 = await createElectricityInvoice({
      unitUuid: testUnit.uuid,
      billingStart: new Date('2024-02-01'),
      billingEnd: new Date('2024-02-28'),
      totalUsage: 350,
      supplyCharge: 50.0,
      deliveryCharge: 40.0,
      totalCharge: 90.0,
    });
  });

  afterEach(async () => {
    await prisma.electricity_invoices.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should get electricity invoice by UUID', async () => {
    const result = await getElectricityInvoiceByUUID(invoice1.uuid);
    expect(result).not.toBeNull();
    expect(result.uuid).toBe(invoice1.uuid);
  });

  test('should get invoices by unit UUID', async () => {
    const results = await getElectricityInvoicesByUnitUUID(testUnit.uuid);
    expect(results.length).toBe(2);
    expect(results[0].unitUuid).toBe(testUnit.uuid);
  });

  test('should get all electricity invoices', async () => {
    const all = await getAllElectricityInvoices();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
