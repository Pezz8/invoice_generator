import { createBikeSpot } from '../create.js';
import { deleteBikeSpot } from '../delete.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Spot Deletion', () => {
  let spot;

  beforeAll(async () => {
    spot = await createBikeSpot({
      spotNumber: '112',
      rackPosition: 'lower',
    });
  });

  it('should delete a bike spot by UUID', async () => {
    const deleted = await deleteBikeSpot(spot.uuid);

    expect(deleted.uuid).toBe(spot.uuid);

    const check = await prisma.bike_spots.findUnique({
      where: { uuid: spot.uuid },
    });

    expect(check).toBeNull();
  });
});
