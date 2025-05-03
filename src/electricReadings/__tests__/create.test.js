import { randomUUID } from 'crypto';
import prisma from '../../db/prismaClient.js';
import { createElectricReading } from '../create.js';
import { insertUnitWithMeter } from '../../../test/factory.js';

afterAll(async () => {
  await prisma.electricMeters.deleteMany();
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('Electric Reading Creation', () => {
  it('should create a reading for Meter 1', async () => {
    const { unit, meter } = await insertUnitWithMeter('3Q', 'Meter 1');
    const readingDate = new Date('2025-01-01');
    const readingValue = 70983;

    const actual = await createElectricReading(
      meter.uuid,
      readingDate,
      readingValue
    );

    expect(actual?.meterUuid).toBe(meter.uuid);
    expect(actual?.readingDate.getTime()).toBe(readingDate.getTime());
    expect(Number(actual?.readingValue)).toBe(readingValue);
  });
});

// it('should create readings for Meter 2', async () => {
// TODO create multiple readings. Use below data.

//   const readings = [
//     { readingDate: new Date('2025-01-01'), readingValue: 22187 },
//     { readingDate: new Date('2025-02-01'), readingValue: 22272 },
//     { readingDate: new Date('2025-03-01'), readingValue: 22408 },
//   ];

//   for (const { readingDate, readingValue } of readings) {
//     const result = await prisma.electricReadings.create({
//       data: {
//         uuid: randomUUID(),
//         meterUuid: meter.uuid,
//         readingDate,
//         readingValue,
//       },
//     });

//     expect(Number(result.readingValue)).toBe(readingValue);
//     expect(result.meterUuid).toBe(meter.uuid);
//   }
// });

// it('should create additional readings for Meter 1', async () => {
//   const meter = await prisma.electricMeters.findFirst({
//     where: { meterName: 'Meter 1' },
//   });
//   expect(meter).not.toBeNull();

//   const readings = [
//     { readingDate: new Date('2025-02-01'), readingValue: 72453 },
//     { readingDate: new Date('2025-03-01'), readingValue: 74516 },
//   ];

//   for (const { readingDate, readingValue } of readings) {
//     const result = await prisma.electricReadings.create({
//       data: {
//         uuid: randomUUID(),
//         meterUuid: meter.uuid,
//         readingDate,
//         readingValue,
//       },
//     });

//     expect(Number(result.readingValue)).toBe(readingValue);
//     expect(result.meterUuid).toBe(meter.uuid);
//   }
// });
