import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_STEPS, DEMO_TTL_MS, advance, loadDemo, newDemo, resetDemo, saveDemo, type DemoState } from '@/lib/demoPortal';

const ACTIONS = ['Admin: send quote', 'Admin: create invoice', 'Simulate payment'];

export const DemoWalkthrough = () => {
  const [d, setD] = useState<DemoState | null>(() => loadDemo(localStorage));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      setD((cur) => (cur ? loadDemo(localStorage) : cur)); // auto-wipe when expired
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const update = (next: DemoState | null) => {
    if (next) saveDemo(localStorage, next); else resetDemo(localStorage);
    setD(next);
  };

  const minsLeft = d ? Math.max(0, Math.ceil((d.createdAt + DEMO_TTL_MS - now) / 60000)) : 0;

  return (
    <Card className="border-dashed border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Test walkthrough <Badge variant="outline">Demo · no real charge</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">Practice the quote-to-paid steps. Everything here stays in this browser only — it never creates real quotes, invoices or Stripe charges.</p>
        {!d ? (
          <Button onClick={() => update(newDemo())}>Start demo: submit a BeltSaver quote</Button>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="font-mono">{d.quote.id}</span>
              <span>{d.quote.product} · ${d.quote.amount.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1" aria-label="Demo status tracker">
              {DEMO_STEPS.map((s, i) => (
                <div key={s} className="space-y-1">
                  <div className={`h-1.5 rounded-full transition-colors ${i <= d.step ? 'bg-primary' : 'bg-muted'}`} />
                  <p className={`text-xs ${i <= d.step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</p>
                </div>
              ))}
            </div>
            {d.step === 2 && (
              <p className="rounded-md bg-secondary/50 p-2 text-xs">Demo pay link: <span className="font-mono">demo://pay/{d.quote.id}</span> (simulated, not a Stripe link)</p>
            )}
            <div className="flex flex-wrap gap-2">
              {d.step < 3 ? (
                <Button onClick={() => update(advance(d))}>{ACTIONS[d.step]}</Button>
              ) : (
                <p className="text-primary font-semibold">Paid ✓ — that's the full flow.</p>
              )}
              <Button variant="outline" onClick={() => update(null)}>Reset demo</Button>
            </div>
            <p className="text-xs text-muted-foreground">Demo clears itself in {minsLeft} min.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
