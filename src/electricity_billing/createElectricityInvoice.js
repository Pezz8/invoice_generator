import prisma from '../db/prismaClient.js';
import { randomUUID } from 'crypto';
import { calculateElectricityBill } from './calculate.js';

/**
 * Create a full electricity invoice for a unit based on readings.
 * @param {String} unitUuid - UUID of the unit to bill
 * @param {Date} startDate - Start of the billing period
 * @param {Date} endDate - End of the billing period
 * @param {Object} rates - { supplyRate: Number, deliveryRate: Number }
 */
export async function createElectricityInvoiceForUnit(
  unitUuid,
  startDate,
  endDate,
  rates
) {
  // 1. Get all meters linked to the unit
  const meters = await prisma.electric_meters.findMany({
    where: { unit_uuid: unitUuid, active: true },
    include: {
      readings: {
        where: {
          reading_date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  if (!meters || meters.length === 0) {
    throw new Error(`No active meters found for unit ${unitUuid}`);
  }

  // 2. Prepare meters and readings for calculation
  const formattedMeters = meters.map((meter) => ({
    meter_uuid: meter.uuid,
    readings: meter.readings,
  }));

  // 3. Calculate total usage and costs
  const bill = calculateElectricityBill(
    formattedMeters,
    rates,
    startDate,
    endDate
  );

  // 4. Create electricity invoice
  const newInvoice = await prisma.electricity_invoices.create({
    data: {
      uuid: randomUUID(),
      unit_uuid: unitUuid,
      billing_start: startDate,
      billing_end: endDate,
      total_usage: parseFloat(bill.totalUsage),
      supply_charge: parseFloat(bill.supplyCharge),
      delivery_charge: parseFloat(bill.deliveryCharge),
      total_charge: parseFloat(bill.totalCharge),
    },
  });

  // 5. Link relevant readings to the new invoice
  const allReadingsToUpdate = meters.flatMap((meter) => meter.readings);

  for (const reading of allReadingsToUpdate) {
    await prisma.electric_readings.update({
      where: { uuid: reading.uuid },
      data: { invoice_uuid: newInvoice.uuid },
    });
  }

  // 6. Return the new invoice
  return newInvoice;
}
