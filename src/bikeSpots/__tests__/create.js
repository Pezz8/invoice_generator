import { createBikeSpot } from '../create.js';
import prisma from '../../db/prismaClient.js';

describe('Bike Spot Creation', () => {
  afterAll(async () => {
    await prisma.bike_spots.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a bike spot with rack position', async () => {
    const spotData = {
      spotNumber: '11',
      rackPosition: 'lower',
    };

    const result = await createBikeSpot(spotData);

    expect(result).toHaveProperty('uuid');
    expect(result.spotNumber).toBe('11');
    expect(result.rackPosition).toBe('lower');
    expect(result.active).toBe(true); // default from schema
  });
});
