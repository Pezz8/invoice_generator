import { createPart } from '../create.js';
import { deletePartByUUID, softDeletePartByUUID } from '../delete.js';
import { getPartByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('deletePart', () => {
  let part;

  beforeEach(async () => {
    part = await createPart({
      name: 'Disposable Filter',
      unitCost: 9.99,
    });
  });

  afterEach(async () => {
    await prisma.parts.deleteMany();
    await prisma.$disconnect();
  });

  test('should hard delete a part by UUID', async () => {
    await deletePartByUUID(part.uuid);
    const result = await getPartByUUID(part.uuid);
    expect(result).toBeNull();
  });

  test('should soft delete a part by setting active to false', async () => {
    // Assume the function softDeletePartByUUID is implemented
    await softDeletePartByUUID(part.uuid);
    const result = await getPartByUUID(part.uuid);
    expect(result).not.toBeNull();
    expect(result.active).toBe(false);
  });
});
