import { createUnit } from '../../units/create.js';
import { createElectricMeter } from '../create.js';
import { updateElectricMeter } from '../update.js';
import { getElectricMeterByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updateElectricMeter', () => {
  let unit, meter;

  beforeEach(async () => {
    unit = await createUnit('EM3');
    meter = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Old Meter',
    });
  });

  afterEach(async () => {
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the meter name', async () => {
    await updateElectricMeter(meter.uuid, {
      meterName: 'Updated Meter',
    });

    const updated = await getElectricMeterByUUID(meter.uuid);
    expect(updated).not.toBeNull();
    expect(updated.meterName).toBe('Updated Meter');
  });
});
