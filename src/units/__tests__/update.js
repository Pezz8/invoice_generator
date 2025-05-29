import { updateUnitByUUID } from '../update.js';
import { createUnit } from '../create.js';
import { getUnitByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updateUnit', () => {
  let testUnit;

  beforeEach(async () => {
    const unitNumber = 'Test Update';
    testUnit = await createUnit(unitNumber);
  });

  afterEach(async () => {
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the unit number of a unit', async () => {
    const updatedNumber = 'Updated Unit 200';
    await updateUnitByUUID(testUnit.uuid, { unitNumber: updatedNumber });

    const updated = await getUnitByUUID(testUnit.uuid);

    expect(updated.unitNumber).toBe(updatedNumber);
  });
});
