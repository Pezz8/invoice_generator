import { randomUUID } from 'crypto';
import prisma from '../../db/prismaClient.js';
import { createElectricMeter } from '../../electricMeters/create.js';
import { insertUnit } from '../../../test/factory.js';

afterAll(async () => {
  await prisma.electricMeters.deleteMany();
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('Electric Meter Creation', () => {
  it('should create a reading for Meter 1', async () => {
    const unit = await insertUnit('3Q');
    const meterName = 'Meter 1';
    const actual = await createElectricMeter(unit.uuid, meterName);

    expect(actual?.unitUuid).toBe(unit.uuid);
    expect(actual?.meterName).toBe(meterName);
  });
});
