import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CardPaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  returnUrl?: string;
  submitLabel?: string;
}

export const CardPaymentForm = ({ 
  onSuccess, 
  onError,
  returnUrl,
  submitLabel = 'Pay Now'
}: CardPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      const message = error.message || 'An unexpected error occurred.';
      setErrorMessage(message);
      onError?.(message);
      toast.error(message);
    } else {
      onSuccess?.();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Lock className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );
};
