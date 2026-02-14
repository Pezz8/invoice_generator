import { createBikeRegistration } from '../create.js';
import { createPerson } from '../../people/create.js';
import { createUnit } from '../../units/create.js';
import { createBikeSpot } from '../../bikeSpots/create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Registration Creation', () => {
  let person, unit, spot;

  beforeAll(async () => {
    person = await createPerson({
      name: 'Jane Doe',
      email: `jane.${Date.now()}@test.com`,
    });
    unit = await createUnit(`B-${Date.now()}`);
    spot = await createBikeSpot({ rackPosition: 'upper', spotNumber: '188' });
  });

  afterAll(async () => {
    await prisma.bike_registrations.deleteMany();
    await prisma.bike_spots.deleteMany();
    await prisma.units.deleteMany();
    await prisma.people.deleteMany();
    await prisma.$disconnect();
  });

  test('should register a new bike', async () => {
    const feePaidDate = new Date('2025-01-01');

    const bike = await createBikeRegistration({
      personUuid: person.uuid,
      unitUuid: unit.uuid,
      spotUuid: spot.uuid,
      makeModel: 'Giant Escape 3',
      color: 'Black',
      feePaidDate,
      nextDueDate: new Date('2026-01-01'),
    });

    expect(bike).toHaveProperty('uuid');
    expect(bike.personUuid).toBe(person.uuid);
    expect(bike.unitUuid).toBe(unit.uuid);
    expect(bike.spotUuid).toBe(spot.uuid);
    expect(bike.makeModel).toBe('Giant Escape 3');
    expect(bike.color).toBe('Black');
    expect(new Date(bike.feePaidDate)).toEqual(feePaidDate);
  });
});
