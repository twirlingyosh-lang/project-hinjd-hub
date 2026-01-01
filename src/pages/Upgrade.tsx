import AppLayout from '@/components/AppLayout';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Crown, CheckCircle, Zap, Shield, HeadphonesIcon } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Unlimited Diagnostics',
    description: 'Run as many diagnostic sessions as you need without limits',
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Get faster responses from our technical support team',
  },
  {
    icon: HeadphonesIcon,
    title: 'AI Assistant Access',
    description: 'Chat with our AI-powered belt maintenance assistant',
  },
];

const Upgrade = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Crown size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl industrial-title mb-4">
            Upgrade Your <span className="text-primary">Plan</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock the full potential of BeltSaver® diagnostics with unlimited access 
            and premium features for your aggregate operations.
          </p>
        </div>

        {/* Not logged in message */}
        {!user && (
          <Card className="p-6 mb-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in or create an account to subscribe to a plan.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          </Card>
        )}

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Subscription Plans */}
        {user && <SubscriptionPlans />}

        {/* FAQ or Additional Info */}
        <Card className="p-6 mt-12 bg-secondary/50">
          <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">Can I cancel anytime?</p>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have 
                access until the end of your billing period.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">What payment methods do you accept?</p>
              <p className="text-muted-foreground">
                We accept all major credit cards through our secure payment processor.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Do you offer refunds?</p>
              <p className="text-muted-foreground">
                Contact our support team within 7 days of purchase for a full refund.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Upgrade;
