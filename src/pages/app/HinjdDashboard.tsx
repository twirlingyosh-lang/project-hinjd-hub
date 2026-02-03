import React, { useState } from 'react';
import { Activity, TrendingUp, Shield, Download, Users, Lock, Zap, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/app/AppLayout';

// Sample performance data for chart
const performanceData = [
  { month: 'Jan', value: 95000 },
  { month: 'Feb', value: 98500 },
  { month: 'Mar', value: 102000 },
  { month: 'Apr', value: 108000 },
  { month: 'May', value: 112500 },
  { month: 'Jun', value: 118667 },
];

const ExecutiveSummary = ({ totalWealth, activeLeases, solPrice }: { totalWealth: number; activeLeases: number; solPrice: number }) => {
  const milestoneTarget = 125000;
  const gap = milestoneTarget - totalWealth;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-2xl border border-indigo-500/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Total Treasury</p>
          <h2 className="text-3xl font-mono font-bold text-white">${totalWealth.toLocaleString()}</h2>
        </div>
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
          <Activity size={20} className="text-indigo-300" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Milestone Gap</span>
          <span className="text-emerald-400 font-bold">-${gap.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Active Fleet</span>
          <span className="text-white">{activeLeases} Units</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">SOL Index</span>
          <span className="text-indigo-400 font-bold">${solPrice}/SOL</span>
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
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth to $125k</h4>
        <span className="text-sm font-mono font-bold text-emerald-400">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div style={{ width: `${percentage}%` }} className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    </div>
  );
};

const StakingPortfolio = ({ stakedAmount, rewardsEarned }: { stakedAmount: number; rewardsEarned: number }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Staking Yield</h3>
      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-[10px] text-slate-500">STAKED</p>
        <p className="text-lg font-mono text-white">{stakedAmount} SOL</p>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-[10px] text-slate-500">REWARDS</p>
        <p className="text-lg font-mono text-emerald-400">+{rewardsEarned} SOL</p>
      </div>
    </div>
  </div>
);

const PerformanceChart = () => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Treasury Growth</h3>
        <p className="text-slate-500 text-[10px] mt-1">6-Month Performance</p>
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
        <TrendingUp size={14} />
        +24.9%
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

const QuickActions = () => {
  const actions = [
    { icon: Shield, label: 'Security Audit', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Download, label: 'Export Report', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'Fleet Status', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Lock, label: 'Lock Funds', color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button 
            key={action.label}
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

const RecentActivity = () => {
  const activities = [
    { type: 'stake', amount: '+5.2 SOL', time: '2h ago', status: 'success' },
    { type: 'lease', amount: 'Unit #38', time: '5h ago', status: 'active' },
    { type: 'reward', amount: '+0.45 SOL', time: '1d ago', status: 'success' },
    { type: 'transfer', amount: '-2.0 SOL', time: '2d ago', status: 'pending' },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Recent Activity</h3>
        <button className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">View All</button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
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
                <p className="text-sm text-white font-medium capitalize">{activity.type}</p>
                <p className="text-[10px] text-slate-500">{activity.time}</p>
              </div>
            </div>
            <span className={`text-sm font-mono ${
              activity.amount.startsWith('+') ? 'text-emerald-400' : 
              activity.amount.startsWith('-') ? 'text-red-400' : 'text-slate-300'
            }`}>
              {activity.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HinjdDashboard() {
  const [data] = useState({
    totalWealth: 118667.70,
    activeLeases: 42,
    solPrice: 114.00,
    stakedAmount: 107.40,
    rewardsEarned: 2.15
  });

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
                totalWealth={data.totalWealth} 
                activeLeases={data.activeLeases} 
                solPrice={data.solPrice} 
              />
              <MilestoneProgress current={data.totalWealth} target={125000} />
              <StakingPortfolio stakedAmount={data.stakedAmount} rewardsEarned={data.rewardsEarned} />
            </div>

            {/* Right Column: Performance & Actions */}
            <div className="lg:col-span-2 space-y-6">
              <PerformanceChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActions />
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
