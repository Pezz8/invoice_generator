import { createBikeSpot } from '../create.js';
import { deleteBikeSpot, softDeleteBikeSpotByUUID } from '../delete.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Spot Deletion', () => {
  let spot;

  beforeAll(async () => {
    spot = await createBikeSpot({
      spotNumber: '122',
      rackPosition: 'lower',
    });
  });

  it('should set active = false for the given UUID', async () => {
    const updated = await softDeleteBikeSpotByUUID(spot.uuid);

    expect(updated.uuid).toBe(spot.uuid);
    expect(updated.active).toBe(false);

    const check = await prisma.bike_spots.findUnique({
      where: { uuid: spot.uuid },
    });
    expect(check?.active).toBe(false);
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
