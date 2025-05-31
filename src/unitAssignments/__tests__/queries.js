import {
  getAllUnitAssignments,
  getUnitAssignmentByUUID,
  getAssignmentsByUnitUUID,
  getAssignmentsByPersonUUID,
} from '../queries.js';

import { createUnitAssignment } from '../create.js';
import { createUnit } from '../../units/create.js';
import { createPerson } from '../../people/create.js';
import prisma from '../../db/prismaClient.js';

describe('unitAssignments queries', () => {
  let unit, person, assignment;

  beforeEach(async () => {
    unit = await createUnit('Unit QA1');
    person = await createPerson({
      name: 'Query Test Person',
      email: 'query@example.com',
    });

    assignment = await createUnitAssignment({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      role: 'owner',
    });
  });

  afterEach(async () => {
    await prisma.unit_assignments.deleteMany();
    await prisma.people.deleteMany();
    await prisma.units.deleteMany();
    await prisma.$disconnect();
  });

  test('getAllUnitAssignments should return at least one assignment', async () => {
    const all = await getAllUnitAssignments();
    expect(all.length).toBeGreaterThan(0);
  });

  test('getUnitAssignmentByUUID should return correct assignment', async () => {
    const result = await getUnitAssignmentByUUID(assignment.uuid);
    expect(result).not.toBeNull();
    expect(result.uuid).toBe(assignment.uuid);
  });

  test('getAssignmentsByUnitUUID should return assignments for given unit', async () => {
    const results = await getAssignmentsByUnitUUID(unit.uuid);
    expect(results.length).toBe(1);
    expect(results[0].unitUuid).toBe(unit.uuid);
  });

  test('getAssignmentsByPersonUUID should return assignments for given person', async () => {
    const results = await getAssignmentsByPersonUUID(person.uuid);
    expect(results.length).toBe(1);
    expect(results[0].personUuid).toBe(person.uuid);
  });
});
