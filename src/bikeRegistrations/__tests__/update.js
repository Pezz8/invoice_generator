import { updateBikeRegistration } from '../../bikeRegistrations/update.js';
import { createBikeRegistration } from '../../bikeRegistrations/create.js';
import { createUnit } from '../../units/create.js';
import { createBikeSpot } from '../../bikeSpots/create.js';
import { createPerson } from '../../people/create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Registration Update', () => {
  let registration;

  beforeEach(async () => {
    const person = await createPerson({
      name: 'Update Test Person',
      email: 'update-test@example.com',
    });

    const unit = await createUnit(`U-${Date.now()}`);

    const spot = await createBikeSpot({
      spotNumber: `S-${Date.now()}`,
      rackPosition: 'upper',
    });

    registration = await createBikeRegistration({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      spotUuid: spot.uuid,
      makeModel: 'Old Model',
      color: 'Blue',
      feePaidDate: new Date(),
      nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });
  });

  afterEach(async () => {
    await prisma.bike_registrations.deleteMany();
    await prisma.bike_spots.deleteMany();
    await prisma.units.deleteMany();
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should update the color and make/model of a bike registration', async () => {
    const updates = {
      color: 'Green',
      makeModel: 'Updated Model',
    };

    const updated = await updateBikeRegistration(registration.uuid, updates);

    expect(updated.color).toBe('Green');
    expect(updated.makeModel).toBe('Updated Model');
  });
});
