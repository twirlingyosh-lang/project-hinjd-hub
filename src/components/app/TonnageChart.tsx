import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const TonnageChart = ({ userId }: { userId?: string }) => {
  const [data, setData] = useState<{ date: string; tons: number }[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('throughput_logs').select('log_date, tph, hours').eq('user_id', userId).order('log_date').then(({ data: rows }) => {
      const byDay: Record<string, number> = {};
      (rows ?? []).forEach((r) => { byDay[r.log_date] = (byDay[r.log_date] ?? 0) + Number(r.tph) * Number(r.hours); });
      setData(Object.entries(byDay).map(([date, tons]) => ({ date, tons: Math.round(tons) })));
    });
  }, [userId]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-bold text-foreground mb-4">Tonnage Over Time</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No throughput logs yet. Log production in Smash Guru to see your chart.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} formatter={(v: number) => [`${v.toLocaleString()} tons`, 'Tonnage']} />
              <Line type="monotone" dataKey="tons" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
