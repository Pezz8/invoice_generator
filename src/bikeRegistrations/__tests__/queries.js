import {
  getAllBikeRegistrations,
  getBikeRegistrationByUUID,
  getBikeRegistrationsByPersonUUID,
  getBikeRegistrationsByUnitUUID,
  getActiveBikeRegistrations,
} from '../../bikeRegistrations/queries.js';
import { createBikeRegistration } from '../../bikeRegistrations/create.js';
import { createUnit } from '../../units/create.js';
import { createBikeSpot } from '../../bikeSpots/create.js';
import { createPerson } from '../../people/create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Registration Queries', () => {
  let registration;

  beforeEach(async () => {
    // Create prerequisite data
    const person = await createPerson({
      name: 'Test Person',
      email: 'test@example.com',
    });

    const unit = await createUnit(`B-${Date.now()}`);

    const spot = await createBikeSpot({
      spotNumber: `L-${Date.now()}`,
      rackPosition: 'lower',
    });

    registration = await createBikeRegistration({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      spotUuid: spot.uuid,
      makeModel: 'Trek X100',
      color: 'Red',
      feePaidDate: new Date(),
      nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year later
    });
  });

  afterEach(async () => {
    await prisma.bike_registrations.deleteMany();
    await prisma.bike_spots.deleteMany();
    await prisma.units.deleteMany();
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should return all bike registrations', async () => {
    const all = await getAllBikeRegistrations();
    expect(all.length).toBeGreaterThan(0);
  });

  test('should find registration by UUID', async () => {
    const result = await getBikeRegistrationByUUID(registration.uuid);
    expect(result?.uuid).toBe(registration.uuid);
  });

  test('should list registrations by person UUID', async () => {
    const result = await getBikeRegistrationsByPersonUUID(
      registration.personUuid
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].personUuid).toBe(registration.personUuid);
  });

  test('should list registrations by unit UUID', async () => {
    const result = await getBikeRegistrationsByUnitUUID(registration.unitUuid);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].unitUuid).toBe(registration.unitUuid);
  });

  test('should return only active bike registrations', async () => {
    const result = await getActiveBikeRegistrations();
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.active)).toBe(true);
  });
});
