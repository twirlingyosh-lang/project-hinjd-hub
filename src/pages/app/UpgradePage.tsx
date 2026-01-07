import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Check, Zap, Cloud, Sparkles, 
  BarChart3, Shield, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic calculations and troubleshooting',
    features: [
      'Tonnage calculator',
      'Equipment specs library',
      '5 AI troubleshooting/month',
      'Local saved runs',
    ],
    limitations: [
      'No cloud sync',
      'No export options',
      'Basic support',
    ],
    current: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Full access for serious operators',
    badge: 'Popular',
    features: [
      'Unlimited AI troubleshooting',
      'Cloud sync across devices',
      'Export reports (PDF/CSV)',
      'Advanced optimizations',
      'Priority support',
      'Custom equipment profiles',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams and large operations',
    features: [
      'Everything in Pro',
      'Multi-user access',
      'API integration',
      'Custom branding',
      'Dedicated support',
      'Training sessions',
    ],
  },
];

const UpgradePage = () => {
  const { user } = useAuth();

  return (
    <AppLayout title="Upgrade">
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Plan</h2>
          <p className="text-muted-foreground text-sm">
            Unlock more features and boost your productivity
          </p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.highlighted 
                  ? 'border-primary bg-gradient-to-br from-primary/10 to-transparent' 
                  : ''
              }`}
            >
              {plan.badge && (
                <Badge className="absolute top-3 right-3 bg-primary">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {plan.limitations && (
                  <ul className="space-y-2 pt-2 border-t border-border">
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 flex items-center justify-center">–</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                )}

                <Button 
                  className="w-full" 
                  variant={plan.highlighted ? 'default' : 'outline'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Get ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Why Upgrade?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <Cloud className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-xs">Cloud Sync</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs">Unlimited AI</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-xs">Reports</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-xs">Priority Support</p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Already have an account?
            </p>
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UpgradePage;
