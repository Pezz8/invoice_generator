/**
 * Calculate total usage and cost across multiple meters.
 *
 * @param {Array} meters - Array of meters [{ meterUuid, readings: [{ readingDate, readingValue }] }]
 * @param {Object} rates - { supplyRate: Number, deliveryRate: Number }
 * @param {Date} startDate - Start of billing period
 * @param {Date} endDate - End of billing period
 * @returns {Object} - { totalUsage: Number, supplyCharge: Number, deliveryCharge: Number, totalCharge: Number, meterDetails: Array }
 */
export function calculateElectricityBill(meters, rates, startDate, endDate) {
  if (!meters || meters.length === 0) {
    throw new Error('No meters provided.');
  }

  let totalUsage = 0;
  const meterDetails = [];

  for (const meter of meters) {
    if (!meter.readings || meter.readings.length < 2) {
      throw new Error(
        `Meter ${meter.meterUuid} does not have enough readings.`
      );
    }

    const readings = [...meter.readings].sort(
      (a, b) => new Date(a.readingDate) - new Date(b.readingDate)
    );

    const startReading = readings.find(
      (r) => new Date(r.readingDate).getTime() === new Date(startDate).getTime()
    );
    const endReading = readings.find(
      (r) => new Date(r.readingDate).getTime() === new Date(endDate).getTime()
    );

    if (!startReading || !endReading) {
      throw new Error(
        `Start or end reading missing for meter ${meter.meterUuid}.`
      );
    }

    const usage = endReading.readingValue - startReading.readingValue;

    if (usage < 0) {
      throw new Error(
        `Invalid readings for meter ${meter.meterUuid}. Usage cannot be negative.`
      );
    }

    totalUsage += usage;

    meterDetails.push({
      meterUuid: meter.meterUuid,
      startValue: startReading.readingValue,
      endValue: endReading.readingValue,
      usage: usage.toFixed(2),
    });
  }

  const supplyCharge = totalUsage * rates.supplyRate;
  const deliveryCharge = totalUsage * rates.deliveryRate;
  const totalCharge = supplyCharge + deliveryCharge;

  return {
    totalUsage: totalUsage.toFixed(2),
    supplyCharge: supplyCharge.toFixed(2),
    deliveryCharge: deliveryCharge.toFixed(2),
    totalCharge: totalCharge.toFixed(2),
    meterDetails,
  };
}
