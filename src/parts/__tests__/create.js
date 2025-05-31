import { createPart } from '../create.js';
import prisma from '../../db/prismaClient.js';

describe('createPart', () => {
  afterEach(async () => {
    await prisma.parts.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a new part with name and unit cost', async () => {
    const partData = {
      name: 'Compressor Valve',
      unitCost: 45.99,
    };

    const part = await createPart(partData);

    expect(part).toHaveProperty('uuid');
    expect(part.name).toBe('Compressor Valve');
    expect(part.unitCost.toNumber()).toBeCloseTo(45.99);
    expect(part.active).toBe(true); // default true
  });
});
