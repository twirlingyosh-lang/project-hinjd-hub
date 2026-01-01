import AppLayout from '@/components/AppLayout';
import BeltSaverTool from '@/components/BeltSaverTool';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock, Crown, Calculator } from 'lucide-react';
import UsageLimitBanner from '@/components/UsageLimitBanner';
import { useUsageLimit } from '@/hooks/useUsageLimit';

const CalculatorPage = () => {
  const { user } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  const { freeUsesRemaining, hasActiveSubscription, isLoading: usageLoading } = useUsageLimit();

  const loading = subLoading || usageLoading;
  const totalFreeUses = 10;

  // Not logged in
  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl industrial-title mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">
              Create a free account to access the belt mistracking diagnostic calculator.
              You'll get 3 free diagnostic runs to try it out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">Sign In / Sign Up</Link>
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-6" />
              <div className="h-6 bg-muted rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-64 mx-auto" />
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Out of free uses and no subscription
  if (!hasAccess && freeUsesRemaining <= 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-destructive" />
            </div>
            <h1 className="text-2xl industrial-title mb-4">Free Uses Exhausted</h1>
            <p className="text-muted-foreground mb-8">
              You've used all your free diagnostic runs. Upgrade to Pro or Enterprise 
              for unlimited access to all diagnostic tools.
            </p>
            <Button asChild size="lg">
              <Link to="/upgrade">
                <Crown size={20} className="mr-2" />
                Upgrade Now
              </Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="industrial-label mb-2">Diagnostic Tool</p>
          <h1 className="text-2xl md:text-3xl industrial-title mb-2">
            Belt Mistracking <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            BeltSaver® powered troubleshooting assistant
          </p>
        </div>

        {/* Usage Banner */}
        {!hasActiveSubscription && (
          <div className="mb-6">
            <UsageLimitBanner
              freeUsesRemaining={freeUsesRemaining}
              totalFreeUses={totalFreeUses}
              hasActiveSubscription={hasActiveSubscription}
              onSubscribe={() => {}}
              compact
            />
          </div>
        )}

        {/* Calculator Tool */}
        <BeltSaverTool />
      </div>
    </AppLayout>
  );
};

export default CalculatorPage;
