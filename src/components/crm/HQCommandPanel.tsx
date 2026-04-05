import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { toast } from 'sonner';
import type { FunctionsHttpError } from '@supabase/supabase-js';
import { 
  Shield, DollarSign, GraduationCap, Users, Activity,
  AlertTriangle, TrendingUp, Wallet, ArrowUpRight, Radio,
  Clock, Landmark, Zap, PieChart as PieChartIcon, Loader2, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

interface HQMetrics {
  totalRevenue: number;
  businessRevenue: number;
  scholarshipFund: number;
  totalUsers: number;
  totalDiagnostics: number;
  activeDeals: number;
}

const CHART_COLORS = {
  gold: 'hsl(43, 96%, 56%)',
  blue: 'hsl(217, 91%, 60%)',
  green: 'hsl(142, 76%, 36%)',
  red: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 20%, 45%)',
};

// Analytics Charts Component
const HQAnalyticsCharts = ({ metrics }: { metrics: HQMetrics | null }) => {
  // User Onboarding trend (mock monthly data based on current count)
  const totalUsers = metrics?.totalUsers || 0;
  const onboardingData = [
    { month: 'Oct', users: Math.max(1, Math.floor(totalUsers * 0.15)) },
    { month: 'Nov', users: Math.max(1, Math.floor(totalUsers * 0.30)) },
    { month: 'Dec', users: Math.max(2, Math.floor(totalUsers * 0.50)) },
    { month: 'Jan', users: Math.max(2, Math.floor(totalUsers * 0.70)) },
    { month: 'Feb', users: Math.max(3, Math.floor(totalUsers * 0.85)) },
    { month: 'Mar', users: totalUsers },
  ];

  // Throughput data
  const totalDiag = metrics?.totalDiagnostics || 0;
  const throughputData = [
    { month: 'Oct', throughput: Math.floor(totalDiag * 0.1) },
    { month: 'Nov', throughput: Math.floor(totalDiag * 0.2) },
    { month: 'Dec', throughput: Math.floor(totalDiag * 0.35) },
    { month: 'Jan', throughput: Math.floor(totalDiag * 0.55) },
    { month: 'Feb', throughput: Math.floor(totalDiag * 0.78) },
    { month: 'Mar', throughput: totalDiag },
  ];

  // Fault distribution (pie)
  const faultData = [
    { name: 'Belt Tracking', value: Math.max(1, Math.floor(totalDiag * 0.35)), color: CHART_COLORS.gold },
    { name: 'Hydraulic', value: Math.max(1, Math.floor(totalDiag * 0.25)), color: CHART_COLORS.blue },
    { name: 'Electrical', value: Math.max(1, Math.floor(totalDiag * 0.20)), color: CHART_COLORS.red },
    { name: 'Mechanical', value: Math.max(1, Math.floor(totalDiag * 0.20)), color: CHART_COLORS.muted },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* User Onboarding Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">User Onboarding</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={onboardingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 7%)', border: '1px solid hsl(222, 30%, 20%)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="users" stroke={CHART_COLORS.gold} strokeWidth={2} dot={{ fill: CHART_COLORS.gold, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Total Throughput Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Total Throughput</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 7%)', border: '1px solid hsl(222, 30%, 20%)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="throughput" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Faults Diagnosed Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Faults Diagnosed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={faultData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {faultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 7%)', border: '1px solid hsl(222, 30%, 20%)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: 'hsl(215, 20%, 65%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const HQCommandPanel = () => {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [metrics, setMetrics] = useState<HQMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState<'bank' | 'cashapp'>('bank');
  const [withdrawing, setWithdrawing] = useState(false);
  const [lastPayout, setLastPayout] = useState<{ id: string; amount: number; arrival: string } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const fetchHQMetrics = useCallback(async () => {
    try {
      const { data: transactions } = await supabase
        .from('hq_transactions')
        .select('amount, business_revenue, scholarship_fund');

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: diagnosticsCount } = await supabase
        .from('equipment_diagnostics')
        .select('*', { count: 'exact', head: true });

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

      const channel = supabase
        .channel('hq-transactions-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hq_transactions' }, () => {
          setIsLive(true);
          fetchHQMetrics();
          setTimeout(() => setIsLive(false), 2000);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin, fetchHQMetrics]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  if (adminLoading || !isAdmin) return null;

  return (
    <div className="space-y-6">
      <Card className={`border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all duration-500 ${isLive ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">HQ Command</CardTitle>
              {isLive && <Radio className="h-4 w-4 text-green-500 animate-pulse" />}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">LIVE</Badge>
              <Badge variant="outline" className="border-primary/50 text-primary">ADMIN</Badge>
            </div>
          </div>
          <CardDescription>Executive Dashboard & Financial Overview • Real-time updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <p className="text-2xl font-bold text-green-500">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Business Revenue</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(metrics?.businessRevenue || 0)}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">80% of transactions</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Scholarship Fund</span>
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <p className="text-2xl font-bold text-primary">{formatCurrency(metrics?.scholarshipFund || 0)}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">20% of transactions</p>
            </div>
          </div>

          {/* Capital Pipeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Capital Pipeline</span>
              <Badge variant="outline" className="border-primary/50 text-primary text-[10px] ml-auto">ACTIVE</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-card border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Settlement</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">$99,600</p>
                <p className="text-xs text-muted-foreground mt-1">Rio Tinto / Kennecott industrial block</p>
                <Badge className="mt-2 bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">AWAITING CLEARANCE</Badge>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State Grant</span>
                </div>
                <p className="text-2xl font-bold text-emerald-500">$312,000</p>
                <p className="text-xs text-muted-foreground mt-1">Utah REDI Grant — 52 technicians</p>
                <Badge className="mt-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">WINDOW: FEB 1</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Combined Pipeline</span>
                <span className="font-bold text-foreground">$411,600</span>
              </div>
            </div>
          </div>

          {/* 80/20 Profit Split Model */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Vanguard Profit Split (80/20)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Business (80%)</span>
                </div>
                <p className="text-xl font-bold text-blue-500">$1,600</p>
                <p className="text-xs text-muted-foreground mt-1">Net to Josh per milestone</p>
                <div className="mt-3 w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="p-4 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Scholarship (20%)</span>
                </div>
                <p className="text-xl font-bold text-primary">$400</p>
                <p className="text-xs text-muted-foreground mt-1">Per milestone allocation</p>
                <div className="mt-3 w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <span className="block text-lg font-semibold">{loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.totalUsers}</span>
              <span className="block text-xs text-muted-foreground">Total Users</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <span className="block text-lg font-semibold">{loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.totalDiagnostics}</span>
              <span className="block text-xs text-muted-foreground">Diagnostics Run</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <span className="block text-lg font-semibold">{loading ? <Skeleton className="h-6 w-8 mx-auto" /> : metrics?.activeDeals}</span>
              <span className="block text-xs text-muted-foreground">Active Deals</span>
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
            <Dialog open={withdrawOpen} onOpenChange={(open) => {
              setWithdrawOpen(open);
              if (!open) {
                setLastPayout(null);
                setWithdrawAmount('');
                setWithdrawError(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" /> Withdraw Funds
                  </DialogTitle>
                  <DialogDescription>
                    Initiate a payout from your Stripe balance to your connected account.
                  </DialogDescription>
                </DialogHeader>

                {lastPayout ? (
                  <div className="py-6 text-center space-y-3">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="text-lg font-semibold">Payout Initiated</p>
                    <p className="text-sm text-muted-foreground">
                      ${lastPayout.amount.toFixed(2)} → {withdrawDest === 'bank' ? 'Sutton Bank' : 'Cash App'}
                    </p>
                    <p className="text-xs text-muted-foreground">Est. arrival: {lastPayout.arrival}</p>
                    <Badge variant="outline" className="text-xs">{lastPayout.id}</Badge>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    {withdrawError && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {withdrawError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (USD)</label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="500.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination</label>
                      <Select value={withdrawDest} onValueChange={(v) => setWithdrawDest(v as 'bank' | 'cashapp')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Sutton Bank (Primary)</SelectItem>
                          <SelectItem value="cashapp">Cash App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!lastPayout && (
                  <DialogFooter>
                    <Button
                      disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
                      onClick={async () => {
                        setWithdrawing(true);
                        setWithdrawError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) throw new Error('Not authenticated');

                          const res = await supabase.functions.invoke('withdraw-funds', {
                            body: { amount: Number(withdrawAmount), destination: withdrawDest },
                          });

                          if (res.error) {
                            const httpError = res.error as FunctionsHttpError & { context?: Response | string };
                            let functionMessage = res.error.message;

                            if (httpError.context instanceof Response) {
                              try {
                                const payload = await httpError.context.clone().json();
                                functionMessage = payload?.error || functionMessage;
                              } catch {
                                // no-op
                              }
                            }

                            throw new Error(functionMessage);
                          }

                          const result = res.data;
                          if (result?.success === false || result?.error) {
                            throw new Error(result.error || 'Withdrawal failed');
                          }

                          setLastPayout({
                            id: result.payout_id,
                            amount: result.amount,
                            arrival: result.estimated_arrival,
                          });
                          toast.success(`Payout of $${result.amount.toFixed(2)} initiated`);
                          fetchHQMetrics();
                        } catch (err: any) {
                          const message = err.message || 'Withdrawal failed';
                          setWithdrawError(message);
                          toast.error(message);
                        } finally {
                          setWithdrawing(false);
                        }
                      }}
                      className="w-full"
                    >
                      {withdrawing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        <><ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw ${withdrawAmount || '0'}</>
                      )}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Payouts are sent to your connected Stripe external account
            </p>
          </div>

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

      {/* Analytics Charts */}
      <HQAnalyticsCharts metrics={metrics} />
    </div>
  );
};

export default HQCommandPanel;
