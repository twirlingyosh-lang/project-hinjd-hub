import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Layers, Wrench, Calculator, QrCode, Crown, 
  ArrowRight, Sparkles, TrendingUp, Shield 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const quickActions = [
  { 
    path: '/app/materials', 
    icon: Layers, 
    label: 'Materials',
    description: 'Yardage & aggregate types',
    color: 'bg-blue-500/10 text-blue-400'
  },
  { 
    path: '/app/equipment', 
    icon: Wrench, 
    label: 'Equipment',
    description: 'Crusher & screen specs',
    color: 'bg-green-500/10 text-green-400'
  },
  { 
    path: '/app/calculator', 
    icon: Calculator, 
    label: 'Calculator',
    description: 'Troubleshoot & optimize',
    color: 'bg-primary/10 text-primary'
  },
];

const AppHome = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      {/* Hero Section with QR */}
      <section className="relative px-4 pt-6 pb-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Aggregate Tools</h1>
            <p className="text-sm text-muted-foreground">Industrial optimization suite</p>
          </div>
          {!user && (
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        {/* QR Scan Hero */}
        <Card className="bg-card/50 border-primary/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <QrCode className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Quick Launch</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Scan equipment QR codes to instantly load specs
                </p>
                <Button size="sm" className="gap-2">
                  <Sparkles size={14} />
                  Scan QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions Grid */}
      <section className="px-4 py-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <Card className="hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium Upsell */}
      {!user && (
        <section className="px-4 py-6">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Save unlimited runs, access AI optimizations, and sync across devices
                  </p>
                  <div className="flex gap-2">
                    <Link to="/app/upgrade">
                      <Button size="sm">View Plans</Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Features List */}
      <section className="px-4 py-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Why Aggregate Tools?
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <TrendingUp className="text-green-400" size={20} />
            <span className="text-sm">Optimize crusher output by up to 15%</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Shield className="text-blue-400" size={20} />
            <span className="text-sm">Industry-standard calculations</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Sparkles className="text-primary" size={20} />
            <span className="text-sm">AI-powered troubleshooting</span>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default AppHome;
