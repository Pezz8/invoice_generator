// /testBike.js

import {
  registerBike,
  listAvailableSpots,
  listBikesByUnit,
  deactivateBike,
} from "../src/db/bikeFunctions.js";
import prisma from "../src/db/prismaClient.js";

async function runTests() {
  console.log("✅ Starting Dynamic Bike Room Test Script...");

  try {
    // Step 1: Find any available lower rack spot
    const availableLowerSpots = await listAvailableSpots("lower");
    if (availableLowerSpots.length === 0) {
      throw new Error("No available lower rack spots!");
    }
    const spotId = availableLowerSpots[0].id;

    // Step 2: Find any existing unit
    const unit = await prisma.units.findFirst();
    if (!unit) {
      throw new Error("No unit found. Please insert a unit into the database.");
    }

    // Step 3: Find any existing person
    const person = await prisma.people.findFirst();
    if (!person) {
      throw new Error(
        "No person found. Please insert a person into the database."
      );
    }

    // Step 4: Register a new bike
    const newBike = await registerBike(
      person.id,
      unit.id,
      spotId,
      "Giant Escape 3",
      "Black",
      new Date("2024-05-01")
    );
    console.log("🚲 Registered New Bike:", newBike);

    // Step 5: List bikes by unit
    const bikesInUnit = await listBikesByUnit(unit.id);
    console.log(
      `📋 Bikes registered under unit ${unit.unit_number}:`,
      bikesInUnit
    );

    // Step 6: (Optional) Deactivate the bike
    /*
    const deactivated = await deactivateBike(newBike.id);
    console.log('🛑 Deactivated Bike:', deactivated);
    */
  } catch (error) {
    console.error("❌ Error during bike room test:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("✅ Database connection closed.");
  }
}

runTests();
