import { createUnit } from '../db/unitFunctions';

export function createNewUnit(unitId) {
  // Here we do any validation and error handling
  return createUnit(unitId);
}
