import prisma from '../../db/prismaClient.js';
import { createElectricityInvoiceForUnit } from '../createElectricityInvoice.js';
import { createUnit } from '../../units/create.js';
import { createElectricMeter } from '../../electric_meters/create.js';
import { createElectricReading } from '../../electric_readings/create.js';

afterAll(async () => {
  await prisma.electric_readings.deleteMany();
  await prisma.electric_meters.deleteMany();
  await prisma.electricity_invoices.deleteMany();
  await prisma.units.deleteMany();
  await prisma.$disconnect();
});

describe('createElectricityInvoiceForUnit', () => {
  it('should create an invoice with correct usage and charges', async () => {
    const unit = await createUnit('201');

    const meter1 = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter 1',
    });
    const meter2 = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter 2',
    });

    await createElectricReading({
      meterUuid: meter1.uuid,
      readingDate: new Date('2025-04-01'),
      readingValue: 400,
    });
    await createElectricReading({
      meterUuid: meter1.uuid,
      readingDate: new Date('2025-05-01'),
      readingValue: 450,
    });

    await createElectricReading({
      meterUuid: meter2.uuid,
      readingDate: new Date('2025-04-01'),
      readingValue: 500,
    });
    await createElectricReading({
      meterUuid: meter2.uuid,
      readingDate: new Date('2025-05-01'),
      readingValue: 560,
    });

    const rates = { supplyRate: 0.15, deliveryRate: 0.05 };
    const actual = await createElectricityInvoiceForUnit(
      unit.uuid,
      new Date('2025-04-01'),
      new Date('2025-05-01'),
      rates
    );

    expect(actual.unitUuid).toBe(unit.uuid);
    expect(parseFloat(actual.totalUsage)).toBeCloseTo(110.0, 2);
    expect(parseFloat(actual.totalCharge)).toBeCloseTo(22.0, 2);
  });

  it('should throw an error if no meters exist for the unit', async () => {
    const unit = await createUnit('202');
    const rates = { supplyRate: 0.15, deliveryRate: 0.05 };

    await expect(
      createElectricityInvoiceForUnit(
        unit.uuid,
        new Date('2025-04-01'),
        new Date('2025-05-01'),
        rates
      )
    ).rejects.toThrow('No active meters found for unit');
  });

  it('should throw an error if missing readings for meter', async () => {
    const unit = await createUnit('203');
    const meter = await createElectricMeter({
      unitUuid: unit.uuid,
      meterName: 'Meter 1',
    });

    await createElectricReading({
      meterUuid: meter.uuid,
      readingDate: new Date('2025-04-01'),
      readingValue: 100,
    });

    const rates = { supplyRate: 0.15, deliveryRate: 0.05 };

    await expect(
      createElectricityInvoiceForUnit(
        unit.uuid,
        new Date('2025-04-01'),
        new Date('2025-05-01'),
        rates
      )
    ).rejects.toThrow('Start or End reading missing for meter');
  });
});
