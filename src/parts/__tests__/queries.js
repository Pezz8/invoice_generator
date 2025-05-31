import prisma from '../../db/prismaClient.js';
import { getAllParts, getPartByUUID, getPartByName } from '../queries.js';
import { createPart } from '../create.js';

describe('parts queries', () => {
  let testPart;

  beforeEach(async () => {
    testPart = await createPart({
      name: 'Test Gasket',
      unitCost: 12.75,
    });
  });

  afterEach(async () => {
    await prisma.parts.deleteMany();
    await prisma.$disconnect();
  });

  test('getAllParts should return all parts', async () => {
    const parts = await getAllParts();
    expect(parts.length).toBeGreaterThan(0);
    const names = parts.map((p) => p.name);
    expect(names).toContain('Test Gasket');
  });

  test('getPartByUUID should return the correct part', async () => {
    const part = await getPartByUUID(testPart.uuid);
    expect(part).not.toBeNull();
    expect(part.name).toBe('Test Gasket');
  });

  test('getPartByName should return the correct part', async () => {
    const part = await getPartByName('Test Gasket');
    expect(part).not.toBeNull();
    expect(part.uuid).toBe(testPart.uuid);
  });
});
