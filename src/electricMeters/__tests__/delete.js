import { createUnit } from '../../units/create.js';
import { createElectricMeter } from '../create.js';
import { softDeleteElectricMeterByUUID } from '../delete.js';
import { getElectricMeterByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('softDeleteElectricMeterByUUID', () => {
  let unit, meter;

  beforeEach(async () => {
    unit = await createUnit('Unit EM4');
    meter = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Deletable Meter',
    });
  });

  afterEach(async () => {
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should soft delete an electric meter by setting active to false', async () => {
    await softDeleteElectricMeterByUUID(meter.uuid);
    const result = await getElectricMeterByUUID(meter.uuid);
    expect(result).not.toBeNull();
    expect(result.active).toBe(false);
  });
});
