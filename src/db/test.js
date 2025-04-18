// /test.js
import prisma from "./prismaClient.js";
import { listUnits } from "./unitFunctions.js";
import { listCatalogParts } from "./partFunctions.js";

async function runTests() {
  console.log("✅ Starting basic database tests...");

  try {
    const units = await listUnits();
    console.log("🏢 Units:", units);

    const parts = await listCatalogParts();
    console.log("🔩 Parts Catalog:", parts);
  } catch (error) {
    console.error("❌ Error accessing database:", error);
  } finally {
    await prisma.$disconnect();
    console.log("✅ Database connection closed.");
  }
}

runTests();
