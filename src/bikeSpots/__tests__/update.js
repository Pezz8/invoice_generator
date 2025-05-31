// src/bikeSpots/__tests__/update.test.js

import { createBikeSpot } from '../create.js';
import { updateBikeSpotByUUID } from '../update.js';
import prisma from '../../db/prismaClient.js';

describe('Update Bike Spot', () => {
  let createdSpot;

  beforeAll(async () => {
    createdSpot = await createBikeSpot({
      spotNumber: '155',
      rackPosition: 'upper',
    });
  });

  afterAll(async () => {
    await prisma.bike_spots.deleteMany({});
  });

  it('should update the rack position of a bike spot', async () => {
    const updated = await updateBikeSpotByUUID(createdSpot.uuid, {
      rackPosition: 'lower',
    });

    expect(updated.uuid).toBe(createdSpot.uuid);
    expect(updated.rackPosition).toBe('lower');
  });
});
