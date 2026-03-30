import React, { useState } from 'react';
import { DollarSign, TrendingUp, Truck, CreditCard, Loader2, Zap, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FleetUnit {
  id: string;
  unit_name: string;
  unit_type: string | null;
  status: string;
  monthly_revenue: number | null;
  acquisition_date: string | null;
  notes: string | null;
}

interface FleetRevenueDashboardProps {
  fleetUnits: FleetUnit[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export function FleetRevenueDashboard({ fleetUnits, isAdmin, onRefresh }: FleetRevenueDashboardProps) {
  const { toast } = useToast();
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [autoDepositing, setAutoDepositing] = useState(false);

  const totalMonthlyRevenue = fleetUnits.reduce((sum, u) => sum + (u.monthly_revenue || 0), 0);
  const activeUnits = fleetUnits.filter(u => u.status === 'active');
  const revenueUnits = activeUnits.filter(u => (u.monthly_revenue || 0) > 0);

  const handleCollectPayment = async (unit: FleetUnit) => {
    setCollectingId(unit.id);
    try {
      const { data, error } = await supabase.functions.invoke('fleet-collect-payment', {
        body: {
          unit_id: unit.id,
          amount: unit.monthly_revenue || 0,
          description: `Monthly lease: ${unit.unit_name}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({ title: 'Payment page opened', description: `Collecting $${(unit.monthly_revenue || 0).toFixed(2)} for ${unit.unit_name}` });
      }
    } catch (err: any) {
      toast({ title: 'Payment failed', description: err.message, variant: 'destructive' });
    } finally {
      setCollectingId(null);
    }
  };

  const handleAutoDeposit = async () => {
    setAutoDepositing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fleet-auto-deposit');
      if (error) throw error;
      toast({
        title: 'Fleet Revenue Deposited',
        description: `$${(data?.total_deposited || 0).toFixed(2)} deposited from ${data?.users_processed || 0} user(s)`,
      });
      onRefresh();
    } catch (err: any) {
      toast({ title: 'Auto-deposit failed', description: err.message, variant: 'destructive' });
    } finally {
      setAutoDepositing(false);
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Truck size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Fleet Revenue</h3>
            <p className="text-[10px] text-slate-500">{revenueUnits.length} earning unit(s)</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={handleAutoDeposit}
            disabled={autoDepositing || revenueUnits.length === 0}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
          >
            {autoDepositing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Zap size={14} className="mr-1" />}
            Auto-Deposit All
          </Button>
        )}
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500">MONTHLY</p>
          <p className="text-lg font-mono text-emerald-400">${totalMonthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500">ANNUAL EST.</p>
          <p className="text-lg font-mono text-white">${(totalMonthlyRevenue * 12).toLocaleString()}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500">80/20 SPLIT</p>
          <p className="text-sm font-mono text-indigo-400">${(totalMonthlyRevenue * 0.8).toFixed(0)}</p>
          <p className="text-[9px] text-slate-500">biz / ${(totalMonthlyRevenue * 0.2).toFixed(0)} fund</p>
        </div>
      </div>

      {/* Per-Unit Revenue */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fleetUnits.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No fleet units yet</p>
        ) : (
          fleetUnits.map((unit) => (
            <div key={unit.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${unit.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                <div>
                  <p className="text-sm text-white font-medium">{unit.unit_name}</p>
                  <p className="text-[10px] text-slate-500">{unit.unit_type || 'Standard'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-mono text-emerald-400">
                    ${(unit.monthly_revenue || 0).toLocaleString()}<span className="text-[10px] text-slate-500">/mo</span>
                  </p>
                  <p className={`text-[10px] ${unit.status === 'active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {unit.status}
                  </p>
                </div>
                <Button
                  onClick={() => handleCollectPayment(unit)}
                  disabled={collectingId === unit.id || (unit.monthly_revenue || 0) <= 0}
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-8 px-2"
                >
                  {collectingId === unit.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CreditCard size={12} />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
