import { createPart } from '../create.js';
import { updatePart } from '../update.js';
import { getPartByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updatePart', () => {
  let part;

  beforeEach(async () => {
    part = await createPart({
      name: 'Old Fan Blade',
      unitCost: 25.0,
    });
  });

  afterEach(async () => {
    await prisma.parts.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the part name and unit cost', async () => {
    await updatePart(part.uuid, {
      name: 'New Fan Blade',
      unitCost: 30.5,
    });

    const updated = await getPartByUUID(part.uuid);
    expect(updated.name).toBe('New Fan Blade');
    expect(updated.unitCost.toNumber()).toBeCloseTo(30.5);
  });
});
