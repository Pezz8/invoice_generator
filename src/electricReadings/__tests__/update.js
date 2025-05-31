import { createUnit } from '../../units/create.js';
import { createElectricMeter } from '../../electricMeters/create.js';
import { createElectricReading } from '../create.js';
import { updateElectricReading } from '../update.js';
import { getElectricReadingByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updateElectricReading', () => {
  let unit, meter, reading;

  beforeEach(async () => {
    unit = await createUnit('ER3');
    meter = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter R-300',
    });

    reading = await createElectricReading({
      meterUuid: meter.uuid,
      readingDate: new Date('2024-04-01'),
      readingValue: 500.0,
    });
  });

  afterEach(async () => {
    await prisma.electric_readings.deleteMany();
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the reading value and date', async () => {
    const newDate = new Date('2024-04-15');
    const newValue = 575.25;

    await updateElectricReading(reading.uuid, {
      readingDate: newDate,
      readingValue: newValue,
    });

    const updated = await getElectricReadingByUUID(reading.uuid);
    expect(updated).not.toBeNull();
    expect(new Date(updated.readingDate)).toEqual(newDate);
    expect(parseFloat(updated.readingValue)).toBeCloseTo(newValue);
  });
});
