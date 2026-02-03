import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripeConfig';
import { ReactNode } from 'react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Custom appearance to match app theme
const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: 'hsl(142 76% 36%)',
    colorBackground: 'hsl(240 10% 4%)',
    colorText: 'hsl(0 0% 98%)',
    colorDanger: 'hsl(0 84% 60%)',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: 'hsl(240 4% 16%)',
      border: '1px solid hsl(240 4% 26%)',
    },
    '.Input:focus': {
      border: '1px solid hsl(142 76% 36%)',
      boxShadow: '0 0 0 1px hsl(142 76% 36%)',
    },
    '.Label': {
      color: 'hsl(240 5% 65%)',
    },
  },
};

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export const StripeProvider = ({ children, clientSecret }: StripeProviderProps) => {
  const options = clientSecret 
    ? { clientSecret, appearance }
    : { appearance };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export { stripePromise };
