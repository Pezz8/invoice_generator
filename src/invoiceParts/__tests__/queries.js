import prisma from '../../db/prismaClient';
import { createInvoice } from '../../invoices/create';
import { createUnit } from '../../units/create';
import { createInvoicePart } from '../create';
import {
  getAllInvoiceParts,
  getInvoicePartByUuid,
  getInvoicePartsByInvoiceUuid,
} from '../queries';

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

  test('should get a part by part uuid', async () => {
    const actual = await getInvoicePartByUuid(testInvoicePart1.uuid);
    expect(actual).not.toBeNull();
    expect(actual.uuid).toBe(testInvoicePart1.uuid);
  });

  test('should get all parts by invoice uuid', async () => {
    const actual = await getInvoicePartsByInvoiceUuid(testInvoice.uuid);
    expect(actual).toHaveLength(2);
    const partNames = actual.map((p) => p.partName);
    expect(partNames).toContain('Test Filter');
    expect(partNames).toContain('Test Battery');
  });

  test('should return all invoice parts in the database', async () => {
    const allParts = await getAllInvoiceParts();
    expect(allParts.length).toBeGreaterThanOrEqual(2);
    const partNames = allParts.map((p) => p.partName);
    expect(partNames).toContain('Test Filter');
    expect(partNames).toContain('Test Battery');
  });
});
