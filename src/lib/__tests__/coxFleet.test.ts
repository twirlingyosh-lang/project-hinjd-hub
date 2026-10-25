import { describe, it, expect } from 'vitest';
import { COX_AGGS, pricePerTon, quoteTotal, tonsFromArea } from '../coxAggs';
import { checkThresholds } from '../fleetAlerts';

describe('Cox Aggs pricing', () => {
  const base = COX_AGGS.find((p) => p.id === 'crusher-run')!;
  it('uses the volume tier for 100+ tons', () => {
    expect(pricePerTon(base, 99)).toBe(18);
    expect(pricePerTon(base, 100)).toBe(16);
  });
  it('totals multiple lines', () => {
    expect(quoteTotal([{ productId: 'crusher-run', tons: 10 }, { productId: 'rip-rap', tons: 100 }])).toBe(180 + 3400);
  });
  it('converts area to tons at 1.4 t/yd³', () => {
    expect(tonsFromArea(27, 10, 12)).toBe(14);
  });
});

describe('fleet thresholds', () => {
  it('flags temperature over 220°F', () => {
    expect(checkThresholds({ equipment: 'Cone', tempF: 230 }).map((a) => a.metric)).toEqual(['tempF']);
  });
  it('no alert at the limit', () => {
    expect(checkThresholds({ equipment: 'Cone', tempF: 220, pressurePsi: 3000, hoursSinceService: 500, downtimeHours: 8 })).toHaveLength(0);
  });
});
