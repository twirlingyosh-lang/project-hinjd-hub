import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Row = { user_id: string; email: string; total: number; last: string; tools: Record<string, number> };
type Quote = { id: string; created_at: string; name: string; email: string; company: string | null; quantity: number | null; status: string; invoice_id: string | null };

const CRMUsage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const invoice = async (q: Quote) => {
    const v = window.prompt(`Quote amount in USD for ${q.name}:`);
    const amount = Number(v);
    if (!v || !(amount > 0)) return;
    setBusyId(q.id);
    const { data, error } = await supabase.functions.invoke('quote-to-invoice', { body: { quote_id: q.id, amount } });
    setBusyId(null);
    if (error || !data?.success) return alert(`Couldn't create invoice: ${error?.message ?? JSON.stringify(data?.error)}`);
    await navigator.clipboard?.writeText(data.url).catch(() => {});
    setQuotes((qs) => qs.map((x) => (x.id === q.id ? { ...x, status: 'quoted', invoice_id: data.invoice_id } : x)));
    alert('Invoice created. Payment link copied — send it to the customer. It is also saved on the invoice.');
  };

  useEffect(() => { if (!authLoading && !user) navigate('/crm/login'); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [calls, q] = await Promise.all([
        supabase.from('mcp_tool_calls').select('user_id,tool_name,created_at').order('created_at', { ascending: false }).limit(5000),
        supabase.from('quote_requests').select('id,created_at,name,email,company,quantity,status,invoice_id').order('created_at', { ascending: false }).limit(100),
      ]);
      if (calls.error || q.error) setError((calls.error || q.error)!.message);
      const map = new Map<string, Row>();
      for (const c of calls.data ?? []) {
        const r = map.get(c.user_id) ?? { user_id: c.user_id, email: '', total: 0, last: c.created_at, tools: {} };
        r.total++; r.tools[c.tool_name] = (r.tools[c.tool_name] ?? 0) + 1;
        map.set(c.user_id, r);
      }
      const ids = [...map.keys()];
      if (ids.length) {
        const { data: profs } = await supabase.from('profiles').select('id,email').in('id', ids);
        for (const p of profs ?? []) { const r = map.get(p.id); if (r) r.email = p.email ?? ''; }
      }
      setRows([...map.values()].sort((a, b) => b.total - a.total));
      setQuotes(q.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <CRMLayout title="Assistant Usage & Quotes">
      {error && <p className="text-sm text-destructive mb-4">Couldn't load some data (admin access required): {error}</p>}
      <Card className="mb-6">
        <CardHeader><CardTitle>Assistant tool calls by account</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-24" /> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No tool calls yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="py-2">Account</th><th>Calls</th><th>Most used</th><th>Last call</th></tr></thead>
              <tbody>{rows.map((r) => {
                const top = Object.entries(r.tools).sort((a, b) => b[1] - a[1])[0];
                return <tr key={r.user_id} className="border-t border-border"><td className="py-2">{r.email || r.user_id.slice(0, 8)}</td><td className="font-bold text-primary">{r.total}</td><td>{top[0]} ({top[1]})</td><td>{new Date(r.last).toLocaleString()}</td></tr>;
              })}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>BeltSaver quote requests</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-24" /> : quotes.length === 0 ? <p className="text-sm text-muted-foreground">No quote requests yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="py-2">Date</th><th>Name</th><th>Email</th><th>Company</th><th>Qty</th><th>Status</th><th></th></tr></thead>
              <tbody>{quotes.map((q) => <tr key={q.id} className="border-t border-border"><td className="py-2">{new Date(q.created_at).toLocaleDateString()}</td><td>{q.name}</td><td>{q.email}</td><td>{q.company ?? '—'}</td><td>{q.quantity ?? '—'}</td><td>{q.status}</td><td>{q.invoice_id ? <span className="text-muted-foreground">Invoiced</span> : <button className="text-primary underline disabled:opacity-50" disabled={busyId === q.id} onClick={() => invoice(q)}>{busyId === q.id ? 'Creating…' : 'Create invoice'}</button>}</td></tr>)}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </CRMLayout>
  );
};

export default CRMUsage;
