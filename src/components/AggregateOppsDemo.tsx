import { ShieldCheck, ArrowLeft, Wrench, BarChart3, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AggregateOppsDemoProps {
  onNavigateToHub: () => void;
}

const AggregateOppsDemo = ({ onNavigateToHub }: AggregateOppsDemoProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary text-foreground flex flex-col">
      {/* Header */}
      <header className="p-4 bg-card border-b border-border flex justify-between items-center">
        <button 
          onClick={onNavigateToHub} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <ArrowLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="industrial-title text-xl tracking-tighter text-foreground">
            HINJD <span className="text-primary">AGGS</span>
          </span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <Lock size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Demo Mode</span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* App Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl industrial-title mb-2 text-foreground">Conveyor Diagnostics</h1>
            <p className="text-muted-foreground text-sm italic">
              BeltSaver® Mistracking Troubleshooter
            </p>
          </div>

          {/* Demo Tabs Navigation (disabled) */}
          <Tabs defaultValue="beltsaver" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 bg-card border border-border">
              <TabsTrigger 
                value="beltsaver" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Wrench size={16} className="mr-2" />
                BeltSaver
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                <Lock size={14} className="mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="metrics"
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                <Lock size={14} className="mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beltsaver" className="mt-0">
              {/* Demo BeltSaver Preview */}
              <div className="space-y-4">
                <div className="p-6 bg-card border border-border rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Wrench size={20} className="text-primary" />
                    </div>
                    <h3 className="industrial-title text-lg">BeltSaver® Diagnostics</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our advanced diagnostic wizard helps you identify conveyor belt mistracking issues, 
                    providing prioritized repair recommendations and ROI analysis.
                  </p>
                  
                  {/* Sample diagnostic preview */}
                  <div className="space-y-3 mb-6 opacity-60">
                    <div className="p-3 bg-secondary rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sample Issue</p>
                      <p className="text-sm font-medium">Belt tracking toward the left at head pulley</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Severity</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-semibold">Medium</span>
                        <span className="text-sm">Requires attention within 7 days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/30 rounded-3xl text-center">
                  <Lock size={32} className="mx-auto text-primary mb-4" />
                  <h3 className="industrial-title text-xl mb-2">Unlock Full Access</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    {user 
                      ? "Subscribe to access full diagnostic capabilities, history tracking, and performance metrics."
                      : "Sign in and subscribe to access full diagnostic capabilities, history tracking, and performance metrics."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {!user && (
                      <Button 
                        onClick={() => navigate('/auth')}
                        variant="outline"
                        className="gap-2"
                      >
                        Sign In
                      </Button>
                    )}
                    <Button 
                      onClick={() => navigate('/aggregate-opps')}
                      className="gap-2"
                    >
                      <ShieldCheck size={16} />
                      {user ? 'Subscribe Now' : 'Get Started'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AggregateOppsDemo;