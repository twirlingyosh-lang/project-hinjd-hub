import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/app/AppLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Wallet, Truck, Activity, RefreshCw, Edit, Trash2, 
  DollarSign, TrendingUp, Shield, AlertTriangle 
} from 'lucide-react';

export default function AdminPanel() {
  const { 
    isAdmin, loading, error, users, treasuryMetrics, fleetUnits, activities,
    updateTreasuryMetrics, updateFleetUnit, deleteFleetUnit, getUserById, refetch 
  } = useAdminData();
  const { toast } = useToast();
  
  const [editingMetrics, setEditingMetrics] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  if (loading) {
    return (
      <AppLayout title="Admin Panel">
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="animate-spin text-primary" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  const handleUpdateMetrics = async () => {
    if (!editingMetrics) return;
    try {
      await updateTreasuryMetrics(editingMetrics.id, {
        total_wealth: Number(editingMetrics.total_wealth),
        staked_sol: Number(editingMetrics.staked_sol),
        rewards_earned: Number(editingMetrics.rewards_earned),
        active_leases: Number(editingMetrics.active_leases),
        milestone_target: Number(editingMetrics.milestone_target),
        notes: editingMetrics.notes
      });
      toast({ title: 'Treasury metrics updated' });
      setEditingMetrics(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit) return;
    try {
      await updateFleetUnit(editingUnit.id, {
        unit_name: editingUnit.unit_name,
        unit_type: editingUnit.unit_type,
        status: editingUnit.status,
        monthly_revenue: Number(editingUnit.monthly_revenue) || 0,
        notes: editingUnit.notes
      });
      toast({ title: 'Fleet unit updated' });
      setEditingUnit(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Delete this fleet unit?')) return;
    try {
      await deleteFleetUnit(id);
      toast({ title: 'Fleet unit deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const totalWealth = treasuryMetrics.reduce((sum, m) => sum + Number(m.total_wealth), 0);
  const totalUnits = fleetUnits.length;
  const activeUnits = fleetUnits.filter(u => u.status === 'active').length;

  return (
    <AppLayout title="Admin Panel">
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Wealth</p>
                <p className="text-xl font-bold">${totalWealth.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Truck size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fleet Units</p>
                <p className="text-xl font-bold">{totalUnits}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <TrendingUp size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Units</p>
                <p className="text-xl font-bold">{activeUnits}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-2 text-destructive">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="treasury" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="treasury" className="gap-2">
                <Wallet size={16} /> Treasury
              </TabsTrigger>
              <TabsTrigger value="fleet" className="gap-2">
                <Truck size={16} /> Fleet
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity size={16} /> Activity
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users size={16} /> Users
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>

          {/* Treasury Metrics Tab */}
          <TabsContent value="treasury">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treasury Metrics</CardTitle>
                <CardDescription>Manage all users' treasury data</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Total Wealth</TableHead>
                      <TableHead>Staked SOL</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Leases</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treasuryMetrics.map(m => {
                      const user = getUserById(m.user_id);
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{user?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">${Number(m.total_wealth).toLocaleString()}</TableCell>
                          <TableCell className="font-mono">{m.staked_sol} SOL</TableCell>
                          <TableCell className="font-mono text-emerald-500">+{m.rewards_earned}</TableCell>
                          <TableCell>{m.active_leases}</TableCell>
                          <TableCell className="font-mono">${Number(m.milestone_target).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => setEditingMetrics(m)}>
                              <Edit size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {treasuryMetrics.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No treasury metrics found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fleet Units Tab */}
          <TabsContent value="fleet">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fleet Units</CardTitle>
                <CardDescription>Manage all users' fleet assets</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fleetUnits.map(u => {
                      const user = getUserById(u.user_id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{user?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{u.unit_name}</TableCell>
                          <TableCell>{u.unit_type || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">${Number(u.monthly_revenue || 0).toLocaleString()}</TableCell>
                          <TableCell className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditingUnit(u)}>
                              <Edit size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteUnit(u.id)}>
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {fleetUnits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No fleet units found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treasury Activity</CardTitle>
                <CardDescription>Recent activity across all users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map(a => {
                      const user = getUserById(a.user_id);
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{user?.full_name || 'Unknown'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{a.activity_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {a.amount ? `$${Number(a.amount).toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{a.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={a.status === 'success' ? 'default' : 'secondary'}>
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {activities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No activity found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Users</CardTitle>
                <CardDescription>User accounts with treasury access</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Treasury</TableHead>
                      <TableHead>Fleet Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => {
                      const metrics = treasuryMetrics.find(m => m.user_id === u.id);
                      const units = fleetUnits.filter(f => f.user_id === u.id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || 'No name'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            {metrics ? (
                              <span className="font-mono">${Number(metrics.total_wealth).toLocaleString()}</span>
                            ) : (
                              <Badge variant="secondary">No data</Badge>
                            )}
                          </TableCell>
                          <TableCell>{units.length} units</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Treasury Metrics Dialog */}
      <Dialog open={!!editingMetrics} onOpenChange={() => setEditingMetrics(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Treasury Metrics</DialogTitle>
          </DialogHeader>
          {editingMetrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Wealth ($)</Label>
                  <Input
                    type="number"
                    value={editingMetrics.total_wealth}
                    onChange={e => setEditingMetrics({ ...editingMetrics, total_wealth: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Staked SOL</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMetrics.staked_sol}
                    onChange={e => setEditingMetrics({ ...editingMetrics, staked_sol: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Rewards Earned</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMetrics.rewards_earned}
                    onChange={e => setEditingMetrics({ ...editingMetrics, rewards_earned: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Active Leases</Label>
                  <Input
                    type="number"
                    value={editingMetrics.active_leases}
                    onChange={e => setEditingMetrics({ ...editingMetrics, active_leases: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Milestone Target ($)</Label>
                  <Input
                    type="number"
                    value={editingMetrics.milestone_target}
                    onChange={e => setEditingMetrics({ ...editingMetrics, milestone_target: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingMetrics.notes || ''}
                  onChange={e => setEditingMetrics({ ...editingMetrics, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMetrics(null)}>Cancel</Button>
            <Button onClick={handleUpdateMetrics}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fleet Unit Dialog */}
      <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fleet Unit</DialogTitle>
          </DialogHeader>
          {editingUnit && (
            <div className="space-y-4">
              <div>
                <Label>Unit Name</Label>
                <Input
                  value={editingUnit.unit_name}
                  onChange={e => setEditingUnit({ ...editingUnit, unit_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Type</Label>
                  <Input
                    value={editingUnit.unit_type || ''}
                    onChange={e => setEditingUnit({ ...editingUnit, unit_type: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingUnit.status}
                    onValueChange={v => setEditingUnit({ ...editingUnit, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Monthly Revenue ($)</Label>
                <Input
                  type="number"
                  value={editingUnit.monthly_revenue || 0}
                  onChange={e => setEditingUnit({ ...editingUnit, monthly_revenue: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingUnit.notes || ''}
                  onChange={e => setEditingUnit({ ...editingUnit, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUnit(null)}>Cancel</Button>
            <Button onClick={handleUpdateUnit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
