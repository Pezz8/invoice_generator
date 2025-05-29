import { createInvoice } from '../create.js';
import { createUnit } from '../../units/create.js';
import {
  getInvoiceByNumber,
  getInvoicesByUnitNumber,
  getActiveInvoices,
} from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('Invoice Queries', () => {
  let testUnit;
  let testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('Unit Q1');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceNumber: 'INV-TEST-001',
      invoiceType: 'standard',
      jobDate: new Date('2025-05-29'),
      totalCost: 200.0,
    });
  });

  afterEach(async () => {
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should get invoice by invoice number', async () => {
    const result = await getInvoiceByNumber('INV-TEST-001');
    expect(result).not.toBeNull();
    expect(result.invoiceNumber).toBe('INV-TEST-001');
  });

  test('should list invoices by unit number', async () => {
    const result = await getInvoicesByUnitNumber('Unit Q1');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].units.unitNumber).toBe('Unit Q1');
  });

  test('should list all active invoices', async () => {
    const result = await getActiveInvoices();
    const matching = result.find((inv) => inv.uuid === testInvoice.uuid);
    expect(matching).not.toBeUndefined();
    expect(matching.active).toBe(true);
  });
});
