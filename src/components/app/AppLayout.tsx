import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Wrench, Calculator, Save, User, Crown, Download, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { path: '/app', icon: Home, label: 'Home' },
  { path: '/app/materials', icon: Layers, label: 'Materials' },
  { path: '/app/equipment-opps', icon: Truck, label: 'Equip Opps' },
  { path: '/app/calculator', icon: Calculator, label: 'Calc' },
  { path: '/app/saved', icon: Save, label: 'Saved' },
];

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/app/install" 
                      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Download size={18} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Install app for offline use</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link 
                to="/app/upgrade" 
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Crown size={18} />
              </Link>
              <Link 
                to="/app/account" 
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <User size={18} />
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
