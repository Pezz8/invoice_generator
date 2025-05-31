import { createUnitAssignment } from '../create.js';
import { createPerson } from '../../people/create.js';
import { createUnit } from '../../units/create.js';
import prisma from '../../db/prismaClient.js';

describe('createUnitAssignment', () => {
  let person, unit;

  beforeEach(async () => {
    person = await createPerson({
      name: 'Assigned Person',
      email: 'assigned@example.com',
    });

    unit = await createUnit('Unit UA1');
  });

  afterEach(async () => {
    await prisma.unit_assignments.deleteMany();
    await prisma.people.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('should create a unit assignment for a person and unit', async () => {
    const assignment = await createUnitAssignment({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      role: 'tenant', // assuming enum Role is defined in your schema
    });

    expect(assignment).toHaveProperty('uuid');
    expect(assignment.personUuid).toBe(person.uuid);
    expect(assignment.unitUuid).toBe(unit.uuid);
    expect(assignment.role).toBe('tenant');
    expect(assignment.active).toBe(true); // default behavior
  });
});
