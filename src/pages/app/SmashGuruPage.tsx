import { useState } from 'react';
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
  Calculator, Shield, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Mock throughput log data
const throughputLogs = [
  { id: '1', date: '2026-03-07', crusher: 'JW42 Jaw Crusher', tph: 215, hours: 8.5, material: 'Limestone', notes: 'Steady run, no issues' },
  { id: '2', date: '2026-03-06', crusher: 'CS430 Cone Crusher', tph: 285, hours: 10, material: 'Granite', notes: 'Peak throughput achieved' },
  { id: '3', date: '2026-03-05', crusher: 'IP1313 Impact Crusher', tph: 340, hours: 7, material: 'River Rock', notes: 'Blow bar wear noted' },
  { id: '4', date: '2026-03-04', crusher: 'JW42 Jaw Crusher', tph: 190, hours: 6, material: 'Basalt', notes: 'Reduced feed rate due to hardness' },
  { id: '5', date: '2026-03-03', crusher: 'VSI2000 Vertical Shaft', tph: 250, hours: 9, material: 'Sand & Gravel', notes: 'Normal operation' },
];

// Mock repair tracking data
const repairLogs = [
  { id: '1', date: '2026-03-06', equipment: 'JW42 Jaw Crusher', issue: 'Toggle plate crack', status: 'completed', cost: 2800, downtime: 4 },
  { id: '2', date: '2026-03-04', equipment: 'CS430 Cone Crusher', issue: 'Mantle liner replacement', status: 'completed', cost: 12500, downtime: 8 },
  { id: '3', date: '2026-03-02', equipment: 'Conveyor Belt #3', issue: 'Belt mistracking — edge damage', status: 'pending', cost: 8500, downtime: 12 },
  { id: '4', date: '2026-02-28', equipment: 'IP1313 Impact Crusher', issue: 'Blow bar set replacement', status: 'completed', cost: 6200, downtime: 6 },
  { id: '5', date: '2026-02-25', equipment: 'Vibrating Screen VG68', issue: 'Screen media replacement', status: 'completed', cost: 3400, downtime: 3 },
];

// Weekly throughput chart data
const weeklyData = [
  { day: 'Mon', tph: 210 },
  { day: 'Tue', tph: 285 },
  { day: 'Wed', tph: 340 },
  { day: 'Thu', tph: 190 },
  { day: 'Fri', tph: 250 },
  { day: 'Sat', tph: 180 },
  { day: 'Sun', tph: 0 },
];

// Monthly repair cost data
const repairCostData = [
  { month: 'Oct', cost: 15200 },
  { month: 'Nov', cost: 22800 },
  { month: 'Dec', cost: 8400 },
  { month: 'Jan', cost: 18600 },
  { month: 'Feb', cost: 12100 },
  { month: 'Mar', cost: 33400 },
];

// BeltSaver ROI Calculator
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

const SmashGuruPage = () => {
  const { user } = useAuth();
  const [searchThroughput, setSearchThroughput] = useState('');
  const [searchRepair, setSearchRepair] = useState('');

  const filteredLogs = throughputLogs.filter(l =>
    l.crusher.toLowerCase().includes(searchThroughput.toLowerCase()) ||
    l.material.toLowerCase().includes(searchThroughput.toLowerCase())
  );

  const filteredRepairs = repairLogs.filter(r =>
    r.equipment.toLowerCase().includes(searchRepair.toLowerCase()) ||
    r.issue.toLowerCase().includes(searchRepair.toLowerCase())
  );

  const totalThroughput = throughputLogs.reduce((s, l) => s + l.tph * l.hours, 0);
  const totalRepairCost = repairLogs.reduce((s, r) => s + r.cost, 0);
  const totalDowntime = repairLogs.reduce((s, r) => s + r.downtime, 0);
  const avgTPH = throughputLogs.length > 0 ? throughputLogs.reduce((s, l) => s + l.tph, 0) / throughputLogs.length : 0;

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
              <p className="text-xl font-black">{avgTPH.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg TPH</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-xl font-black">{(totalThroughput / 1000).toFixed(0)}k</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Tons</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <p className="text-xl font-black">${(totalRepairCost / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Repair Costs</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xl font-black">{totalDowntime}h</p>
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
            {/* Weekly chart */}
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

            {/* Search & Logs */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search logs..." value={searchThroughput} onChange={e => setSearchThroughput(e.target.value)} className="pl-9" />
            </div>

            <div className="space-y-3">
              {filteredLogs.map(log => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{log.crusher}</p>
                        <p className="text-xs text-muted-foreground">{log.date} • {log.material}</p>
                      </div>
                      <Badge variant="outline" className="border-primary/50 text-primary font-mono">
                        {log.tph} TPH
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} /> {log.hours}h runtime</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> {(log.tph * log.hours).toLocaleString()} tons</span>
                    </div>
                    {log.notes && <p className="text-xs text-muted-foreground mt-2 italic">{log.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Repairs Tab */}
          <TabsContent value="repairs" className="space-y-4 mt-4">
            {/* Monthly repair costs chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Repair Costs</CardTitle>
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search repairs..." value={searchRepair} onChange={e => setSearchRepair(e.target.value)} className="pl-9" />
            </div>

            <div className="space-y-3">
              {filteredRepairs.map(repair => (
                <Card key={repair.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{repair.equipment}</p>
                        <p className="text-xs text-muted-foreground">{repair.date}</p>
                      </div>
                      <Badge
                        variant={repair.status === 'completed' ? 'secondary' : 'outline'}
                        className={repair.status === 'completed' ? 'text-green-500' : 'border-amber-500/50 text-amber-500'}
                      >
                        {repair.status === 'completed' ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                        {repair.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{repair.issue}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign size={12} /> ${repair.cost.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {repair.downtime}h downtime</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

            {/* CTA */}
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
