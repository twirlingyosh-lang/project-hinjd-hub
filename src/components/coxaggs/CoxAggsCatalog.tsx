import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COX_AGGS, pricePerTon, quoteTotal, tonsFromArea } from '@/lib/coxAggs';
import { toast } from 'sonner';

const contact = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  company: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(40).optional(),
});

export const CoxAggsCatalog = () => {
  const [tons, setTons] = useState<Record<string, string>>({});
  const [calc, setCalc] = useState({ l: '', w: '', d: '' });
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const lines = COX_AGGS.map((p) => ({ productId: p.id, tons: Math.max(0, Number(tons[p.id]) || 0) })).filter((l) => l.tons > 0);
  const total = quoteTotal(lines);
  const calcTons = tonsFromArea(Number(calc.l) || 0, Number(calc.w) || 0, Number(calc.d) || 0);
  const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const submit = async () => {
    const parsed = contact.safeParse(Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== '')));
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (lines.length === 0) return toast.error('Enter tons for at least one product');
    setBusy(true);
    const details = lines.map((l) => {
      const p = COX_AGGS.find((x) => x.id === l.productId)!;
      return { product: p.name, tons: l.tons, price_per_ton: pricePerTon(p, l.tons) };
    });
    const { error } = await supabase.from('quote_requests').insert({
      ...parsed.data,
      product: 'cox_aggs',
      details,
      estimated_total: Math.round(total),
      quantity: Math.round(lines.reduce((s, l) => s + l.tons, 0)),
      message: details.map((d) => `${d.tons} t ${d.product} @ $${d.price_per_ton}/t`).join('; '),
    } as any);
    setBusy(false);
    if (error) return toast.error("Couldn't send your quote request. Please try again.");
    setSent(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {COX_AGGS.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{p.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{p.spec}</p>
              <p className="text-muted-foreground">Use: {p.use}</p>
              <div className="flex gap-2 text-xs">
                {p.tiers.map((t) => (
                  <span key={t.minTons} className="rounded bg-secondary/60 px-2 py-1">{t.minTons === 0 ? '1+' : `${t.minTons}+`} t: <b className="text-primary">${t.pricePerTon}</b>/t</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`t-${p.id}`} className="shrink-0">Tons</Label>
                <Input id={`t-${p.id}`} type="number" min={0} value={tons[p.id] ?? ''} onChange={(e) => setTons({ ...tons, [p.id]: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Tonnage calculator</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 text-sm">
          <div><Label htmlFor="cl">Length (ft)</Label><Input id="cl" type="number" value={calc.l} onChange={(e) => setCalc({ ...calc, l: e.target.value })} /></div>
          <div><Label htmlFor="cw">Width (ft)</Label><Input id="cw" type="number" value={calc.w} onChange={(e) => setCalc({ ...calc, w: e.target.value })} /></div>
          <div><Label htmlFor="cd">Depth (in)</Label><Input id="cd" type="number" value={calc.d} onChange={(e) => setCalc({ ...calc, d: e.target.value })} /></div>
          <p className="col-span-3 text-muted-foreground">≈ <b className="text-primary">{calcTons}</b> tons (at 1.4 tons per cubic yard)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Request a supply quote — est. {usd(total)}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {sent ? (
            <p className="text-primary font-semibold">Quote request sent. We'll reply by email, and you can track it in your Customer Portal.</p>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div><Label htmlFor="qn">Name</Label><Input id="qn" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label htmlFor="qe">Email</Label><Input id="qe" type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label htmlFor="qc">Company</Label><Input id="qc" value={form.company} maxLength={150} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div><Label htmlFor="qp">Phone</Label><Input id="qp" value={form.phone} maxLength={40} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <Button onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Request quote'}</Button>
              <p className="text-xs text-muted-foreground">Prices are estimates; delivery and final pricing are confirmed on your quote.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
