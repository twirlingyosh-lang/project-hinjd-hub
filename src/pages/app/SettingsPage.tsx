import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, Moon, Sun, Globe, Shield, Database, 
  Smartphone, Eye, Volume2, Zap, Server, CreditCard, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();

  // Local state for settings (persisted per-session for now)
  const [notifications, setNotifications] = useState(true);
  const [diagnosticAlerts, setDiagnosticAlerts] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);

  const handleToggle = (label: string, setter: (v: boolean) => void, value: boolean) => {
    setter(!value);
    toast.success(`${label} ${!value ? 'enabled' : 'disabled'}`);
  };

  if (!user) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center min-h-[60vh] text-center p-4">
          <div>
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Sign In Required</h2>
            <p className="text-sm text-muted-foreground mb-4">Access settings after signing in</p>
            <Link to="/auth"><Button>Sign In</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {/* Payments Onboarding */}
        <Link to="/app/payments-onboarding" className="block">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Payments Onboarding</p>
                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">New</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Guided Stripe → Paddle migration with status checks</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex items-center gap-2 cursor-pointer">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
                </div>
              </Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={() => handleToggle('Push Notifications', setNotifications, notifications)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="diag-alerts" className="flex items-center gap-2 cursor-pointer">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Diagnostic Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified on fault code matches</p>
                </div>
              </Label>
              <Switch id="diag-alerts" checked={diagnosticAlerts} onCheckedChange={() => handleToggle('Diagnostic Alerts', setDiagnosticAlerts, diagnosticAlerts)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="order-updates" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Order Updates</p>
                  <p className="text-xs text-muted-foreground">Part order status notifications</p>
                </div>
              </Label>
              <Switch id="order-updates" checked={orderUpdates} onCheckedChange={() => handleToggle('Order Updates', setOrderUpdates, orderUpdates)} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Industrial dark theme (recommended)</p>
                </div>
              </Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={() => handleToggle('Dark Mode', setDarkMode, darkMode)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-view" className="flex items-center gap-2 cursor-pointer">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Compact View</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing for smaller screens</p>
                </div>
              </Label>
              <Switch id="compact-view" checked={compactView} onCheckedChange={() => handleToggle('Compact View', setCompactView, compactView)} />
            </div>
          </CardContent>
        </Card>

        {/* Data & Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Data & Performance</CardTitle>
            </div>
            <CardDescription>Control data sync and real-time features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="realtime" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Real-time Updates</p>
                  <p className="text-xs text-muted-foreground">Live data sync for dashboards</p>
                </div>
              </Label>
              <Switch id="realtime" checked={realtimeUpdates} onCheckedChange={() => handleToggle('Real-time Updates', setRealtimeUpdates, realtimeUpdates)} />
            </div>
          </CardContent>
        </Card>

        {/* Backend Info (Admin only) */}
        {isAdmin && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Backend</CardTitle>
                <Badge variant="outline" className="border-primary/50 text-primary text-xs">ADMIN</Badge>
              </div>
              <CardDescription>Lovable Cloud infrastructure status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Database</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Auth</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Storage</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">8 Buckets</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Edge Functions</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">11 Active</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Powered by Lovable Cloud • Auto-scaling enabled
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          HINJD Global Ecosystem v2.0
        </p>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
