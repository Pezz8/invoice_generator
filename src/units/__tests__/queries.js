import prisma from '../../db/prismaClient';
import { createUnit } from '../create';
import { getAllUnits, getUnitByNumber } from '../queries';

afterAll(async () => {
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('getAllUnits', () => {
  it('should return a list of all the units', async () => {
    await Promise.all([createUnit('1'), createUnit('2'), createUnit('3')]);
    const actual = await getAllUnits();
    expect(actual.length).toBe(3);
    await prisma.units.deleteMany();
  });

  it('should return an empty list if no units exist', async () => {
    const actual = await getAllUnits();
    expect(actual).toEqual([]);
  });
});

describe('getUnitByNumber', () => {
  it('should return a unit by its number', async () => {
    const unitNumber = '1';
    await Promise.all([
      createUnit(unitNumber),
      createUnit('2'),
      createUnit('3'),
    ]);
    const actual = await getUnitByNumber(unitNumber);
    expect(actual.unit_number).toBe(unitNumber);
  });

  it('should return null if no units exist with unitNumber', async () => {
    const actual = await getUnitByNumber('doesnt exist');
    expect(actual).toEqual(null);
  });

  it('should return an error if called with bad input', async () => {
    const actual = await getUnitByNumber(1);
    console.log(actual);
    expect(actual.message).toEqual('Invalid data provided');
  });
});
