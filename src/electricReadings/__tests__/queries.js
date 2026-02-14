import {
  getElectricReadingByUUID,
  getElectricReadingsByMeterUUID,
  getAllElectricReadings,
} from '../queries';
import { createElectricReading } from '../create';
import { createUnit } from '../../units/create';
import { createElectricMeter } from '../../electricMeters/create';
import prisma from '../../db/prismaClient';

describe('Electric Readings Queries', () => {
  let testUnit, meter1, meter2, reading1, reading2;

  beforeEach(async () => {
    testUnit = await createUnit('R1');
    meter1 = await createElectricMeter({
      unitUuid: testUnit.uuid,
      meterName: 'Meter Alpha',
    });
    meter2 = await createElectricMeter({
      unitUuid: testUnit.uuid,
      meterName: 'Meter Beta',
    });

    reading1 = await createElectricReading({
      meterUuid: meter1.uuid,
      readingDate: new Date('2024-01-01'),
      readingValue: 123.45,
    });

    reading2 = await createElectricReading({
      meterUuid: meter2.uuid,
      readingDate: new Date('2024-01-02'),
      readingValue: 678.9,
    });
  });

  afterEach(async () => {
    await prisma.electric_readings.deleteMany();
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should get electric reading by UUID', async () => {
    const result = await getElectricReadingByUUID(reading1.uuid);
    expect(result).not.toBeNull();
    expect(result.uuid).toBe(reading1.uuid);
    expect(result.readingValue.toString()).toBe('123.45');
  });

  test('should get all readings for a given meter', async () => {
    const result = await getElectricReadingsByMeterUUID(meter2.uuid);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].meterUuid).toBe(meter2.uuid);
  });

  test('should list all electric readings', async () => {
    const allReadings = await getAllElectricReadings();
    expect(allReadings.length).toBe(2);
    const values = allReadings.map((r) => r.readingValue.toString());
    expect(values).toContain('123.45');
    expect(values).toContain('678.9');
  });
});
