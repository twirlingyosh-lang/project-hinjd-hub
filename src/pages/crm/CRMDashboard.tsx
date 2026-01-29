import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Handshake, Receipt, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SolanaMetricsCard } from '@/components/crm/SolanaMetricsCard';

interface DashboardStats {
  totalClients: number;
  totalDeals: number;
  totalDealsValue: number;
  openInvoices: number;
  openInvoicesValue: number;
}

interface RecentDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  client_name: string;
}

export const CRMDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('crm_clients')
        .select('*', { count: 'exact', head: true });

      // Fetch deals with values
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, title, value, stage, client_id');

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('crm_invoices')
        .select('amount, status');

      // Fetch recent deals with client names
      const { data: recentDealsData } = await supabase
        .from('crm_deals')
        .select(`
          id,
          title,
          value,
          stage,
          crm_clients(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const totalDealsValue = deals?.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 0;
      const openInvoices = invoices?.filter(i => i.status !== 'paid') || [];
      const openInvoicesValue = openInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

      setStats({
        totalClients: clientsCount || 0,
        totalDeals: deals?.length || 0,
        totalDealsValue,
        openInvoices: openInvoices.length,
        openInvoicesValue
      });

      setRecentDeals(
        recentDealsData?.map(d => ({
          id: d.id,
          title: d.title,
          value: Number(d.value) || 0,
          stage: d.stage,
          client_name: (d.crm_clients as any)?.name || 'Unknown'
        })) || []
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <CRMLayout title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CRMLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-blue-500/10 text-blue-500',
      qualified: 'bg-yellow-500/10 text-yellow-500',
      proposal: 'bg-purple-500/10 text-purple-500',
      negotiation: 'bg-orange-500/10 text-orange-500',
      closed_won: 'bg-green-500/10 text-green-500',
      closed_lost: 'bg-red-500/10 text-red-500'
    };
    return colors[stage] || 'bg-muted text-muted-foreground';
  };

  return (
    <CRMLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-12" /> : stats?.totalClients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deals
            </CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-12" /> : stats?.totalDeals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? '' : formatCurrency(stats?.totalDealsValue || 0)} pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Invoices
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-12" /> : stats?.openInvoices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? '' : formatCurrency(stats?.openInvoicesValue || 0)} outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.totalDealsValue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Button 
          onClick={() => navigate('/crm/clients/new')}
          className="h-auto py-4 flex flex-col items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Client</span>
        </Button>
        <Button 
          onClick={() => navigate('/crm/deals/new')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
        >
          <Handshake size={20} />
          <span>Create Deal</span>
        </Button>
        <Button 
          onClick={() => navigate('/crm/invoices/new')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
        >
          <Receipt size={20} />
          <span>New Invoice</span>
        </Button>
      </div>

      {/* Recent Deals + Solana Metrics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Your latest pipeline activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/crm/deals')}>
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentDeals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No deals yet. Create your first deal to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentDeals.map(deal => (
                  <div 
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/crm/deals/${deal.id}`)}
                  >
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">{deal.client_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(deal.stage)}`}>
                        {deal.stage.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">{formatCurrency(deal.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solana Wallet Metrics */}
        <SolanaMetricsCard />
      </div>
    </CRMLayout>
  );
};

export default CRMDashboard;
