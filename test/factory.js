import { createUnit } from '../src/units/create.js';
import { createElectricMeter } from '../src/electricMeters/create.js';

export async function insertUnit(unitNumber = 'test') {
  return await createUnit(unitNumber);
}

export async function insertMeter(unitUuid, meterName = 'Meter 1') {
  return await createElectricMeter(unitUuid, meterName);
}

export async function insertUnitWithMeter(
  unitNumber = 'test',
  meterName = 'Meter 1'
) {
  const unit = await insertUnit(unitNumber);
  const meter = await insertMeter(unit.uuid, meterName);
  return { unit, meter };
}
