import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { beltSavings } from '@/lib/beltSavings';

const fields = [
  { key: 'beltCost', label: 'Belt replacement cost ($)', def: '12000' },
  { key: 'beltsPerYear', label: 'Belts replaced per year', def: '2' },
  { key: 'downtimeHours', label: 'Downtime hours per year (tracking/edge damage)', def: '40' },
  { key: 'downtimeCostPerHour', label: 'Cost of downtime per hour ($)', def: '1500' },
] as const;

export const BeltSavingsCalculator = () => {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.key, f.def])));
  const n = (k: string) => Math.max(0, Number(v[k]) || 0);
  const r = beltSavings({ beltCost: n('beltCost'), beltsPerYear: n('beltsPerYear'), downtimeHours: n('downtimeHours'), downtimeCostPerHour: n('downtimeCostPerHour') });
  const usd = (x: number) => x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="bg-card border border-border rounded-3xl p-8 md:p-12">
      <h3 className="text-2xl industrial-title mb-6 text-center">Your Yearly <span className="text-primary">Savings</span></h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input id={f.key} type="number" min={0} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center gap-4 text-center">
          <div><p className="text-sm text-muted-foreground">Belt savings</p><p className="text-2xl font-bold text-foreground">{usd(r.beltSavings)}</p></div>
          <div><p className="text-sm text-muted-foreground">Downtime savings</p><p className="text-2xl font-bold text-foreground">{usd(r.downtimeSavings)}</p></div>
          <div><p className="text-sm text-muted-foreground">Total per year</p><p className="text-5xl font-bold text-primary">{usd(r.total)}</p></div>
          <p className="text-xs text-muted-foreground">Based on 3x belt life and 60% less tracking downtime. Estimate only.</p>
        </div>
      </div>
    </div>
  );
};
