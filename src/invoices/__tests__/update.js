import { createInvoice } from '../create.js';
import { updateInvoiceByUUID } from '../update.js';
import { getInvoiceByUUID } from '../queries.js';
import { createUnit } from '../../units/create.js';
import prisma from '../../db/prismaClient.js';

describe('updateInvoiceByUUID', () => {
  let testUnit;
  let testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('Unit U1');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceNumber: 'INV-UPD-001',
      invoiceType: 'standard',
      jobDate: new Date('2025-05-29'),
      totalCost: 300.0,
    });
  });

  afterEach(async () => {
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the total cost of an invoice', async () => {
    await updateInvoiceByUUID(testInvoice.uuid, { totalCost: 450.0 });
    const updatedInvoice = await getInvoiceByUUID(testInvoice.uuid);
    expect(updatedInvoice.totalCost.toNumber()).toBeCloseTo(450.0);
  });

  test('should update the invoice type', async () => {
    await updateInvoiceByUUID(testInvoice.uuid, { invoiceType: 'emergency' });
    const updatedInvoice = await getInvoiceByUUID(testInvoice.uuid);
    expect(updatedInvoice.invoiceType).toBe('emergency');
  });
});
