import {
  addUnit,
  addPerson,
  assignPersonToUnit,
  createInvoice,
  addInvoicePart,
} from "./dbFunctions.js";

const run = async () => {
  const unit = await addUnit("222");
  const person = await addPerson("John Smith", "john@example.com");
  const assignment = await assignPersonToUnit(unit.id, person.id, "owner");
  const invoice = await createInvoice({
    unitId: unit.id,
    assignmentId: assignment.id,
    invoiceType: "Work Order",
    laborHours: 1,
    laborCost: 75,
    partsCost: 0,
    jobDate: "2025-04-15",
  });
  await addInvoicePart(invoice.id, "Outlet Cover", 2, 8.25);
  await addInvoicePart(invoice.id, "Wire Kit", 1, 15.0);

  console.log("Invoice and parts created successfully!");
};

run();
