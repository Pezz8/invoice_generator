import { softDeleteBikeRegistration } from '../../bikeRegistrations/delete.js';
import { createBikeRegistration } from '../../bikeRegistrations/create.js';
import { createUnit } from '../../units/create.js';
import { createBikeSpot } from '../../bikeSpots/create.js';
import { createPerson } from '../../people/create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Registration Deletion', () => {
  let registration;

  beforeEach(async () => {
    const person = await createPerson({
      name: 'Delete Test',
      email: 'delete@example.com',
    });

    const unit = await createUnit(`D-${Date.now()}`);
    const spot = await createBikeSpot({
      spotNumber: `DEL-${Date.now()}`,
      rackPosition: 'upper',
    });

    registration = await createBikeRegistration({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      spotUuid: spot.uuid,
      makeModel: 'Cannondale Quick',
      color: 'Black',
      feePaidDate: new Date(),
      nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 6 months
    });
  });

  afterEach(async () => {
    await prisma.bike_registrations.deleteMany();
    await prisma.bike_spots.deleteMany();
    await prisma.units.deleteMany();
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should soft delete the bike registration (set active = false)', async () => {
    const deleted = await softDeleteBikeRegistration(registration.uuid);
    expect(deleted.uuid).toBe(registration.uuid);
    expect(deleted.active).toBe(false);

    const fetched = await prisma.bike_registrations.findUnique({
      where: { uuid: registration.uuid },
    });
    expect(fetched?.active).toBe(false);
  });
});
