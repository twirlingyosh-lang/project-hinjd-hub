import { MapPin, Shield, Hammer, Layers, BarChart3, Settings, User, Crown, Home, LogOut, Factory, Zap, Search, Droplets, ClipboardCheck, Map } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const moduleItems = [
  { path: '/app', icon: Home, label: 'Home', description: 'Dashboard overview' },
  { path: '/app/equipment-opps', icon: Hammer, label: 'Equipment Opps', description: 'Crushing, diagnostics & mapping' },
  { path: '/beltsaver', icon: Shield, label: 'BeltSaver®', description: 'Predictive wear dashboard' },
  { path: '/aggregate-opps', icon: Layers, label: 'Aggregate Opps', description: 'Logistics & production' },
  { path: '/app/base44', icon: Factory, label: 'Aggregate Opps', description: 'Aggregate operations app' },
  { path: '/app/electrical', icon: Zap, label: 'Electrical', description: 'Wiring & pinouts' },
  { path: '/app/fault-codes', icon: Search, label: 'Fault Codes', description: 'Diagnostic engine' },
  { path: '/app/hydraulics', icon: Droplets, label: 'Hydraulics', description: 'Schematic diagrams' },
  { path: '/app/troubleshooting', icon: ClipboardCheck, label: 'Troubleshooting', description: 'Step-by-step guides' },
  { path: '/app/fleet-map', icon: Map, label: 'Fleet Map', description: 'Live equipment telemetry' },
];

const adminItems = [
  { path: '/app/dashboard', icon: BarChart3, label: 'HQ Command', description: 'Financial dashboard' },
];

const utilityItems = [
  { path: '/app/settings', icon: Settings, label: 'Settings', description: 'App preferences' },
  { path: '/app/upgrade', icon: Crown, label: 'Upgrade', description: 'Plans & billing' },
  { path: '/app/account', icon: User, label: 'Account', description: 'Profile settings' },
];

export function EcosystemSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isAdmin } = useAdminRole();
  const { user, signOut } = useAuth();
  const { subscription, isSubscribed } = useSubscription();

  const isActive = (path: string) => location.pathname === path;

  const getPlanLabel = () => {
    if (!isSubscribed) return 'Free';
    const plan = subscription?.plan_name?.toLowerCase() || '';
    if (plan.includes('enterprise')) return 'Enterprise';
    if (plan.includes('pro')) return 'Pro';
    return 'Active';
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">H</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">HINJD Global</h2>
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary mt-0.5">
                {getPlanLabel()}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">H</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Core Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === '/app'}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/80">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        className="hover:bg-accent/50 transition-colors"
                        activeClassName="bg-primary/10 text-primary font-semibold"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Utility */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user && (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default EcosystemSidebar;
