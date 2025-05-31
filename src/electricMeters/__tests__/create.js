import { createElectricMeter } from '../create.js';
import { createUnit } from '../../units/create.js';
import prisma from '../../db/prismaClient.js';

describe('createElectricMeter', () => {
  let testUnit;

  beforeEach(async () => {
    testUnit = await createUnit('R9');
  });

  afterEach(async () => {
    await prisma.electric_meters.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a new electric meter linked to a unit', async () => {
    const result = await createElectricMeter({
      unitUuid: testUnit.uuid,
      meterName: 'Meter A-101',
    });

    expect(result).toHaveProperty('uuid');
    expect(result.unitUuid).toBe(testUnit.uuid);
    expect(result.meterName).toBe('Meter A-101');
  });
});
