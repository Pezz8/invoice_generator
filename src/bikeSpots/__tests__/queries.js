import {
  getAllBikeSpots,
  getBikeSpotByUUID,
  getBikeSpotBySpotNumber,
  getAvailableBikeSpots,
} from '../queries.js';
import { createBikeSpot } from '../create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Spot Queries', () => {
  let spot;

  beforeAll(async () => {
    // Create a test spot
    spot = await createBikeSpot({
      spotNumber: '15',
      rackPosition: 'lower',
    });
  });

  afterAll(async () => {
    await prisma.bike_spots.deleteMany();
    await prisma.$disconnect();
  });

  test('getAllBikeSpots returns array of bike spots', async () => {
    const allSpots = await getAllBikeSpots();
    expect(Array.isArray(allSpots)).toBe(true);
    expect(allSpots.length).toBeGreaterThan(0);
  });

  test('getBikeSpotByUUID returns the correct spot', async () => {
    const found = await getBikeSpotByUUID(spot.uuid);
    expect(found).not.toBeNull();
    expect(found.uuid).toBe(spot.uuid);
  });

  test('getBikeSpotBySpotNumber returns the correct spot', async () => {
    const found = await getBikeSpotBySpotNumber(spot.spotNumber);
    expect(found).not.toBeNull();
    expect(found.spotNumber).toBe(spot.spotNumber);
  });

  test('getAvailableBikeSpots includes our test spot', async () => {
    const available = await getAvailableBikeSpots();
    const match = available.find((s) => s.uuid === spot.uuid);
    expect(match).not.toBeUndefined();
  });
});
