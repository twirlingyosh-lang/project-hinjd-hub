import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { 
  Shield, 
  DollarSign, 
  GraduationCap, 
  Users, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Radio
} from 'lucide-react';

interface HQMetrics {
  totalRevenue: number;
  businessRevenue: number;
  scholarshipFund: number;
  totalUsers: number;
  totalDiagnostics: number;
  activeDeals: number;
}

export const HQCommandPanel = () => {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [metrics, setMetrics] = useState<HQMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchHQMetrics = useCallback(async () => {
    try {
      // Fetch transaction totals
      const { data: transactions } = await supabase
        .from('hq_transactions')
        .select('amount, business_revenue, scholarship_fund');

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch diagnostics count
      const { count: diagnosticsCount } = await supabase
        .from('equipment_diagnostics')
        .select('*', { count: 'exact', head: true });

      // Fetch active deals count
      const { count: dealsCount } = await supabase
        .from('crm_deals')
        .select('*', { count: 'exact', head: true })
        .not('stage', 'in', '(closed_won,closed_lost)');

      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const businessRevenue = transactions?.reduce((sum, t) => sum + Number(t.business_revenue), 0) || 0;
      const scholarshipFund = transactions?.reduce((sum, t) => sum + Number(t.scholarship_fund), 0) || 0;

      setMetrics({
        totalRevenue,
        businessRevenue,
        scholarshipFund,
        totalUsers: userCount || 0,
        totalDiagnostics: diagnosticsCount || 0,
        activeDeals: dealsCount || 0
      });
    } catch (error) {
      console.error('Error fetching HQ metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchHQMetrics();

      // Subscribe to real-time updates on hq_transactions
      const channel = supabase
        .channel('hq-transactions-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'hq_transactions'
          },
          () => {
            setIsLive(true);
            fetchHQMetrics();
            // Flash effect
            setTimeout(() => setIsLive(false), 2000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, fetchHQMetrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Don't render if not admin or still checking
  if (adminLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className={`border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all duration-500 ${isLive ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">HQ Command</CardTitle>
            {isLive && (
              <Radio className="h-4 w-4 text-green-500 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">
              LIVE
            </Badge>
            <Badge variant="outline" className="border-primary/50 text-primary">
              ADMIN
            </Badge>
          </div>
        </div>
        <CardDescription>Executive Dashboard & Financial Overview • Real-time updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(metrics?.totalRevenue || 0)}
              </p>
            )}
          </div>

          {/* Business Revenue */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Business Revenue</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-blue-500">
                {formatCurrency(metrics?.businessRevenue || 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">80% of transactions</p>
          </div>

          {/* Scholarship Fund */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Scholarship Fund</span>
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(metrics?.scholarshipFund || 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">20% of transactions</p>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-semibold">
              {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.totalUsers}
            </p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-semibold">
              {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.totalDiagnostics}
            </p>
            <p className="text-xs text-muted-foreground">Diagnostics Run</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-semibold">
              {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.activeDeals}
            </p>
            <p className="text-xs text-muted-foreground">Active Deals</p>
          </div>
        </div>

        {/* Banking Actions */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Available Balance</span>
            </div>
            <p className="text-xl font-bold text-green-500">
              {loading ? <Skeleton className="h-6 w-20" /> : formatCurrency(metrics?.businessRevenue || 0)}
            </p>
          </div>
          <Button className="w-full" variant="outline" disabled>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Withdraw Funds (Coming Soon)
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Payout workflow requires Stripe Connect setup
          </p>
        </div>

        {/* Alert Banner */}
        {(metrics?.totalRevenue || 0) === 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-500">
              No transactions recorded yet. Revenue will appear here once orders are processed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HQCommandPanel;
