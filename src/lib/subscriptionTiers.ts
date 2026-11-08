export const SUBSCRIPTION_TIERS = {
  enterprise: {
    name: "Enterprise",
    price_id: "price_1UZN5HB2N13DcggIdyL8sKfC",
    product_id: "prod_VaYB4yGfJN36F9",
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
    price_id: "price_1UZN5GB2N13DcggI4960b5W4",
    product_id: "prod_VaYBG7Ko6xptnQ",
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
