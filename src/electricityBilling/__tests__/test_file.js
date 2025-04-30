import { calculateElectricityBill } from '../calculate.js';

describe('calculateElectricityBill', () => {
  test('calculates totalUsage and totalCharge correctly', () => {
    const meters = [
      {
        meterUuid: 'uuid-meter-1',
        readings: [
          { readingDate: new Date('2025-04-01'), readingValue: 200 },
          { readingDate: new Date('2025-05-01'), readingValue: 250 },
        ],
      },
      {
        meterUuid: 'uuid-meter-2',
        readings: [
          { readingDate: new Date('2025-04-01'), readingValue: 300 },
          { readingDate: new Date('2025-05-01'), readingValue: 340 },
        ],
      },
    ];

    const rates = {
      supplyRate: 0.15,
      deliveryRate: 0.05,
    };

    const bill = calculateElectricityBill(
      meters,
      rates,
      new Date('2025-04-01'),
      new Date('2025-05-01')
    );

    expect(bill.totalUsage).toBe(90);
    expect(bill.totalCharge).toBeCloseTo(18);
  });
});
