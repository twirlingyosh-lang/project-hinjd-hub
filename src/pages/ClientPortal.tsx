import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Row = Record<string, any>;
const STEPS = ['Requested', 'Quoted', 'Invoiced', 'Paid'];
export const quoteStep = (q: Row, invoices: Row[]) => {
  const inv = invoices.find((i) => i.id === q.invoice_id);
  if (inv?.status === 'paid') return 3;
  if (q.invoice_id) return 2;
  if (q.status === 'quoted') return 1;
  return 0;
};
const date = (d: string) => new Date(d).toLocaleDateString();

export default function ClientPortal() {
  const { user, loading } = useAuth() as any;
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [belt, setBelt] = useState<Row[]>([]);
  const [equip, setEquip] = useState<Row[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/auth?next=/portal');
  }, [user, loading, navigate]);

  const [tick, setTick] = useState(0);
  useLiveRefresh(['quote_requests','crm_invoices','belt_diagnostics','equipment_diagnostics'], () => setTick((t) => t + 1), !!user);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const email = user.email ?? '';
      const [q, i, b, e, p] = await Promise.all([
        supabase.from('quote_requests').select('id, created_at, belt_width, quantity, status, invoice_id').ilike('email', email).order('created_at', { ascending: false }),
        supabase.from('crm_invoices').select('id, created_at, amount, status, due_date, payment_url').order('created_at', { ascending: false }),
        supabase.from('belt_diagnostics').select('id, created_at, location, severity, status').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('equipment_diagnostics').select('id, created_at, equipment_type, make, model, status').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
      ]);
      setQuotes(q.data ?? []);
      setInvoices((i.data ?? []).filter((r) => r.status !== 'draft'));
      setBelt(b.data ?? []);
      setEquip(e.data ?? []);
      setName(p.data?.full_name ?? '');
    })();
  }, [user, tick]);

  const saveAccount = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: name.trim().slice(0, 100) }).eq('id', user.id);
    error ? toast.error('Could not save') : toast.success('Account updated');
  };

  const Empty = ({ t }: { t: string }) => <p className="text-sm text-muted-foreground py-6 text-center">No {t} yet.</p>;

  if (!user) return null;
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Customer Portal | Hinjd Global</title><meta name="robots" content="noindex" /></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl industrial-title text-foreground">Customer Portal</h1>
          <Button asChild variant="outline"><Link to="/beltsaver/quote">New quote</Link></Button>
        </div>
        <Tabs defaultValue="quotes">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="diag">Diagnostics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="quotes"><Card><CardContent className="pt-6 space-y-2">
            {quotes.length === 0 ? <Empty t="quotes" /> : quotes.map((q) => (
              <div key={q.id} className="border-b border-border py-3 text-sm space-y-2">
                <span>{date(q.created_at)} · BeltSaver {q.belt_width ?? ''} × {q.quantity ?? 1}</span>
                <div className="grid grid-cols-4 gap-1">
                  {STEPS.map((s, idx) => (
                    <div key={s} className="space-y-1">
                      <div className={`h-1.5 rounded-full ${idx <= quoteStep(q, invoices) ? 'bg-primary' : 'bg-muted'}`} />
                      <p className={`text-xs ${idx <= quoteStep(q, invoices) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>))}
          </CardContent></Card></TabsContent>
          <TabsContent value="invoices"><Card><CardContent className="pt-6 space-y-2">
            {invoices.length === 0 ? <Empty t="invoices" /> : invoices.map((i) => (
              <div key={i.id} className="flex items-center justify-between border-b border-border py-2 text-sm gap-2">
                <span>{date(i.created_at)} · ${Number(i.amount).toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{i.status}</Badge>
                  {i.payment_url && i.status !== 'paid' && <Button size="sm" asChild><a href={i.payment_url} target="_blank" rel="noreferrer">Pay</a></Button>}
                </div>
              </div>))}
          </CardContent></Card></TabsContent>
          <TabsContent value="diag" className="space-y-4">
            <Card><CardHeader><CardTitle className="text-base">Belt diagnostics</CardTitle></CardHeader><CardContent className="space-y-2">
              {belt.length === 0 ? <Empty t="belt diagnostics" /> : belt.map((b) => (
                <div key={b.id} className="flex justify-between border-b border-border py-2 text-sm"><span>{date(b.created_at)} · {b.location} · {b.severity}</span><Badge variant="secondary">{b.status}</Badge></div>))}
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Equipment diagnostics</CardTitle></CardHeader><CardContent className="space-y-2">
              {equip.length === 0 ? <Empty t="equipment diagnostics" /> : equip.map((e) => (
                <div key={e.id} className="flex justify-between border-b border-border py-2 text-sm"><span>{date(e.created_at)} · {[e.make, e.model, e.equipment_type].filter(Boolean).join(' ')}</span><Badge variant="secondary">{e.status}</Badge></div>))}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="account"><Card><CardContent className="pt-6 space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input value={user.email ?? ''} disabled /></div>
            <div className="space-y-2"><Label htmlFor="fn">Full name</Label><Input id="fn" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></div>
            <Button onClick={saveAccount}>Save</Button>
          </CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
