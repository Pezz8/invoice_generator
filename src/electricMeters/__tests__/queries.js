import prisma from '../../db/prismaClient.js';
import { createElectricMeter } from '../create.js';
import {
  getElectricMeterByUUID,
  getElectricMetersByUnitUUID,
  getAllElectricMeters,
} from '../queries.js';
import { createUnit } from '../../units/create.js';

describe('electric meter queries', () => {
  let unit;
  let meter1, meter2;

  beforeEach(async () => {
    unit = await createUnit('J11');

    meter1 = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter B-201',
    });

    meter2 = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter B-202',
    });
  });

  afterEach(async () => {
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('getElectricMeterByUUID should return the correct meter', async () => {
    const result = await getElectricMeterByUUID(meter1.uuid);
    expect(result).not.toBeNull();
    expect(result.uuid).toBe(meter1.uuid);
    expect(result.meterName).toBe('Meter B-201');
  });

  test('getElectricMetersByUnitUUID should return all meters for a unit', async () => {
    const meters = await getElectricMetersByUnitUUID(unit.uuid);
    expect(meters.length).toBe(2);
    const meterNames = meters.map((m) => m.meterName);
    expect(meterNames).toContain('Meter B-201');
    expect(meterNames).toContain('Meter B-202');
  });

  test('getAllElectricMeters should return all electric meters in the system', async () => {
    const allMeters = await getAllElectricMeters();
    expect(allMeters.length).toBeGreaterThanOrEqual(2);
  });
});
