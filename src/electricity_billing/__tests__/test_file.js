import { calculateElectricityBill } from '../calculate.js';

const meters = [
  {
    meter_uuid: 'uuid-meter-1',
    readings: [
      { reading_date: new Date('2025-04-01'), reading_value: 200 },
      { reading_date: new Date('2025-05-01'), reading_value: 250 },
    ],
  },
  {
    meter_uuid: 'uuid-meter-2',
    readings: [
      { reading_date: new Date('2025-04-01'), reading_value: 300 },
      { reading_date: new Date('2025-05-01'), reading_value: 340 },
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

console.log(bill);
