export const SUBSCRIPTION_TIERS = {
  enterprise: {
    name: "Enterprise",
    price_id: "price_1SkSvKApXzGOpOgg8flgnodS",
    product_id: "prod_Thsg6srM9owk9O",
    price: 300,
    features: [
      "Unlimited diagnostic analyses",
      "Unlimited AI assistant messages",
      "Priority support",
      "Custom reporting",
      "Team access (coming soon)",
    ],
    usageLimit: null, // unlimited
  },
  pro: {
    name: "Pro",
    price_id: "price_1SkSvRApXzGOpOgg3YvtNViL",
    product_id: "prod_ThsgeNu6wH9NSp",
    price: 49,
    features: [
      "10 diagnostic analyses per month",
      "10 AI assistant messages per month",
      "Email support",
      "Basic reporting",
    ],
    usageLimit: 10,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
