import { describe, expect, it } from 'vitest';
import { isPaidCheckout } from '../purchase';

describe('purchase confirmation', () => {
  it('confirms only a checkout Stripe reports as paid', () => {
    expect(isPaidCheckout('paid')).toBe(true);
  });

  it('does not confirm unpaid, pending or missing payment states', () => {
    expect(isPaidCheckout('unpaid')).toBe(false);
    expect(isPaidCheckout('pending')).toBe(false);
    expect(isPaidCheckout(null)).toBe(false);
    expect(isPaidCheckout(undefined)).toBe(false);
  });
});
