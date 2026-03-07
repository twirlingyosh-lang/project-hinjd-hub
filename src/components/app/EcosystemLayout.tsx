import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EcosystemSidebar } from './EcosystemSidebar';

interface EcosystemLayoutProps {
  children: ReactNode;
  title?: string;
}

export const EcosystemLayout = ({ children, title }: EcosystemLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EcosystemSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-40">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {title && (
              <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
            )}
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EcosystemLayout;
