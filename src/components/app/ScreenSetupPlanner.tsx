import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FEED_MATERIALS, MACHINES, PRODUCTS, planSetup, type Machine } from '@/lib/screenSetup';

export const ScreenSetupPlanner = () => {
  const [productVal, setProductVal] = useState(PRODUCTS[3].value);
  const [feed, setFeed] = useState('250');
  const [material, setMaterial] = useState(FEED_MATERIALS[0].value);
  const [feedTop, setFeedTop] = useState('');
  const [myScreen, setMyScreen] = useState('');
  const plant = { feedMaterial: material, feedTopSize: Number(feedTop) || undefined, myScreenOpening: Number(myScreen) || undefined };
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
            <Label>Your plant's feed material</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FEED_MATERIALS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="feedTop">Biggest feed rock (in)</Label>
              <Input id="feedTop" type="number" step="0.25" min={0} placeholder="e.g. 6" value={feedTop} onChange={(e) => setFeedTop(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="myScreen">Your top screen size (in)</Label>
              <Input id="myScreen" type="number" step="0.0625" min={0} placeholder="e.g. 0.875" value={myScreen} onChange={(e) => setMyScreen(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedTph">Feed rate per machine (TPH)</Label>
            <Input id="feedTph" type="number" min={1} value={feed} onChange={(e) => setFeed(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {MACHINES.map((m) => {
        const r = planSetup(m.value as Machine, product, tph, plant);
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
