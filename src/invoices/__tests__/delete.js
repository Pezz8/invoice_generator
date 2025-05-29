import { deleteInvoiceByUUID } from '../delete.js';
import { createInvoice } from '../create.js';
import { createUnit } from '../../units/create.js';
import prisma from '../../db/prismaClient.js';
import { getInvoiceByUUID } from '../queries.js';

describe('deleteInvoiceByUUID', () => {
  let testUnit;
  let testInvoice;

  beforeEach(async () => {
    testUnit = await createUnit('Unit D1');
    testInvoice = await createInvoice({
      unitUuid: testUnit.uuid,
      invoiceType: 'standard',
      jobDate: new Date('2025-05-29'),
      totalCost: 150.0,
    });
  });

  afterEach(async () => {
    await prisma.invoices.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should delete the invoice with the given uuid', async () => {
    await deleteInvoiceByUUID(testInvoice.uuid);
    const result = await getInvoiceByUUID(testInvoice.uuid);
    expect(result).toBeNull();
  });
});
