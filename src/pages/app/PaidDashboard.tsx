import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  Layers,
  LayoutDashboard,
  Loader2,
  Lock,
  RefreshCw,
  Wrench,
} from 'lucide-react';
import { AppLayout } from '@/components/app/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { supabase } from '@/integrations/supabase/client';
import { canAccessPaidDashboard, SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';
import { toast } from 'sonner';

type AccountCounts = { quotes: number; invoices: number; diagnostics: number };

export default function PaidDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    subscribed,
    tier,
    subscriptionEnd,
    isLoading,
    error,
    checkSubscription,
    openCustomerPortal,
  } = useStripeSubscription();
  const [counts, setCounts] = useState<AccountCounts>({ quotes: 0, invoices: 0, diagnostics: 0 });
  const [countsLoading, setCountsLoading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const hasAccess = canAccessPaidDashboard(subscribed, tier);
  const plan = tier ? SUBSCRIPTION_TIERS[tier] : null;

  useEffect(() => {
    if (!user || !hasAccess) return;
    setCountsLoading(true);
    (async () => {
      const [quotes, invoices, belt, equipment] = await Promise.all([
        supabase.from('quote_requests').select('id', { count: 'exact', head: true }).ilike('email', user.email ?? ''),
        supabase.from('crm_invoices').select('id', { count: 'exact', head: true }),
        supabase.from('belt_diagnostics').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('equipment_diagnostics').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setCounts({
        quotes: quotes.count ?? 0,
        invoices: invoices.count ?? 0,
        diagnostics: (belt.count ?? 0) + (equipment.count ?? 0),
      });
      setCountsLoading(false);
    })();
  }, [user, hasAccess]);

  const manageBilling = async () => {
    setManagingBilling(true);
    try {
      await openCustomerPortal();
    } catch {
      toast.error('Could not open billing. Please try again.');
    } finally {
      setManagingBilling(false);
    }
  };

  const refreshPlan = async () => {
    await checkSubscription();
    toast.success('Plan status refreshed');
  };

  return (
    <AppLayout title="Account Dashboard">
      <Helmet>
        <title>Account Dashboard | HINJD Hub</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {authLoading || (user && isLoading) ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Checking your plan" />
        </div>
      ) : !user ? (
        <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
          <Card className="w-full text-center">
            <CardHeader>
              <Lock className="mx-auto mb-2 h-10 w-10 text-primary" />
              <CardTitle>Sign in to your Dashboard</CardTitle>
              <CardDescription>Use the same account you used when purchasing Pro or Enterprise.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full"><Link to="/auth?next=/app/dashboard">Sign in</Link></Button>
            </CardContent>
          </Card>
        </div>
      ) : !hasAccess ? (
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
          <Card className="w-full">
            <CardHeader className="text-center">
              <Lock className="mx-auto mb-2 h-10 w-10 text-primary" />
              <CardTitle>Unlock your Account Dashboard</CardTitle>
              <CardDescription>
                An active Pro or Enterprise plan unlocks your account overview, billing controls and customer records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-center text-sm text-destructive">We could not confirm your plan. Refresh to try again.</p>}
              <Button asChild className="w-full"><Link to="/app/upgrade">View Pro and Enterprise</Link></Button>
              <Button variant="outline" className="w-full" onClick={refreshPlan} disabled={isLoading}>
                <RefreshCw className={isLoading ? 'animate-spin' : ''} /> Refresh plan status
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Just paid? Refresh your plan status after Stripe confirms the purchase.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="gap-1"><CheckCircle2 /> {plan?.name} active</Badge>
              </div>
              <h1 className="text-3xl font-bold">Your Account Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Your subscription, billing and customer records in one place.</p>
            </div>
            <Button variant="outline" onClick={refreshPlan} disabled={isLoading}>
              <RefreshCw className={isLoading ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardDescription>Current plan</CardDescription><CardTitle>{plan?.name}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${plan?.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="mt-2 text-sm text-muted-foreground">Paid features are unlocked for this account.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardDescription>Next renewal</CardDescription><CardTitle>{subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'See billing portal'}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Your plan renews monthly unless canceled in the billing portal.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardDescription>Account email</CardDescription><CardTitle className="break-all text-lg">{user.email}</CardTitle></CardHeader>
              <CardContent><Button asChild variant="outline" size="sm"><Link to="/app/account">Account settings <ArrowRight /></Link></Button></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your customer records</CardTitle>
              <CardDescription>Live totals from your Customer Portal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Quotes', value: counts.quotes },
                { label: 'Invoices', value: counts.invoices },
                { label: 'Diagnostics', value: counts.diagnostics },
              ].map((item) => (
                <Link key={item.label} to="/portal" className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/50">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-3xl font-bold">{countsLoading ? '—' : item.value}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm text-primary">Open portal <ArrowRight className="h-3 w-3" /></span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Billing and receipts</CardTitle><CardDescription>Update your card, cancel, or download Stripe invoices and receipts.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={manageBilling} disabled={managingBilling}>
                  {managingBilling ? <Loader2 className="animate-spin" /> : <CreditCard />} Manage billing
                </Button>
                <Button asChild variant="outline"><Link to="/portal"><FileText /> View invoices</Link></Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Get to work</CardTitle><CardDescription>Open the tools included with your plan.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link to="/app/equipment"><Wrench /> Diagnostics</Link></Button>
                <Button asChild variant="outline"><Link to="/aggregate-opps"><Layers /> Materials</Link></Button>
                <Button asChild variant="outline"><Link to="/beltsaver/quote">New quote</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
