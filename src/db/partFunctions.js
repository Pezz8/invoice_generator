import prisma from './prismaClient.js';

// Add a Part to an Invoice
export async function addInvoicePart(invoiceId, partName, quantity, unitCost) {
  return await prisma.invoice_parts.create({
    data: {
      invoice_id: invoiceId,
      part_name: partName,
      quantity: quantity,
      unit_cost: unitCost,
    },
  });
}

// Add Multiple Parts to an Invoice (automatically using parts catalog)
export async function addMultipleInvoiceParts(invoiceId, partsList) {
  for (const item of partsList) {
    const catalogPart = await prisma.parts.findUnique({
      where: { name: item.catalogPartName },
    });

    if (!catalogPart) {
      throw new Error(`Part '${item.catalogPartName}' not found in catalog.`);
    }

    await prisma.invoice_parts.create({
      data: {
        invoice_id: invoiceId,
        part_name: catalogPart.name,
        quantity: item.quantity,
        unit_cost: catalogPart.unit_cost,
      },
    });
  }
}

// Find all Parts for an Invoice
export async function findPartsByInvoice(invoiceId) {
  return await prisma.invoice_parts.findMany({
    where: {
      invoice_id: invoiceId,
    },
  });
}

// Update a Part
export async function updateInvoicePart(partId, partName, quantity, unitCost) {
  return await prisma.invoice_parts.update({
    where: { id: partId },
    data: {
      part_name: partName,
      quantity: quantity,
      unit_cost: unitCost,
    },
  });
}

// Delete a Part
export async function deleteInvoicePart(partId) {
  return await prisma.invoice_parts.delete({
    where: { id: partId },
  });
}

// Add a Part to the Catalog
export async function createCatalogPart(partName, unitCost) {
  return await prisma.parts.create({
    data: {
      name: partName,
      unit_cost: unitCost,
    },
  });
}

// Find a Part in the Catalog by Name
export async function findCatalogPartByName(partName) {
  return await prisma.parts.findUnique({
    where: {
      name: partName,
    },
  });
}

// List all Parts in the Catalog
export async function listCatalogParts() {
  return await prisma.parts.findMany();
}

// Update a Part's Price in the Catalog
export async function updateCatalogPart(partId, newUnitCost) {
  return await prisma.parts.update({
    where: { id: partId },
    data: {
      unit_cost: newUnitCost,
    },
  });
}

// Delete a Part from the Catalog
export async function deleteCatalogPart(partId) {
  return await prisma.parts.delete({
    where: { id: partId },
  });
}
