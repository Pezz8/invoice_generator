import { createUnit } from '../../units/create.js';
import { createPerson } from '../../people/create.js';
import { createUnitAssignment } from '../create.js';
import { updateUnitAssignment } from '../update.js';
import { getUnitAssignmentByUUID } from '../queries.js';
import prisma from '../../db/prismaClient.js';

describe('updateUnitAssignment', () => {
  let person, unit, assignment;

  beforeEach(async () => {
    unit = await createUnit('Unit UAU1');
    person = await createPerson({
      name: 'Update Person',
      email: 'update@example.com',
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

  test('should update the role of the assignment', async () => {
    await updateUnitAssignment(assignment.uuid, { role: 'owner' });
    const updated = await getUnitAssignmentByUUID(assignment.uuid);
    expect(updated.role).toBe('owner');
  });

  test('should mark the assignment inactive', async () => {
    await updateUnitAssignment(assignment.uuid, { active: false });
    const updated = await getUnitAssignmentByUUID(assignment.uuid);
    expect(updated.active).toBe(false);
  });

  test('should update the assigned unit for the assignment', async () => {
    const newUnit = await createUnit('Unit UAU2');

    await updateUnitAssignment(assignment.uuid, { unitUuid: newUnit.uuid });
    const updated = await getUnitAssignmentByUUID(assignment.uuid);

    expect(updated.unitUuid).toBe(newUnit.uuid);
  });
});
