import { createUnit } from '../../units/create.js';
import { createPerson } from '../../people/create.js';
import { createUnitAssignment } from '../create.js';
import { deleteUnitAssignment } from '../delete.js';
import { getUnitAssignmentByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('deleteUnitAssignment', () => {
  let person, unit, assignment;

  beforeEach(async () => {
    unit = await createUnit('Unit DA1');
    person = await createPerson({
      name: 'Delete Test Person',
      email: 'delete@example.com',
    });

    assignment = await createUnitAssignment({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      role: 'tenant',
    });
  });

  afterEach(async () => {
    await prisma.unit_assignments.deleteMany();
    await prisma.people.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should hard delete a unit assignment', async () => {
    await deleteUnitAssignment(assignment.uuid);
    const result = await getUnitAssignmentByUUID(assignment.uuid);
    expect(result).toBeNull();
  });
});
