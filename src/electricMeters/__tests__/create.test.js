import { randomUUID } from 'crypto';
import prisma from '../../db/prismaClient.js';
import { createElectricMeter } from '../../electricMeters/create.js';
import { createUnit } from '../../units/create.js';

afterAll(async () => {
  await prisma.electricMeters.deleteMany();
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('Electric Meter Creation', () => {
  it('should create a reading for Meter 1', async () => {
    const testUnitName = '3Q';
    const testUnit = await createUnit(testUnitName);
    const unitUuid = await testUnit.uuid;
    const meterName = 'Meter 1';
    const actual = await createElectricMeter(unitUuid, meterName);

    expect(actual?.unitUuid).toBe(unitUuid);
    expect(actual?.meterName).toBe(meterName);
  });
});
