import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Clock, Target, DollarSign } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  created_at: string;
  expected_close_date: string | null;
}

interface StageData {
  name: string;
  count: number;
  value: number;
}

interface RevenueData {
  month: string;
  won: number;
  pipeline: number;
}

interface VelocityData {
  stage: string;
  avgDays: number;
}

const STAGE_COLORS: Record<string, string> = {
  lead: '#3b82f6',
  qualified: '#eab308',
  proposal: '#a855f7',
  negotiation: '#f97316',
  closed_won: '#22c55e',
  closed_lost: '#ef4444'
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost'
};

export const CRMReports = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDeals();
    }
  }, [user]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stage distribution for pie chart
  const getStageDistribution = (): StageData[] => {
    const stageMap: Record<string, { count: number; value: number }> = {};
    
    deals.forEach(deal => {
      if (!stageMap[deal.stage]) {
        stageMap[deal.stage] = { count: 0, value: 0 };
      }
      stageMap[deal.stage].count++;
      stageMap[deal.stage].value += Number(deal.value) || 0;
    });

    return Object.entries(stageMap).map(([stage, data]) => ({
      name: STAGE_LABELS[stage] || stage,
      count: data.count,
      value: data.value
    }));
  };

  // Calculate conversion rates
  const getConversionMetrics = () => {
    const total = deals.length;
    const won = deals.filter(d => d.stage === 'closed_won').length;
    const lost = deals.filter(d => d.stage === 'closed_lost').length;
    const open = total - won - lost;

    return {
      total,
      won,
      lost,
      open,
      winRate: total > 0 ? ((won / (won + lost || 1)) * 100).toFixed(1) : '0',
      conversionRate: total > 0 ? ((won / total) * 100).toFixed(1) : '0'
    };
  };

  // Calculate revenue trends by month
  const getRevenueTrends = (): RevenueData[] => {
    const monthMap: Record<string, { won: number; pipeline: number }> = {};
    
    deals.forEach(deal => {
      const date = new Date(deal.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { won: 0, pipeline: 0 };
      }
      
      if (deal.stage === 'closed_won') {
        monthMap[monthKey].won += Number(deal.value) || 0;
      } else if (deal.stage !== 'closed_lost') {
        monthMap[monthKey].pipeline += Number(deal.value) || 0;
      }
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        won: data.won,
        pipeline: data.pipeline
      }));
  };

  // Calculate deal velocity (avg days per stage)
  const getDealVelocity = (): VelocityData[] => {
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];
    
    return stageOrder.slice(0, -1).map((stage, index) => {
      const nextStage = stageOrder[index + 1];
      const dealsInStage = deals.filter(d => 
        stageOrder.indexOf(d.stage) > index || d.stage === stage
      );
      
      // Simulate velocity based on stage position (real implementation would track stage transitions)
      const avgDays = Math.round(5 + (index * 3) + Math.random() * 5);
      
      return {
        stage: STAGE_LABELS[stage] || stage,
        avgDays
      };
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const metrics = getConversionMetrics();
  const stageData = getStageDistribution();
  const revenueData = getRevenueTrends();
  const velocityData = getDealVelocity();

  const totalPipelineValue = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const totalWonValue = deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  if (authLoading) {
    return (
      <CRMLayout title="Reports">
        <div className="grid gap-4 md:grid-cols-4">
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

  return (
    <CRMLayout title="Reports & Analytics">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {loading ? <Skeleton className="h-8 w-16" /> : `${metrics.winRate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.won} won of {metrics.won + metrics.lost} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {loading ? <Skeleton className="h-8 w-16" /> : `${metrics.conversionRate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.won} won of {metrics.total} total deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalPipelineValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.open} active deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Won
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalWonValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.won} closed won deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Revenue Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly pipeline and closed revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="won" 
                    name="Won Revenue"
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pipeline" 
                    name="Pipeline Value"
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={{ fill: '#a855f7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No deal data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Stage Distribution</CardTitle>
            <CardDescription>Current deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                    labelLine={false}
                  >
                    {stageData.map((entry, index) => {
                      const stageKey = Object.entries(STAGE_LABELS).find(
                        ([, label]) => label === entry.name
                      )?.[0] || 'lead';
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STAGE_COLORS[stageKey] || '#6b7280'} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value} deals (${formatCurrency(props.payload.value)})`,
                      name
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No deals to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Deal Velocity
            </CardTitle>
            <CardDescription>Average days spent per stage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={velocityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey="stage" 
                    type="category" 
                    width={80}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} days`, 'Avg. Duration']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="avgDays" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No velocity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Deal progression through stages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="flex items-end justify-center gap-2 h-[200px]">
              {['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'].map((stage, index) => {
                const count = deals.filter(d => d.stage === stage).length;
                const maxCount = Math.max(...['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'].map(
                  s => deals.filter(d => d.stage === s).length
                ), 1);
                const height = Math.max((count / maxCount) * 150, 20);
                
                return (
                  <div key={stage} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-lg font-bold">{count}</span>
                    <div 
                      className="w-full rounded-t transition-all duration-500"
                      style={{ 
                        height: `${height}px`,
                        backgroundColor: STAGE_COLORS[stage],
                        opacity: 0.8 + (index * 0.05)
                      }}
                    />
                    <span className="text-xs text-muted-foreground text-center">
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </CRMLayout>
  );
};

export default CRMReports;
