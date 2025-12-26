import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface AggregateOppsAppProps {
  onNavigateToHub: () => void;
}

const AggregateOppsApp = ({ onNavigateToHub }: AggregateOppsAppProps) => {
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
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl industrial-title text-primary">A</span>
          </div>
          <h1 className="text-2xl industrial-title mb-3 text-foreground">AggregateOpps</h1>
          <p className="text-muted-foreground italic mb-8">
            Production & Yield Utility for aggregate operations
          </p>
          <div className="p-6 bg-card border border-border rounded-3xl">
            <p className="text-muted-foreground text-sm">
              [App Content Active Here]
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AggregateOppsApp;
