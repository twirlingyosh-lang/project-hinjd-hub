import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, Calculator, AlertTriangle, Clock, 
  ChevronRight, Crown, Save 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface SavedRun {
  id: string;
  type: 'tonnage' | 'troubleshoot';
  data: any;
  timestamp: string;
}

const SavedRunsPage = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<SavedRun[]>([]);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = () => {
    const saved = localStorage.getItem('savedRuns');
    if (saved) {
      setRuns(JSON.parse(saved));
    }
  };

  const deleteRun = (id: string) => {
    const updated = runs.filter(r => r.id !== id);
    setRuns(updated);
    localStorage.setItem('savedRuns', JSON.stringify(updated));
    toast.success('Run deleted');
  };

  const clearAll = () => {
    setRuns([]);
    localStorage.removeItem('savedRuns');
    toast.success('All runs cleared');
  };

  if (!user) {
    return (
      <AppLayout title="Saved Runs">
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Save className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In to Save Runs</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create an account to save your calculations and troubleshooting sessions
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Saved Runs">
      <div className="p-4 space-y-4">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Save className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Saved Runs</h2>
            <p className="text-muted-foreground mb-6">
              Your calculator and troubleshooting results will appear here
            </p>
            <Link to="/app/calculator">
              <Button>Go to Calculator</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{runs.length} saved runs</p>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {runs.map((run) => (
                <Card key={run.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          run.type === 'tonnage' 
                            ? 'bg-blue-500/10 text-blue-400' 
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {run.type === 'tonnage' ? (
                            <Calculator size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {run.type === 'tonnage' ? 'Tonnage' : 'Troubleshoot'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={12} />
                              {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {run.type === 'tonnage' ? (
                            <p className="text-sm">
                              <span className="font-medium">{run.data.tonnage} TPH</span>
                              <span className="text-muted-foreground"> × {run.data.hoursPerDay}h/day</span>
                            </p>
                          ) : (
                            <p className="text-sm truncate">
                              {run.data.issueType?.replace('-', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteRun(run.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    {run.type === 'tonnage' && run.data.results && (
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Daily</p>
                          <p className="text-sm font-medium">{run.data.results.daily.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Weekly</p>
                          <p className="text-sm font-medium">{run.data.results.weekly.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="text-sm font-medium">{Math.round(run.data.results.monthly).toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded">
                          <p className="text-xs text-muted-foreground">Yearly</p>
                          <p className="text-sm font-medium text-primary">{Math.round(run.data.results.yearly).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Crown className="text-primary" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Upgrade for cloud sync</p>
                  <p className="text-xs text-muted-foreground">Access runs on any device</p>
                </div>
                <Link to="/app/upgrade">
                  <ChevronRight size={20} className="text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SavedRunsPage;
