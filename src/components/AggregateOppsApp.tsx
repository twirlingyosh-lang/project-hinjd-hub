import { useState } from 'react';
import { ShieldCheck, ArrowLeft, Wrench, BarChart3, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BeltSaverTool from './BeltSaverTool';
import DiagnosticsHistory from './DiagnosticsHistory';

interface AggregateOppsAppProps {
  onNavigateToHub: () => void;
}

const AggregateOppsApp = ({ onNavigateToHub }: AggregateOppsAppProps) => {
  const [activeTab, setActiveTab] = useState('beltsaver');

  return (
    <div className="min-h-screen bg-secondary text-foreground flex flex-col">
      {/* Header */}
      <header className="p-4 bg-card border-b border-border flex justify-between items-center">
        <button 
          onClick={onNavigateToHub} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <ArrowLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="industrial-title text-xl tracking-tighter text-foreground">
            HINJD <span className="text-primary">AGGS</span>
          </span>
        </button>
        <button 
          onClick={onNavigateToHub} 
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShieldCheck size={24} />
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* App Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl industrial-title mb-2 text-foreground">Conveyor Diagnostics</h1>
            <p className="text-muted-foreground text-sm italic">
              BeltSaver® Mistracking Troubleshooter
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 bg-card border border-border">
              <TabsTrigger 
                value="beltsaver" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Wrench size={16} className="mr-2" />
                BeltSaver
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <History size={16} className="mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="metrics"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 size={16} className="mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beltsaver" className="mt-0">
              <BeltSaverTool />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <DiagnosticsHistory />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0">
              <div className="p-8 bg-card border border-border rounded-3xl text-center">
                <BarChart3 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="industrial-title text-lg mb-2">Production Metrics</h3>
                <p className="text-muted-foreground text-sm italic">
                  Yield tracking and performance analytics coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AggregateOppsApp;
