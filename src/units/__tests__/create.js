import prisma from '../../db/prismaClient';
import { createNewUnit } from '../create';

afterAll(async () => {
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

it('should create a new unit with a unit number', async () => {
  const unitNumber = '3Q';
  const actual = await createNewUnit(unitNumber);
  expect(actual?.unit_number).toBe(unitNumber);
});
