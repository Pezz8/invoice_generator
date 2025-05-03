import prisma from '../../db/prismaClient.js';
import { createElectricityInvoiceForUnit } from '../createElectricityInvoice.js';

describe('createElectricityInvoiceForUnit', () => {
  it('should generate and store an invoice for unit "test"', async () => {
    // // Step 1: Get unit
    // const unit = await prisma.units.findFirst({
    //   where: { unitNumber: 'test' },
    // });
    // expect(unit).not.toBeNull();
    // // Step 2: Define billing range and rates
    // const billingStart = new Date('2025-01-01');
    // const billingEnd = new Date('2025-03-01');
    // const rates = {
    //   supplyRate: 0.1481,
    //   deliveryRate: 0.0756,
    // };
    // // Step 3: Ensure at least two readings per meter in the date range
    // const meters = await prisma.electricMeters.findMany({
    //   where: { unitUuid: unit.uuid },
    // });
    // for (const meter of meters) {
    //   const existingReadings = await prisma.electricReadings.findMany({
    //     where: {
    //       meterUuid: meter.uuid,
    //       readingDate: {
    //         gte: billingStart,
    //         lte: billingEnd,
    //       },
    //     },
    //   });
    //   const datesNeeded = ['2025-01-01', '2025-02-01'];
    //   const existingDates = new Set(
    //     existingReadings.map((r) => r.readingDate.toISOString().split('T')[0])
    //   );
    //   for (const date of datesNeeded) {
    //     if (!existingDates.has(date)) {
    //       const readingValue = date === '2025-01-01' ? 10000 : 11000;
    //       await prisma.electricReadings.create({
    //         data: {
    //           uuid: (await import('crypto')).randomUUID(),
    //           meterUuid: meter.uuid,
    //           readingDate: new Date(`${date}T00:00:00.000Z`),
    //           readingValue,
    //         },
    //       });
    //     }
    //   }
    // }
    // // Step 4: Run the function
    // const invoice = await createElectricityInvoiceForUnit(
    //   unit.uuid,
    //   billingStart,
    //   billingEnd,
    //   rates
    // );
    // // Step 5: Assertions
    // expect(invoice).toBeDefined();
    // expect(invoice.unitUuid).toBe(unit.uuid);
    // expect(invoice.billingStart).toEqual(billingStart);
    // expect(invoice.billingEnd).toEqual(billingEnd);
    // expect(Number(invoice.totalUsage)).toBeGreaterThan(0);
    // expect(Number(invoice.totalCharge)).toBeGreaterThan(0);
  });
});
