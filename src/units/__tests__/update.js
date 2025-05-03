import prisma from '../../db/prismaClient';
import { createUnit } from '../create';
import { getUnitByNumber } from '../queries';
import {
  deactivateUnit,
  updateToAffordable,
  updateToNotAffordable,
  updateUnitNumber,
} from '../update';

afterAll(async () => {
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('deactivate unit', () => {
  it('should deactivate one unit', async () => {
    const actual = await createUnit('3Q');
    await deactivateUnit(actual.uuid);
    const updated = await getUnitByNumber(actual.unitNumber);
    expect(updated?.active).toBe(false);
  });
});

describe('update unit number', () => {
  it('should updated one the unit number', async () => {
    const actual = await createUnit('9Q');
    const newUnitNumber = '4W';
    await updateUnitNumber(actual.uuid, newUnitNumber);
    const updated = await getUnitByNumber(newUnitNumber);
    expect(updated?.unitNumber).toBe(newUnitNumber);
  });
});

describe('update unit number', () => {
  it('should updated one the unit to affordable', async () => {
    const actual = await createUnit('9Q');
    await updateToAffordable(actual.uuid);
    const updated = await getUnitByNumber(actual.unitNumber);
    expect(updated?.affordable).toBe(true);
  });
});

describe('update unit number', () => {
  it('should updated one the unit to not affordable', async () => {
    const actual = await createUnit('11Q');
    await updateToAffordable(actual.uuid);
    const updated1 = await getUnitByNumber(actual.unitNumber);
    expect(updated1?.affordable).toBe(true);
    await updateToNotAffordable(actual.uuid);
    const updated2 = await getUnitByNumber(actual.unitNumber);
    expect(updated2?.affordable).toBe(false);
  });
});
