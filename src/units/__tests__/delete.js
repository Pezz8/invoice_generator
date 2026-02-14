import { deleteUnit, softDeleteUnit } from '../delete.js';
import prisma from '../../db/prismaClient.js';
import { createUnit } from '../create.js';
import { getUnitByNumber } from '../queries.js';

describe('Unit Deletion Functions', () => {
  let testUnit;

  beforeEach(async () => {
    const unitNumber = 'Test delete';
    testUnit = await createUnit(unitNumber);
  });

  afterEach(async () => {
    // Clean up any remaining test data
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('deleteUnit should hard delete a unit', async () => {
    await deleteUnit(testUnit.uuid);
    const deleted = await prisma.units.findUnique({
      where: { uuid: testUnit.uuid },
    });
    expect(deleted).toBeNull();
  });

  test('softDeleteUnit should mark unit as inactive', async () => {
    await softDeleteUnit(testUnit.uuid);
    const updated = await prisma.units.findUnique({
      where: { uuid: testUnit.uuid },
    });
    expect(updated.active).toBe(false);
  });
});
