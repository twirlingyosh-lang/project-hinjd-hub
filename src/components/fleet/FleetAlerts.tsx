import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkThresholds, workOrderIssue, LIMITS, type Reading } from '@/lib/fleetAlerts';
import { downloadRepairPdf } from '@/lib/repairPdf';
import { toast } from 'sonner';

export const FleetAlerts = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Reading[]>([]);
  const [manual, setManual] = useState({ equipment: '', hoursSinceService: '', tempF: '', pressurePsi: '', downtimeHours: '' });
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('equipment_master').select('node_id, model, equipment_type, runtime_hours, telemetry').then(({ data }) => {
      setMachines((data ?? []).map((m: any) => ({
        equipment: [m.equipment_type, m.model, m.node_id].filter(Boolean).join(' · '),
        hoursSinceService: m.telemetry?.hours_since_service ?? m.runtime_hours ?? undefined,
        tempF: m.telemetry?.temp_f,
        pressurePsi: m.telemetry?.pressure_psi,
        downtimeHours: m.telemetry?.downtime_hours,
      })));
    });
  }, [user]);

  const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
  const manualReading: Reading = { equipment: manual.equipment.trim(), hoursSinceService: num(manual.hoursSinceService), tempF: num(manual.tempF), pressurePsi: num(manual.pressurePsi), downtimeHours: num(manual.downtimeHours) };
  const all = [...machines, ...(manualReading.equipment ? [manualReading] : [])].map((r) => ({ r, alerts: checkThresholds(r) }));
  const flagged = all.filter((x) => x.alerts.length > 0);

  const generate = async (r: Reading) => {
    if (!user) return toast.error('Sign in to create work orders');
    const alerts = checkThresholds(r);
    setBusy(r.equipment);
    const row = { user_id: user.id, equipment: r.equipment.slice(0, 200), issue: workOrderIssue(r, alerts).slice(0, 2000), cost: 0, downtime: r.downtimeHours ?? 0, repair_date: new Date().toISOString().split('T')[0], status: 'pending' };
    const { data, error } = await supabase.from('repair_logs').insert(row).select().single();
    setBusy(null);
    if (error || !data) return toast.error('Could not create the work order');
    toast.success('Work order created');
    downloadRepairPdf(data as any);
  };

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Equipment health alerts</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">Limits: {LIMITS.hoursSinceService} hrs since service · {LIMITS.tempF}°F · {LIMITS.pressurePsi} psi · {LIMITS.downtimeHours} hrs downtime.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="col-span-2 sm:col-span-1"><Label htmlFor="fe">Machine</Label><Input id="fe" placeholder="e.g. Cone #2" value={manual.equipment} maxLength={200} onChange={(e) => setManual({ ...manual, equipment: e.target.value })} /></div>
          <div><Label htmlFor="fh">Hrs since service</Label><Input id="fh" type="number" value={manual.hoursSinceService} onChange={(e) => setManual({ ...manual, hoursSinceService: e.target.value })} /></div>
          <div><Label htmlFor="ft">Temp °F</Label><Input id="ft" type="number" value={manual.tempF} onChange={(e) => setManual({ ...manual, tempF: e.target.value })} /></div>
          <div><Label htmlFor="fp">Pressure psi</Label><Input id="fp" type="number" value={manual.pressurePsi} onChange={(e) => setManual({ ...manual, pressurePsi: e.target.value })} /></div>
          <div><Label htmlFor="fd">Downtime hrs</Label><Input id="fd" type="number" value={manual.downtimeHours} onChange={(e) => setManual({ ...manual, downtimeHours: e.target.value })} /></div>
        </div>
        {flagged.length === 0 ? (
          <p className="text-muted-foreground">No machines over their limits.</p>
        ) : flagged.map(({ r, alerts }) => (
          <div key={r.equipment} className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-2">
            <p className="font-semibold text-destructive">⚠ {r.equipment}</p>
            <ul className="list-disc pl-5 text-destructive">{alerts.map((a) => <li key={a.metric}>{a.message}</li>)}</ul>
            <Button size="sm" onClick={() => generate(r)} disabled={busy === r.equipment}>{busy === r.equipment ? 'Creating…' : 'Generate work order'}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
