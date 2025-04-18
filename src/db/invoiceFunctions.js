import prisma from "./prismaClient.js";

// Create an Invoice
export async function createInvoice({
  unitId,
  assignmentId,
  invoiceType,
  laborHours,
  laborCost,
  partsCost,
  jobDate,
}) {
  return await prisma.invoices.create({
    data: {
      unit_id: unitId,
      assignment_id: assignmentId,
      invoice_type: invoiceType,
      labor_hours: laborHours,
      labor_cost: laborCost,
      parts_cost: partsCost,
      job_date: jobDate,
    },
  });
}

// Find all Invoices for a Unit
export async function findInvoicesByUnit(unitId) {
  return await prisma.invoices.findMany({
    where: {
      unit_id: unitId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

// Update an Invoice (labor hours, labor cost, invoice type, job date)
export async function updateInvoice(
  invoiceId,
  { laborHours, laborCost, invoiceType, jobDate }
) {
  return await prisma.invoices.update({
    where: { id: invoiceId },
    data: {
      labor_hours: laborHours,
      labor_cost: laborCost,
      invoice_type: invoiceType,
      job_date: jobDate,
    },
  });
}

// Delete an Invoice
export async function deleteInvoice(invoiceId) {
  return await prisma.invoices.delete({
    where: { id: invoiceId },
  });
}
