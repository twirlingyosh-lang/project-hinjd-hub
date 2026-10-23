import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Belt = { id: string; created_at: string; location: string; severity: string; cause: string; status: string };
type Equip = { id: string; created_at: string; equipment_type: string | null; make: string | null; model: string | null; symptoms: string; status: string };
type Fleet = { id: string; unit_name: string; unit_type: string | null; status: string; monthly_revenue: number | null };

const fmtDate = (d: string) => new Date(d).toLocaleDateString();

const CRMOperations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [belts, setBelts] = useState<Belt[]>([]);
  const [equip, setEquip] = useState<Equip[]>([]);
  const [fleet, setFleet] = useState<Fleet[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/crm/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [b, e, f] = await Promise.all([
        supabase.from('belt_diagnostics').select('id,created_at,location,severity,cause,status').order('created_at', { ascending: false }).limit(100),
        supabase.from('equipment_diagnostics').select('id,created_at,equipment_type,make,model,symptoms,status').order('created_at', { ascending: false }).limit(100),
        supabase.from('fleet_units').select('id,unit_name,unit_type,status,monthly_revenue').order('unit_name').limit(200),
      ]);
      const err = b.error || e.error || f.error;
      if (err) setError(err.message);
      setBelts(b.data ?? []);
      setEquip(e.data ?? []);
      setFleet(f.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const empty = (label: string) => <p className="text-sm text-muted-foreground py-6 text-center">No {label} yet.</p>;

  return (
    <CRMLayout title="Operations">
      {error && <p className="text-sm text-destructive mb-4">Couldn't load some data: {error}</p>}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Belt diagnostics', belts.length], ['Equipment diagnostics', equip.length], ['Fleet units', fleet.length]].map(([l, n]) => (
          <Card key={l as string}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{l}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-primary">{loading ? <Skeleton className="h-8 w-12" /> : n}</CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="belt">
        <TabsList>
          <TabsTrigger value="belt">Belt diagnostics</TabsTrigger>
          <TabsTrigger value="equip">Equipment diagnostics</TabsTrigger>
          <TabsTrigger value="fleet">Fleet units</TabsTrigger>
        </TabsList>
        <TabsContent value="belt" className="space-y-2">
          {loading ? <Skeleton className="h-24" /> : belts.length === 0 ? empty('belt diagnostics') : belts.map((r) => (
            <Card key={r.id}><CardContent className="p-4 flex justify-between gap-4">
              <div><p className="font-medium">{r.location}</p><p className="text-sm text-muted-foreground">{r.cause} · {fmtDate(r.created_at)}</p></div>
              <div className="flex gap-2 items-start"><Badge variant="outline">{r.severity}</Badge><Badge>{r.status}</Badge></div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="equip" className="space-y-2">
          {loading ? <Skeleton className="h-24" /> : equip.length === 0 ? empty('equipment diagnostics') : equip.map((r) => (
            <Card key={r.id}><CardContent className="p-4 flex justify-between gap-4">
              <div><p className="font-medium">{[r.make, r.model, r.equipment_type].filter(Boolean).join(' ') || 'Equipment'}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.symptoms} · {fmtDate(r.created_at)}</p></div>
              <Badge>{r.status}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="fleet" className="space-y-2">
          {loading ? <Skeleton className="h-24" /> : fleet.length === 0 ? empty('fleet units') : fleet.map((r) => (
            <Card key={r.id}><CardContent className="p-4 flex justify-between gap-4">
              <div><p className="font-medium">{r.unit_name}</p><p className="text-sm text-muted-foreground">{r.unit_type ?? '—'}</p></div>
              <div className="flex gap-2 items-start">
                {r.monthly_revenue != null && <Badge variant="outline">${Number(r.monthly_revenue).toLocaleString()}/mo</Badge>}
                <Badge>{r.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
};

export default CRMOperations;
