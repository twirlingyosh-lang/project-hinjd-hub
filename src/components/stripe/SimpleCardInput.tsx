import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleCardInputProps {
  onPaymentMethodCreated?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
  submitLabel?: string;
  showSaveCard?: boolean;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: 'hsl(0 0% 98%)',
      '::placeholder': {
        color: 'hsl(240 5% 45%)',
      },
      iconColor: 'hsl(142 76% 36%)',
    },
    invalid: {
      color: 'hsl(0 84% 60%)',
      iconColor: 'hsl(0 84% 60%)',
    },
  },
  hidePostalCode: false,
};

export const SimpleCardInput = ({ 
  onPaymentMethodCreated, 
  onError,
  submitLabel = 'Add Card',
  showSaveCard = false
}: SimpleCardInputProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      const message = error.message || 'Failed to process card.';
      setErrorMessage(message);
      onError?.(message);
      toast.error(message);
    } else if (paymentMethod) {
      toast.success('Card added successfully!');
      onPaymentMethodCreated?.(paymentMethod.id);
      setIsComplete(true);
    }

    setIsProcessing(false);
  };

  if (isComplete) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-green-500 font-medium">Card added successfully</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your card info is encrypted</span>
      </div>
      
      <div className="p-4 bg-secondary/50 border border-border rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>

      {errorMessage && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {errorMessage}
        </div>
      )}

      {showSaveCard && (
        <p className="text-xs text-muted-foreground">
          Your card will be saved for future payments
        </p>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
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
