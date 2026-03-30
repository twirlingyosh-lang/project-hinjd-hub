import React, { useState } from 'react';
import { Activity, TrendingUp, Shield, Download, Users, Lock, Zap, BarChart3, RefreshCw, Plus, Loader2, ShieldCheck, Trash2, Edit3, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/app/AppLayout';
import { useTreasuryData } from '@/hooks/useTreasuryData';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FleetRevenueDashboard } from '@/components/fleet/FleetRevenueDashboard';

const ExecutiveSummary = ({ 
  totalWealth, 
  activeLeases, 
  solPrice,
  onRefresh,
  refreshing 
}: { 
  totalWealth: number; 
  activeLeases: number; 
  solPrice: number;
  onRefresh: () => void;
  refreshing: boolean;
}) => {
  const milestoneTarget = 125000;
  const gap = milestoneTarget - totalWealth;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-2xl border border-indigo-500/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Total Treasury</p>
          <h2 className="text-3xl font-mono font-bold text-white">${totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <button 
          onClick={onRefresh}
          disabled={refreshing}
          className="bg-white/10 p-2 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          {refreshing ? (
            <Loader2 size={20} className="text-indigo-300 animate-spin" />
          ) : (
            <RefreshCw size={20} className="text-indigo-300" />
          )}
        </button>
      </div>
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Milestone Gap</span>
          <span className={`font-bold ${gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {gap > 0 ? `-$${gap.toFixed(2)}` : `+$${Math.abs(gap).toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Active Fleet</span>
          <span className="text-white">{activeLeases} Units</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">SOL Index</span>
          <span className="text-indigo-400 font-bold">${solPrice.toFixed(2)}/SOL</span>
        </div>
      </div>
      <button className="w-full mt-6 py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-50 transition-all">
        Open Remote Kill-Switch
      </button>
    </div>
  );
};

const MilestoneProgress = ({ current, target }: { current: number; target: number }) => {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-end mb-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth to ${(target/1000).toFixed(0)}k</h4>
        <span className="text-sm font-mono font-bold text-emerald-400">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div style={{ width: `${percentage}%` }} className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    </div>
  );
};

const StakingPortfolio = ({ stakedAmount, rewardsEarned, walletBalance }: { stakedAmount: number; rewardsEarned: number; walletBalance: number }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Solana Portfolio</h3>
      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-[10px] text-slate-500">WALLET</p>
        <p className="text-lg font-mono text-white">{walletBalance.toFixed(2)} SOL</p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-[10px] text-slate-500">STAKED</p>
        <p className="text-lg font-mono text-indigo-400">{stakedAmount.toFixed(2)} SOL</p>
      </div>
    </div>
    <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
      <p className="text-[10px] text-slate-500">REWARDS EARNED</p>
      <p className="text-lg font-mono text-emerald-400">+{rewardsEarned.toFixed(4)} SOL</p>
    </div>
  </div>
);

const PerformanceChart = ({ totalWealth }: { totalWealth: number }) => {
  // Generate performance data based on current wealth
  const generateData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = totalWealth * 0.75;
    const increment = (totalWealth - baseValue) / 5;
    
    return months.map((month, i) => ({
      month,
      value: Math.round(baseValue + (increment * i)),
    }));
  };

  const performanceData = generateData();
  const growth = totalWealth > 0 ? ((totalWealth - performanceData[0].value) / performanceData[0].value * 100) : 0;

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Treasury Growth</h3>
          <p className="text-slate-500 text-[10px] mt-1">6-Month Performance</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <TrendingUp size={14} />
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={2}
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const QuickActions = ({ onAddWealth, onAddUnit }: { onAddWealth: () => void; onAddUnit: () => void }) => {
  const actions = [
    { icon: Plus, label: 'Add Wealth', color: 'text-emerald-400', bg: 'bg-emerald-500/10', onClick: onAddWealth },
    { icon: Users, label: 'Add Unit', color: 'text-amber-400', bg: 'bg-amber-500/10', onClick: onAddUnit },
    { icon: Download, label: 'Export Report', color: 'text-blue-400', bg: 'bg-blue-500/10', onClick: () => {} },
    { icon: Lock, label: 'Lock Funds', color: 'text-red-400', bg: 'bg-red-500/10', onClick: () => {} },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button 
            key={action.label}
            onClick={action.onClick}
            className={`${action.bg} p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex flex-col items-center gap-2`}
          >
            <action.icon size={20} className={action.color} />
            <span className="text-xs text-slate-300">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }: { activities: Array<{ id: string; activity_type: string; amount: number | null; status: string; created_at: string }> }) => {
  const formatAmount = (type: string, amount: number | null) => {
    if (amount === null) return type;
    const prefix = ['stake', 'reward', 'deposit'].includes(type) ? '+' : '-';
    return `${prefix}$${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Recent Activity</h3>
        <button className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">View All</button>
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
        ) : (
          activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-emerald-500/20' : 
                  activity.status === 'pending' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
                }`}>
                  <Zap size={14} className={
                    activity.status === 'success' ? 'text-emerald-400' : 
                    activity.status === 'pending' ? 'text-amber-400' : 'text-indigo-400'
                  } />
                </div>
                <div>
                  <p className="text-sm text-white font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <span className={`text-sm font-mono ${
                activity.amount && activity.amount > 0 ? 'text-emerald-400' : 
                activity.amount && activity.amount < 0 ? 'text-red-400' : 'text-slate-300'
              }`}>
                {formatAmount(activity.activity_type, activity.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Admin Control Panel - Only visible to admins
const AdminControlPanel = ({ 
  onSetWealth,
  onResetMetrics,
  onBulkDeposit,
  currentWealth
}: { 
  onSetWealth: (amount: number) => void;
  onResetMetrics: () => void;
  onBulkDeposit: (amount: number) => void;
  currentWealth: number;
}) => {
  const [directAmount, setDirectAmount] = useState('');
  const [bulkAmount, setBulkAmount] = useState('');

  const handleSetWealth = () => {
    const amount = parseFloat(directAmount);
    if (!isNaN(amount) && amount >= 0) {
      onSetWealth(amount);
      setDirectAmount('');
    }
  };

  const handleBulkDeposit = () => {
    const amount = parseFloat(bulkAmount);
    if (!isNaN(amount) && amount > 0) {
      onBulkDeposit(amount);
      setBulkAmount('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-900/20 to-slate-900 p-6 rounded-2xl border border-red-500/30">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-red-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">Admin Controls</h3>
      </div>
      
      <div className="space-y-4">
        {/* Direct Wealth Override */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-[10px] text-slate-500 mb-2">SET TOTAL WEALTH DIRECTLY</p>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={directAmount}
              onChange={(e) => setDirectAmount(e.target.value)}
              placeholder={currentWealth.toFixed(2)}
              className="bg-slate-900 border-slate-700 text-white text-sm h-9"
            />
            <Button 
              onClick={handleSetWealth}
              size="sm"
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
            >
              <Edit3 size={14} />
            </Button>
          </div>
        </div>

        {/* Bulk Deposit */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-[10px] text-slate-500 mb-2">QUICK BULK DEPOSIT</p>
          <div className="flex gap-2">
            <Input
              type="number"
              step="100"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              placeholder="1000"
              className="bg-slate-900 border-slate-700 text-white text-sm h-9"
            />
            <Button 
              onClick={handleBulkDeposit}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <DollarSign size={14} />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onBulkDeposit(5000)}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            +$5,000
          </Button>
          <Button
            onClick={() => onBulkDeposit(10000)}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            +$10,000
          </Button>
        </div>

        {/* Reset Button */}
        <Button 
          onClick={onResetMetrics}
          variant="outline"
          size="sm"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 mt-2"
        >
          <Trash2 size={14} className="mr-2" />
          Reset to Zero
        </Button>

        <p className="text-[10px] text-slate-600 text-center">
          Admin-only. Changes are immediate.
        </p>
      </div>
    </div>
  );
};

// Add Wealth Modal
const AddWealthModal = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, description: string) => void;
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSubmit(numAmount, description || 'Manual deposit');
      setAmount('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Treasury</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Revenue, deposit, etc."
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button type="submit" className="w-full">Add Funds</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Unit Modal
const AddUnitModal = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, revenue: number) => void;
}) => {
  const [unitName, setUnitName] = useState('');
  const [revenue, setRevenue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitName.trim()) {
      onSubmit(unitName, parseFloat(revenue) || 0);
      setUnitName('');
      setRevenue('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Fleet Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Unit Name</label>
            <Input
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="Unit #43"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Monthly Revenue ($)</label>
            <Input
              type="number"
              step="0.01"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0.00"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button type="submit" className="w-full">Add Unit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function HinjdDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const { 
    metrics, 
    fleetUnits,
    activities, 
    solanaData, 
    loading, 
    refresh, 
    updateMetrics, 
    addActivity,
    addFleetUnit 
  } = useTreasuryData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAddWealth, setShowAddWealth] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
    toast({ title: 'Data refreshed' });
  };

  const handleAddWealth = async (amount: number, description: string) => {
    const newTotal = (metrics?.total_wealth || 0) + amount;
    const success = await updateMetrics({ total_wealth: newTotal });
    
    if (success) {
      await addActivity('deposit', amount, description, 'success');
      toast({ title: `Added $${amount.toLocaleString()} to treasury` });
    }
  };

  const handleAddUnit = async (name: string, revenue: number) => {
    const success = await addFleetUnit({ 
      unit_name: name, 
      monthly_revenue: revenue 
    });
    
    if (success) {
      await addActivity('lease', null, `Added ${name}`, 'active');
      toast({ title: `Added ${name} to fleet` });
    }
  };

  // Admin-only handlers
  const handleSetWealth = async (amount: number) => {
    const success = await updateMetrics({ total_wealth: amount });
    if (success) {
      await addActivity('adjustment', amount, 'Admin: Direct wealth override', 'success');
      toast({ title: `Treasury set to $${amount.toLocaleString()}`, description: 'Admin override applied' });
    }
  };

  const handleResetMetrics = async () => {
    const success = await updateMetrics({ 
      total_wealth: 0, 
      staked_sol: 0, 
      rewards_earned: 0,
      active_leases: 0
    });
    if (success) {
      await addActivity('reset', null, 'Admin: Full treasury reset', 'success');
      toast({ title: 'Treasury reset to zero', variant: 'destructive' });
    }
  };

  const handleBulkDeposit = async (amount: number) => {
    const newTotal = (metrics?.total_wealth || 0) + amount;
    const success = await updateMetrics({ total_wealth: newTotal });
    if (success) {
      await addActivity('bulk_deposit', amount, 'Admin: Bulk deposit', 'success');
      toast({ title: `Bulk deposit: +$${amount.toLocaleString()}` });
    }
  };

  if (!user) {
    return (
      <AppLayout title="HINJD Dashboard">
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center">
            <BarChart3 size={48} className="text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-slate-400 mb-4">Access your treasury dashboard</p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="HINJD Dashboard">
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="HINJD Dashboard">
      <div className="min-h-screen bg-black text-slate-200 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <BarChart3 size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Command Center</h1>
              <p className="text-xs text-slate-500">Real-time treasury & fleet operations</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Wealth & Status */}
            <div className="lg:col-span-1 space-y-6">
              <ExecutiveSummary 
                totalWealth={metrics?.total_wealth || 0} 
                activeLeases={metrics?.active_leases || 0} 
                solPrice={solanaData.solPrice}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
              <MilestoneProgress 
                current={metrics?.total_wealth || 0} 
                target={metrics?.milestone_target || 125000} 
              />
              <StakingPortfolio 
                stakedAmount={metrics?.staked_sol || 0} 
                rewardsEarned={metrics?.rewards_earned || 0}
                walletBalance={solanaData.walletBalance}
              />
              
              {/* Admin Control Panel - Only visible to admins */}
              {isAdmin && (
                <AdminControlPanel
                  onSetWealth={handleSetWealth}
                  onResetMetrics={handleResetMetrics}
                  onBulkDeposit={handleBulkDeposit}
                  currentWealth={metrics?.total_wealth || 0}
                />
              )}
            </div>

            {/* Right Column: Performance & Actions */}
            <div className="lg:col-span-2 space-y-6">
              <PerformanceChart totalWealth={metrics?.total_wealth || 0} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActions 
                  onAddWealth={() => setShowAddWealth(true)}
                  onAddUnit={() => setShowAddUnit(true)}
                />
                <RecentActivity activities={activities} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddWealthModal 
        open={showAddWealth} 
        onOpenChange={setShowAddWealth}
        onSubmit={handleAddWealth}
      />
      <AddUnitModal 
        open={showAddUnit} 
        onOpenChange={setShowAddUnit}
        onSubmit={handleAddUnit}
      />
    </AppLayout>
  );
}
