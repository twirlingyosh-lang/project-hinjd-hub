import { describe, it, expect } from 'vitest';
import { planSetup, PRODUCTS, openingFor } from '../screenSetup';

const clean34 = PRODUCTS.find((p) => p.value === 'clean-0.75')!;

describe('screen setup', () => {
  it('top deck opening is 10% over product top size', () => {
    expect(openingFor(0.75)).toBe(0.825);
  });
  it('cone closed-circuit makes 75% of feed as clean product', () => {
    expect(planSetup('cone', clean34, 200).productTph).toBe(150);
  });
  it('middle deck holds product bottom size', () => {
    expect(planSetup('jaw', clean34, 200).decks[1].opening).toBe(0.413);
  });
});

describe('plant inputs', () => {
  const p = PRODUCTS.find((x) => x.value === 'clean-0.75')!;
  it('warns when my top screen is bigger than needed', () => {
    const r = planSetup('cone', p, 200, { myScreenOpening: 1 });
    expect(r.steps.some((s) => s.includes('bigger'))).toBe(true);
  });
  it('flags oversize feed for one stage', () => {
    const r = planSetup('cone', p, 200, { feedTopSize: 8 });
    expect(r.steps[0]).toContain('primary crusher');
  });
  it('hard rock lowers product TPH', () => {
    expect(planSetup('cone', p, 200, { feedMaterial: 'basalt' }).productTph).toBeLessThan(planSetup('cone', p, 200).productTph);
  });
});
