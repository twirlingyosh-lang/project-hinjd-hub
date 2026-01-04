import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useToast } from '@/hooks/use-toast';
import AggregateOppsApp from '@/components/AggregateOppsApp';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const AggregateOpps = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { checkSubscription, subscribed, isLoading } = useStripeSubscription();
  const { toast } = useToast();
  const [showPlans, setShowPlans] = useState(false);

  // Handle checkout success/cancel
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast({
        title: "Subscription activated!",
        description: "Thank you for subscribing. Your access is now active.",
      });
      // Refresh subscription status
      checkSubscription();
      // Clear the query param
      setSearchParams({});
    } else if (checkoutStatus === 'canceled') {
      toast({
        title: "Checkout canceled",
        description: "Your subscription was not completed.",
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, checkSubscription]);

  // Show subscription plans if user is logged in but not subscribed
  useEffect(() => {
    if (!isLoading && user && !subscribed) {
      // Delay to let user see the app first
      const timer = setTimeout(() => setShowPlans(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, subscribed]);

  const handleNavigateToHub = () => {
    navigate('/');
  };

  return (
    <>
      <AggregateOppsApp onNavigateToHub={handleNavigateToHub} />
      
      <Dialog open={showPlans} onOpenChange={setShowPlans}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SubscriptionPlans onClose={() => setShowPlans(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AggregateOpps;
