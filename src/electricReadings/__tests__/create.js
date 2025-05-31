import { createUnit } from '../../units/create.js';
import { createElectricMeter } from '../../electricMeters/create.js';
import { createElectricReading } from '../create.js';
import prisma from '../../db/prismaClient.js';

describe('createElectricReading', () => {
  let unit, meter;

  beforeEach(async () => {
    unit = await createUnit('Unit ER1');
    meter = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter R-100',
    });
  });

  afterEach(async () => {
    await prisma.electric_readings.deleteMany();
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a new electric reading linked to a meter', async () => {
    const reading = await createElectricReading({
      meterUuid: meter.uuid,
      readingDate: new Date('2024-01-01'),
      readingValue: 187.5,
    });

    expect(reading).toHaveProperty('uuid');
    expect(reading.meterUuid).toBe(meter.uuid);
    expect(new Date(reading.readingDate)).toEqual(new Date('2024-01-01'));
    expect(reading.readingValue.toNumber()).toBeCloseTo(187.5);
  });
});
