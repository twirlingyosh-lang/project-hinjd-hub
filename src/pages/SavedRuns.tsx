import AppLayout from '@/components/AppLayout';
import DiagnosticsHistory from '@/components/DiagnosticsHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { History, Lock } from 'lucide-react';

const SavedRuns = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl industrial-title mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to view your saved diagnostic runs and history.
            </p>
            <Button asChild size="lg">
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="industrial-label mb-2">Diagnostic History</p>
          <h1 className="text-2xl md:text-3xl industrial-title mb-2">
            Saved <span className="text-primary">Runs</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage your past diagnostic sessions
          </p>
        </div>

        {/* History Component */}
        <DiagnosticsHistory />
      </div>
    </AppLayout>
  );
};

export default SavedRuns;
