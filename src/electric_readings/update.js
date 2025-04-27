import prisma from '../db/prismaClient.js';

/**
 * Update a reading by UUID.
 * @param {string} readingUuid
 * @param {Object} updates
 */
export async function updateElectricReading(readingUuid, updates) {
  return await prisma.electric_readings.update({
    where: { uuid: readingUuid },
    data: updates,
  });
}

/**
 * Link an electric reading to an electricity invoice.
 * @param {string} readingUuid
 * @param {string} invoiceUuid
 */
export async function attachReadingToInvoice(readingUuid, invoiceUuid) {
  return await prisma.electric_readings.update({
    where: { uuid: readingUuid },
    data: { invoice_uuid: invoiceUuid },
  });
}
