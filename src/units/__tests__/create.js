import prisma from '../../db/prismaClient';
import { createUnit } from '../create';

afterAll(async () => {
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

it('should create a new unit with a unit number', async () => {
  const unitNumber = '3Q';
  const actual = await createUnit(unitNumber);
  expect(actual?.unitNumber).toBe(unitNumber);
});
