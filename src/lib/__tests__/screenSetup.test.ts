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
