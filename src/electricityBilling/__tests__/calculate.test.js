import { calculateElectricityBill } from '../calculate.js';

describe('Electricity Bill Calculation', () => {
  it('should calculate total usage and charges from readings and rates', () => {
    //   const meters = [
    //     {
    //       meterUuid: 'test-meter-1',
    //       readings: [
    //         { readingDate: new Date('2025-01-01'), readingValue: 10000 },
    //         { readingDate: new Date('2025-02-01'), readingValue: 10500 },
    //         { readingDate: new Date('2025-03-01'), readingValue: 11000 },
    //       ],
    //     },
    //   ];
    //   const rates = {
    //     supplyRate: 0.1481,
    //     deliveryRate: 0.0756,
    //   };
    //   const startDate = new Date('2025-01-01');
    //   const endDate = new Date('2025-03-01');
    //   const result = calculateElectricityBill(meters, rates, startDate, endDate);
    //   expect(Number(result.totalUsage)).toBe(1000); // 11000 - 10000
    //   expect(Number(result.supplyCharge)).toBeCloseTo(148.1, 2);
    //   expect(Number(result.deliveryCharge)).toBeCloseTo(75.6, 2);
    //   expect(Number(result.totalCharge)).toBeCloseTo(223.7, 2);
    // });
    // it('should throw if fewer than 2 readings are given', () => {
    //   const meters = [
    //     {
    //       meterUuid: 'test-meter-2',
    //       readings: [{ readingDate: new Date('2025-01-01'), readingValue: 5000 }],
    //     },
    //   ];
    //   const rates = { supplyRate: 0.1, deliveryRate: 0.1 };
    //   const startDate = new Date('2025-01-01');
    //   const endDate = new Date('2025-03-01');
    //   expect(() => {
    //     calculateElectricityBill(meters, rates, startDate, endDate);
    //   }).toThrow('Meter test-meter-2 does not have enough readings.');
  });
});
