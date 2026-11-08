export const HUB_PLANS = {
  pro: { priceId: 'price_1UZN5GB2N13DcggI4960b5W4', productId: 'prod_VaYBG7Ko6xptnQ', amount: 4900 },
  enterprise: { priceId: 'price_1UZN5HB2N13DcggIdyL8sKfC', productId: 'prod_VaYB4yGfJN36F9', amount: 30000 },
} as const;

export const PRODUCT_TIERS: Record<string, string> = {
  [HUB_PLANS.pro.productId]: 'pro',
  [HUB_PLANS.enterprise.productId]: 'enterprise',
  'prod_Thsg6srM9owk9O': 'enterprise',
  'prod_ThsgeNu6wH9NSp': 'pro',
};