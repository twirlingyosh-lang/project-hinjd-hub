import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MACHINES, PRODUCTS, planSetup, type Machine } from '@/lib/screenSetup';

export const ScreenSetupPlanner = () => {
  const [productVal, setProductVal] = useState(PRODUCTS[3].value);
  const [feed, setFeed] = useState('250');
  const product = PRODUCTS.find((p) => p.value === productVal)!;
  const tph = Math.max(1, Number(feed) || 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Target Product</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Material to make</Label>
            <Select value={productVal} onValueChange={setProductVal}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRODUCTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedTph">Feed rate per machine (TPH)</Label>
            <Input id="feedTph" type="number" min={1} value={feed} onChange={(e) => setFeed(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {MACHINES.map((m) => {
        const r = planSetup(m.value as Machine, product, tph);
        return (
          <Card key={m.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between">
                <span>{m.label}</span>
                <span className="text-primary">{r.productTph} TPH product</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{r.crusherSetting}</p>
              <div className="grid grid-cols-3 gap-2">
                {r.decks.map((d) => (
                  <div key={d.deck} className="rounded-md bg-secondary/50 p-2">
                    <p className="text-xs text-muted-foreground">{d.deck}</p>
                    <p className="font-bold text-primary">{d.opening}"</p>
                    <p className="text-xs text-muted-foreground">{d.role}</p>
                  </div>
                ))}
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                {r.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </CardContent>
          </Card>
        );
      })}
      <p className="text-xs text-muted-foreground">Field estimates. Confirm against your machine's manufacturer charts and a gradation test.</p>
    </div>
  );
};
