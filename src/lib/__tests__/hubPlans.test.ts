import { describe, it, expect } from 'vitest';
import { HUB_PLANS, PRODUCT_TIERS } from '../../../supabase/functions/_shared/hubPlans';
import { canAccessPaidDashboard, SUBSCRIPTION_TIERS } from '../subscriptionTiers';

describe('live monthly plans', () => {
  it('Pro charges exactly $49 and maps to Pro access', () => {
    expect(HUB_PLANS.pro.amount).toBe(4900);
    expect(SUBSCRIPTION_TIERS.pro.price).toBe(49);
    expect(SUBSCRIPTION_TIERS.pro.price_id).toBe(HUB_PLANS.pro.priceId);
    expect(PRODUCT_TIERS[HUB_PLANS.pro.productId]).toBe('pro');
  });
  it('Enterprise charges exactly $300 and maps to Enterprise access', () => {
    expect(HUB_PLANS.enterprise.amount).toBe(30000);
    expect(SUBSCRIPTION_TIERS.enterprise.price).toBe(300);
    expect(SUBSCRIPTION_TIERS.enterprise.price_id).toBe(HUB_PLANS.enterprise.priceId);
    expect(PRODUCT_TIERS[HUB_PLANS.enterprise.productId]).toBe('enterprise');
  });
});

describe('paid Dashboard access', () => {
  it('unlocks for active Pro and Enterprise subscriptions', () => {
    expect(canAccessPaidDashboard(true, 'pro')).toBe(true);
    expect(canAccessPaidDashboard(true, 'enterprise')).toBe(true);
  });

  it('stays locked for unpaid, free and unrecognized plans', () => {
    expect(canAccessPaidDashboard(false, 'pro')).toBe(false);
    expect(canAccessPaidDashboard(false, 'enterprise')).toBe(false);
    expect(canAccessPaidDashboard(true, 'free')).toBe(false);
    expect(canAccessPaidDashboard(true, null)).toBe(false);
  });
});