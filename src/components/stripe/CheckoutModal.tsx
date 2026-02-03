import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StripeProvider } from './StripeProvider';
import { CardPaymentForm } from './CardPaymentForm';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceId: string;
  productName: string;
  amount: number;
  onSuccess?: () => void;
}

export const CheckoutModal = ({
  open,
  onOpenChange,
  priceId,
  productName,
  amount,
  onSuccess,
}: CheckoutModalProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !clientSecret) {
      createPaymentIntent();
    }
  }, [open]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Please sign in to continue');
      }

      const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
        body: { priceId, amount },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (fnError) throw fnError;
      if (!data?.clientSecret) throw new Error('Failed to create payment session');

      setClientSecret(data.clientSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
    toast.success('Payment successful!');
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {productName} - {formatAmount(amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
              {error}
            </div>
          )}

          {clientSecret && !isLoading && (
            <StripeProvider clientSecret={clientSecret}>
              <CardPaymentForm
                onSuccess={handleSuccess}
                submitLabel={`Pay ${formatAmount(amount)}`}
              />
            </StripeProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
