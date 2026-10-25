import { describe, it, expect } from 'vitest';
import { beltSavings } from '../beltSavings';

describe('beltSavings', () => {
  it('3x belt life saves two thirds of belt spend', () => {
    expect(beltSavings({ beltCost: 12000, beltsPerYear: 3, downtimeHours: 0, downtimeCostPerHour: 0 }).beltSavings).toBe(24000);
  });
  it('cuts downtime cost by 60%', () => {
    expect(beltSavings({ beltCost: 0, beltsPerYear: 0, downtimeHours: 10, downtimeCostPerHour: 1000 }).downtimeSavings).toBe(6000);
  });
});
