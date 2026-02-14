import prisma from '../../db/prismaClient';
import { deleteElectricReading } from '../delete';
import { getElectricReadingByUUID } from '../queries';
import { createElectricReading } from '../create';
import { createUnit } from '../../units/create';
import { createElectricMeter } from '../../electricMeters/create';

describe('deleteElectricReading', () => {
  let testUnit, testMeter, testReading;

  beforeEach(async () => {
    testUnit = await createUnit('R2');
    testMeter = await createElectricMeter({
      unitUuid: testUnit.uuid,
      meterName: 'To Delete',
    });

    testReading = await createElectricReading({
      meterUuid: testMeter.uuid,
      readingDate: new Date('2024-05-01'),
      readingValue: 150.0,
    });
  });

  afterEach(async () => {
    await prisma.electric_readings.deleteMany();
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
  });

  test('should delete an electric reading by UUID', async () => {
    const deleted = await deleteElectricReading(testReading.uuid);
    expect(deleted).not.toBeNull();
    expect(deleted.uuid).toBe(testReading.uuid);

    const fetched = await getElectricReadingByUUID(testReading.uuid);
    expect(fetched).toBeNull();
  });
});
