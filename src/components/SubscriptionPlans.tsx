import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown, Zap } from "lucide-react";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscriptionTiers";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionPlansProps {
  onClose?: () => void;
}

export const SubscriptionPlans = ({ onClose }: SubscriptionPlansProps) => {
  const { tier: currentTier, subscribed, createCheckout, openCustomerPortal, isLoading } = useStripeSubscription();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      setLoadingTier(tier);
      await createCheckout(tier);
      onClose?.();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingTier('pro'); // Just to show loading state
      await openCustomerPortal();
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Unlock the full power of AggregateOpps diagnostic tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pro Plan */}
        <Card className={`relative ${currentTier === 'pro' ? 'ring-2 ring-primary' : ''}`}>
          {currentTier === 'pro' && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Current Plan
            </Badge>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>{SUBSCRIPTION_TIERS.pro.name}</CardTitle>
            </div>
            <CardDescription>
              Perfect for individual operators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">${SUBSCRIPTION_TIERS.pro.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              {SUBSCRIPTION_TIERS.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentTier === 'pro' ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleManageSubscription}
                disabled={!!loadingTier}
              >
                {loadingTier ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Manage Subscription
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={() => handleSubscribe('pro')}
                disabled={!!loadingTier || subscribed}
              >
                {loadingTier === 'pro' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {subscribed ? 'Current subscriber' : 'Get Started'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className={`relative ${currentTier === 'enterprise' ? 'ring-2 ring-primary' : 'border-primary/50'}`}>
          {currentTier === 'enterprise' ? (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Current Plan
            </Badge>
          ) : (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500">
              Recommended
            </Badge>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <CardTitle>{SUBSCRIPTION_TIERS.enterprise.name}</CardTitle>
            </div>
            <CardDescription>
              For operations that demand the best
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">${SUBSCRIPTION_TIERS.enterprise.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              {SUBSCRIPTION_TIERS.enterprise.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentTier === 'enterprise' ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleManageSubscription}
                disabled={!!loadingTier}
              >
                {loadingTier ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Manage Subscription
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => handleSubscribe('enterprise')}
                disabled={!!loadingTier}
              >
                {loadingTier === 'enterprise' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {currentTier === 'pro' ? 'Upgrade to Enterprise' : 'Get Enterprise'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {subscribed && (
        <div className="text-center">
          <Button variant="link" onClick={handleManageSubscription}>
            Manage billing & subscription
          </Button>
        </div>
      )}
    </div>
  );
};
