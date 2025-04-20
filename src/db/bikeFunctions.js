import prisma from './prismaClient.js';

// Register a Bike
export async function registerBike(
  personId,
  unitId,
  spotId,
  makeModel,
  color,
  feePaidDate
) {
  // Step 1: Check if the spot already has an active bike assigned
  const existingBike = await prisma.bike_registrations.findFirst({
    where: {
      spot_id: spotId,
      active: true,
    },
  });

  if (existingBike) {
    throw new Error(
      `Spot ${spotId} is already assigned to another active bike.`
    );
  }

  // Step 2: Calculate next fee due date (1 year after feePaidDate)
  const nextDueDate = new Date(feePaidDate);
  nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

  // Step 3: Create the bike registration
  return await prisma.bike_registrations.create({
    data: {
      person_id: personId,
      unit_id: unitId,
      spot_id: spotId,
      make_model: makeModel,
      color: color,
      registration_date: new Date(),
      fee_paid_date: feePaidDate,
      next_due_date: nextDueDate,
      active: true,
    },
  });
}

// List Available Spots (filter by optional rackPosition)
export async function listAvailableSpots(rackPosition = null) {
  const spots = await prisma.bike_spots.findMany({
    where: {
      active: true,
      ...(rackPosition ? { rack_position: rackPosition } : {}),
    },
    include: {
      bike_registrations: {
        where: { active: true },
      },
    },
  });

  // Only return spots with no active bikes
  return spots.filter((spot) => spot.bike_registrations.length === 0);
}

// List Bikes by Unit
export async function listBikesByUnit(unitId) {
  return await prisma.bike_registrations.findMany({
    where: {
      unit_id: unitId,
      active: true,
    },
    include: {
      bike_spots: true,
    },
  });
}

// Deactivate a Bike Registration
export async function deactivateBike(bikeId) {
  return await prisma.bike_registrations.update({
    where: { id: bikeId },
    data: {
      active: false,
    },
  });
}

export async function renewBikeRegistration(bikeId) {
  const bike = await prisma.bike_registrations.findUnique({
    where: { id: bikeId },
  });

  if (!bike) {
    throw new Error(`Bike with ID ${bikeId} not found.`);
  }

  const newDueDate = new Date(bike.next_due_date);
  newDueDate.setFullYear(newDueDate.getFullYear() + 1);

  return await prisma.bike_registrations.update({
    where: { id: bikeId },
    data: {
      next_due_date: newDueDate,
    },
  });
}

export async function reassignBikeSpot(bikeId, newSpotId) {
  // Step 1: Check if the new spot is available
  const existingBike = await prisma.bike_registrations.findFirst({
    where: {
      spot_id: newSpotId,
      active: true,
    },
  });

  if (existingBike) {
    throw new Error(
      `Spot ${newSpotId} is already occupied by another active bike.`
    );
  }

  // Step 2: Update bike's spot_id
  return await prisma.bike_registrations.update({
    where: { id: bikeId },
    data: {
      spot_id: newSpotId,
    },
  });
}
