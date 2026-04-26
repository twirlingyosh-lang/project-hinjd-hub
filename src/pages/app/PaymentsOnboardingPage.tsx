import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, CheckCircle2, Circle, Loader2, ExternalLink,
  ShieldCheck, Unplug, Zap, ArrowRight, AlertTriangle, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type StepStatus = 'pending' | 'in_progress' | 'complete';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: typeof CreditCard;
  action?: { label: string; href?: string; external?: boolean };
  helper?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Review current setup',
    description: 'Stripe is currently connected in self-managed mode. To switch to Paddle, Stripe must be disconnected first.',
    icon: ShieldCheck,
    helper: 'No live customers will be charged during this migration — your Stripe account at dashboard.stripe.com is unaffected.',
  },
  {
    id: 2,
    title: 'Open the Payments dashboard',
    description: 'Open the built-in Payments dashboard where the Stripe connection is managed.',
    icon: ExternalLink,
    action: { label: 'Open Payments dashboard', external: true },
  },
  {
    id: 3,
    title: 'Disconnect Stripe',
    description: 'In the Payments dashboard, click the three dots (⋯) in the top-right corner and select "Disconnect Stripe".',
    icon: Unplug,
    helper: 'This deletes the stored Stripe API key for this project only. Products and subscriptions in Stripe remain intact.',
  },
  {
    id: 4,
    title: 'Confirm Stripe is disconnected',
    description: 'Mark this step complete once the Payments dashboard shows no active provider.',
    icon: CheckCircle2,
  },
  {
    id: 5,
    title: 'Enable Paddle',
    description: 'Once Stripe is disconnected, reply in chat and Paddle will be enabled with "Josh Cox" as the business name.',
    icon: Zap,
    helper: 'A Paddle sandbox is created instantly so you can test without real money. Live payments require Paddle verification.',
  },
];

const PaymentsOnboardingPage = () => {
  const [stepStatus, setStepStatus] = useState<Record<number, StepStatus>>({
    1: 'in_progress',
    2: 'pending',
    3: 'pending',
    4: 'pending',
    5: 'pending',
  });

  const completedCount = Object.values(stepStatus).filter((s) => s === 'complete').length;
  const progressPct = (completedCount / STEPS.length) * 100;

  const advance = (stepId: number) => {
    setStepStatus((prev) => {
      const next = { ...prev, [stepId]: 'complete' as StepStatus };
      const nextStep = stepId + 1;
      if (next[nextStep] === 'pending') next[nextStep] = 'in_progress';
      return next;
    });
    toast.success(`Step ${stepId} complete`);
  };

  const openPaymentsDashboard = () => {
    advance(2);
    toast.info('Opening Payments dashboard…', {
      description: 'Use the Payments tab in your Lovable workspace.',
    });
  };

  return (
    <AppLayout title="Payments Onboarding">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Switch to Paddle</CardTitle>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Guided
              </Badge>
            </div>
            <CardDescription>
              Replace self-managed Stripe with Paddle (merchant of record) for tax + compliance handling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedCount} of {STEPS.length} steps complete
              </span>
              <span className="font-medium">{Math.round(progressPct)}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Heads up</p>
              <p className="text-xs text-muted-foreground">
                Your Stripe product catalog and subscriptions will not carry over to Paddle. Active Stripe subscriptions stay
                live in Stripe — manage or cancel them in your Stripe dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const status = stepStatus[step.id];
            const Icon = step.icon;
            const isActive = status === 'in_progress';
            const isComplete = status === 'complete';

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isActive ? 'border-primary/50 shadow-md' : isComplete ? 'opacity-70' : 'opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : isActive ? (
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        </div>
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          Step {step.id}
                        </span>
                        {isComplete && (
                          <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">
                            Done
                          </Badge>
                        )}
                        {isActive && (
                          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.helper && (
                        <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-muted pl-2">
                          {step.helper}
                        </p>
                      )}
                      {!isComplete && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {step.id === 2 ? (
                            <Button size="sm" onClick={openPaymentsDashboard} className="gap-1.5">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open Payments dashboard
                            </Button>
                          ) : step.id === 5 ? (
                            <Button
                              size="sm"
                              disabled={!isActive}
                              onClick={() => {
                                advance(5);
                                toast.success('Ready for Paddle', {
                                  description: 'Reply in chat to enable Paddle with "Josh Cox".',
                                });
                              }}
                              className="gap-1.5"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              I'm ready — enable Paddle
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant={isActive ? 'default' : 'outline'}
                              disabled={!isActive}
                              onClick={() => advance(step.id)}
                              className="gap-1.5"
                            >
                              Mark complete
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion */}
        {completedCount === STEPS.length && (
          <Card className="border-green-500/40 bg-green-500/5">
            <CardContent className="p-5 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
              <h3 className="font-semibold">All steps complete</h3>
              <p className="text-xs text-muted-foreground">
                Reply in chat and Paddle will be enabled for "Josh Cox".
              </p>
            </CardContent>
          </Card>
        )}

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/app/settings" className="hover:text-foreground transition-colors">
            ← Back to Settings
          </Link>
          <span>Lovable Payments</span>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentsOnboardingPage;