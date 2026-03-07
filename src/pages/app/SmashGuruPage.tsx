import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Hammer, TrendingUp, Wrench, DollarSign, Clock, 
  Plus, Search, Gauge, AlertTriangle, CheckCircle2,
  Shield, ArrowRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ThroughputLog {
  id: string;
  crusher: string;
  tph: number;
  hours: number;
  material: string;
  notes: string | null;
  log_date: string;
  created_at: string;
}

interface RepairLog {
  id: string;
  equipment: string;
  issue: string;
  status: string;
  cost: number;
  downtime: number;
  repair_date: string;
  created_at: string;
}

// BeltSaver ROI Calculator (client-only, no DB needed)
const BeltSaverROI = () => {
  const [beltCost, setBeltCost] = useState('15000');
  const [beltLifeWithout, setBeltLifeWithout] = useState('12');
  const [beltLifeWith, setBeltLifeWith] = useState('24');
  const [beltsPerYear, setBeltsPerYear] = useState('4');
  const [beltSaverCost] = useState(4500);

  const cost = parseFloat(beltCost) || 0;
  const lifeWithout = parseFloat(beltLifeWithout) || 1;
  const lifeWith = parseFloat(beltLifeWith) || 1;
  const belts = parseFloat(beltsPerYear) || 1;

  const annualCostWithout = (cost / lifeWithout) * 12 * belts;
  const annualCostWith = ((cost / lifeWith) * 12 * belts) + (beltSaverCost * belts);
  const annualSavings = annualCostWithout - annualCostWith;
  const roiPercent = beltSaverCost * belts > 0 ? (annualSavings / (beltSaverCost * belts)) * 100 : 0;
  const paybackMonths = annualSavings > 0 ? (beltSaverCost * belts) / (annualSavings / 12) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Belt Replacement Cost ($)</label>
            <Input type="number" value={beltCost} onChange={e => setBeltCost(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Belt Life Without BeltSaver® (months)</label>
            <Input type="number" value={beltLifeWithout} onChange={e => setBeltLifeWithout(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Belt Life With BeltSaver® (months)</label>
            <Input type="number" value={beltLifeWith} onChange={e => setBeltLifeWith(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Number of Conveyors</label>
            <Input type="number" value={beltsPerYear} onChange={e => setBeltsPerYear(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="space-y-3">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">ROI Summary</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Cost Without</span>
                  <span className="text-sm font-mono font-bold text-destructive">${annualCostWithout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Cost With BeltSaver®</span>
                  <span className="text-sm font-mono font-bold text-primary">${annualCostWith.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Annual Savings</span>
                  <span className={`text-lg font-mono font-black ${annualSavings > 0 ? 'text-green-500' : 'text-destructive'}`}>
                    ${annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ROI</p>
              <p className={`text-xl font-black ${roiPercent > 0 ? 'text-green-500' : 'text-destructive'}`}>
                {roiPercent.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payback</p>
              <p className="text-xl font-black text-primary">
                {paybackMonths > 0 ? `${paybackMonths.toFixed(1)}mo` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Throughput Form
const AddThroughputForm = ({ onAdded }: { onAdded: () => void }) => {
  const { user } = useAuth();
  const [crusher, setCrusher] = useState('');
  const [tph, setTph] = useState('');
  const [hours, setHours] = useState('');
  const [material, setMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!crusher || !tph || !hours || !material || !user) return;
    setSaving(true);
    const { error } = await supabase.from('throughput_logs').insert({
      user_id: user.id,
      crusher,
      tph: parseFloat(tph),
      hours: parseFloat(hours),
      material,
      notes: notes || null,
      log_date: logDate,
    });
    setSaving(false);
    if (error) {
      toast.error('Failed to save log');
    } else {
      toast.success('Throughput log saved');
      setCrusher(''); setTph(''); setHours(''); setMaterial(''); setNotes('');
      onAdded();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Plus size={14} /> Log Throughput</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Crusher name" value={crusher} onChange={e => setCrusher(e.target.value)} />
          <Input placeholder="Material" value={material} onChange={e => setMaterial(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input type="number" placeholder="TPH" value={tph} onChange={e => setTph(e.target.value)} />
          <Input type="number" placeholder="Hours" value={hours} onChange={e => setHours(e.target.value)} />
          <Input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
        </div>
        <Input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        <Button onClick={handleSubmit} disabled={saving || !crusher || !tph || !hours || !material} size="sm" className="w-full">
          {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-1" />}
          Save Log
        </Button>
      </CardContent>
    </Card>
  );
};

// Add Repair Form
const AddRepairForm = ({ onAdded }: { onAdded: () => void }) => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState('');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('');
  const [downtime, setDowntime] = useState('');
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!equipment || !issue || !user) return;
    setSaving(true);
    const { error } = await supabase.from('repair_logs').insert({
      user_id: user.id,
      equipment,
      issue,
      cost: parseFloat(cost) || 0,
      downtime: parseFloat(downtime) || 0,
      repair_date: repairDate,
      status: 'pending',
    });
    setSaving(false);
    if (error) {
      toast.error('Failed to save repair');
    } else {
      toast.success('Repair log saved');
      setEquipment(''); setIssue(''); setCost(''); setDowntime('');
      onAdded();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Plus size={14} /> Log Repair</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Equipment" value={equipment} onChange={e => setEquipment(e.target.value)} />
          <Input type="date" value={repairDate} onChange={e => setRepairDate(e.target.value)} />
        </div>
        <Input placeholder="Issue description" value={issue} onChange={e => setIssue(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Cost ($)" value={cost} onChange={e => setCost(e.target.value)} />
          <Input type="number" placeholder="Downtime (hrs)" value={downtime} onChange={e => setDowntime(e.target.value)} />
        </div>
        <Button onClick={handleSubmit} disabled={saving || !equipment || !issue} size="sm" className="w-full">
          {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-1" />}
          Save Repair
        </Button>
      </CardContent>
    </Card>
  );
};

const SmashGuruPage = () => {
  const { user } = useAuth();
  const [searchThroughput, setSearchThroughput] = useState('');
  const [searchRepair, setSearchRepair] = useState('');
  const [throughputLogs, setThroughputLogs] = useState<ThroughputLog[]>([]);
  const [repairLogs, setRepairLogs] = useState<RepairLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddThroughput, setShowAddThroughput] = useState(false);
  const [showAddRepair, setShowAddRepair] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [tRes, rRes] = await Promise.all([
      supabase.from('throughput_logs').select('*').order('log_date', { ascending: false }).limit(50),
      supabase.from('repair_logs').select('*').order('repair_date', { ascending: false }).limit(50),
    ]);
    if (tRes.data) setThroughputLogs(tRes.data as ThroughputLog[]);
    if (rRes.data) setRepairLogs(rRes.data as RepairLog[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredLogs = throughputLogs.filter(l =>
    l.crusher.toLowerCase().includes(searchThroughput.toLowerCase()) ||
    l.material.toLowerCase().includes(searchThroughput.toLowerCase())
  );

  const filteredRepairs = repairLogs.filter(r =>
    r.equipment.toLowerCase().includes(searchRepair.toLowerCase()) ||
    r.issue.toLowerCase().includes(searchRepair.toLowerCase())
  );

  const totalThroughput = throughputLogs.reduce((s, l) => s + Number(l.tph) * Number(l.hours), 0);
  const totalRepairCost = repairLogs.reduce((s, r) => s + Number(r.cost), 0);
  const totalDowntime = repairLogs.reduce((s, r) => s + Number(r.downtime), 0);
  const avgTPH = throughputLogs.length > 0 ? throughputLogs.reduce((s, l) => s + Number(l.tph), 0) / throughputLogs.length : 0;

  // Build chart data from real logs
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = days.map(day => {
    const matching = throughputLogs.filter(l => {
      const d = new Date(l.log_date);
      return days[d.getDay()] === day;
    });
    const avgTph = matching.length > 0 ? matching.reduce((s, l) => s + Number(l.tph), 0) / matching.length : 0;
    return { day, tph: Math.round(avgTph) };
  });

  const repairCostData = (() => {
    const monthMap: Record<string, number> = {};
    repairLogs.forEach(r => {
      const d = new Date(r.repair_date);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + Number(r.cost);
    });
    return Object.entries(monthMap).map(([month, cost]) => ({ month, cost })).slice(0, 6);
  })();

  const markRepairComplete = async (id: string) => {
    const { error } = await supabase.from('repair_logs').update({ status: 'completed' }).eq('id', id);
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success('Marked complete');
      fetchData();
    }
  };

  if (!user) {
    return (
      <AppLayout title="Smash Guru">
        <div className="flex items-center justify-center min-h-[60vh] text-center p-4">
          <div>
            <Hammer className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Sign In Required</h2>
            <p className="text-sm text-muted-foreground mb-4">Track crushing throughput and repairs</p>
            <Link to="/auth"><Button>Sign In</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Smash Guru">
      <div className="p-4 md:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <Gauge className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-black">{loading ? '—' : avgTPH.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg TPH</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-xl font-black">{loading ? '—' : `${(totalThroughput / 1000).toFixed(0)}k`}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Tons</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <p className="text-xl font-black">{loading ? '—' : `$${(totalRepairCost / 1000).toFixed(1)}k`}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Repair Costs</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xl font-black">{loading ? '—' : `${totalDowntime}h`}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Downtime</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="throughput" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
            <TabsTrigger value="roi">BeltSaver® ROI</TabsTrigger>
          </TabsList>

          {/* Throughput Tab */}
          <TabsContent value="throughput" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Throughput Logs</h3>
              <Button size="sm" variant="outline" onClick={() => setShowAddThroughput(!showAddThroughput)}>
                <Plus size={14} className="mr-1" /> {showAddThroughput ? 'Cancel' : 'Add'}
              </Button>
            </div>

            {showAddThroughput && <AddThroughputForm onAdded={() => { setShowAddThroughput(false); fetchData(); }} />}

            {/* Weekly chart */}
            {throughputLogs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Throughput (TPH)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                        <XAxis dataKey="day" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 7%)', border: '1px solid hsl(222, 30%, 20%)', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="tph" fill="hsl(43, 96%, 56%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search logs..." value={searchThroughput} onChange={e => setSearchThroughput(e.target.value)} className="pl-9" />
            </div>

            {loading ? (
              <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No throughput logs yet. Add your first entry above.</p>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map(log => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{log.crusher}</p>
                          <p className="text-xs text-muted-foreground">{log.log_date} • {log.material}</p>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary font-mono">
                          {log.tph} TPH
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> {log.hours}h runtime</span>
                        <span className="flex items-center gap-1"><TrendingUp size={12} /> {(Number(log.tph) * Number(log.hours)).toLocaleString()} tons</span>
                      </div>
                      {log.notes && <p className="text-xs text-muted-foreground mt-2 italic">{log.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Repairs Tab */}
          <TabsContent value="repairs" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Repair Logs</h3>
              <Button size="sm" variant="outline" onClick={() => setShowAddRepair(!showAddRepair)}>
                <Plus size={14} className="mr-1" /> {showAddRepair ? 'Cancel' : 'Add'}
              </Button>
            </div>

            {showAddRepair && <AddRepairForm onAdded={() => { setShowAddRepair(false); fetchData(); }} />}

            {repairLogs.length > 0 && repairCostData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Repair Costs by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={repairCostData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 7%)', border: '1px solid hsl(222, 30%, 20%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Cost']} />
                        <Line type="monotone" dataKey="cost" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(0, 84%, 60%)', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search repairs..." value={searchRepair} onChange={e => setSearchRepair(e.target.value)} className="pl-9" />
            </div>

            {loading ? (
              <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
            ) : filteredRepairs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No repair logs yet. Add your first entry above.</p>
            ) : (
              <div className="space-y-3">
                {filteredRepairs.map(repair => (
                  <Card key={repair.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{repair.equipment}</p>
                          <p className="text-xs text-muted-foreground">{repair.repair_date}</p>
                        </div>
                        {repair.status === 'completed' ? (
                          <Badge variant="secondary" className="text-green-500">
                            <CheckCircle2 size={12} className="mr-1" /> completed
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="text-xs h-7 border-amber-500/50 text-amber-500" onClick={() => markRepairComplete(repair.id)}>
                            <AlertTriangle size={12} className="mr-1" /> Mark Done
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mb-2">{repair.issue}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><DollarSign size={12} /> ${Number(repair.cost).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {repair.downtime}h downtime</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* BeltSaver ROI Tab */}
          <TabsContent value="roi" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">BeltSaver® ROI Calculator</CardTitle>
                </div>
                <CardDescription>
                  Calculate your annual savings from BeltSaver® integrated tail pulley technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BeltSaverROI />
              </CardContent>
            </Card>

            <Card className="mt-4 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Ready to save?</p>
                  <p className="text-xs text-muted-foreground">See full BeltSaver® specs and order</p>
                </div>
                <Link to="/beltsaver">
                  <Button size="sm" className="gap-1">
                    View BeltSaver® <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SmashGuruPage;
