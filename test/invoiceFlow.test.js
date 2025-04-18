import prisma from "../src/db/prismaClient.js";
import { createPerson, findPersonByEmail } from "../src/db/personFunctions.js";
import { assignPersonToUnit } from "../src/db/assignmentFunctions.js";
import { createInvoice } from "../src/db/invoiceFunctions.js";
import {
  addMultipleInvoiceParts,
  findPartsByInvoice,
} from "../src/db/partFunctions.js";

describe("Invoice and Part Flow Test", () => {
  let unit;
  let person;
  let assignment;
  let invoice;

  const testUnitNumber = "2B"; // <-- Make sure this exists
  const testPersonEmail = "test.person@example.com";

  beforeAll(async () => {
    // Step 1: Find an existing unit
    unit = await prisma.units.findUnique({
      where: {
        unit_number: testUnitNumber,
      },
    });

    if (!unit) {
      throw new Error(`Unit ${testUnitNumber} not found.`);
    }

    // Step 2: Create a person
    person = await createPerson("Test Person", testPersonEmail);

    // Step 3: Assign person to unit
    assignment = await assignPersonToUnit(unit.id, person.id, "owner");

    // Step 4: Create an invoice
    invoice = await createInvoice({
      unitId: unit.id,
      assignmentId: assignment.id,
      invoiceType: "maintenance",
      laborHours: 2,
      laborCost: 200,
      partsCost: 0,
      jobDate: new Date(),
    });

    // Step 5: Add multiple parts to invoice
    await addMultipleInvoiceParts(invoice.id, [
      { catalogPartName: "Pipe Connector", quantity: 2 },
      { catalogPartName: "Valve", quantity: 1 },
    ]);
  });

  it("should have parts added to the invoice", async () => {
    const parts = await findPartsByInvoice(invoice.id);

    expect(parts.length).toBeGreaterThanOrEqual(2);

    const partNames = parts.map((p) => p.part_name);
    expect(partNames).toContain("Pipe Connector");
    expect(partNames).toContain("Valve");
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.invoice_parts.deleteMany({
      where: { invoice_id: invoice.id },
    });

    await prisma.invoices.delete({
      where: { id: invoice.id },
    });

    await prisma.unit_assignments.delete({
      where: { id: assignment.id },
    });

    await prisma.people.delete({
      where: { id: person.id },
    });

    await prisma.$disconnect();
  });
});
