import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BarChart3, AlertTriangle, CheckCircle, Share2, Download, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DiagnosticResult {
  id: string;
  location: string;
  tracking_direction: string;
  cause: string;
  severity: string;
  recommendations: string[];
  belt_saver_benefits: string[];
  created_at: string;
}

const Results = () => {
  const { user } = useAuth();
  const [latestResult, setLatestResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestResult = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('belt_diagnostics')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching result:', error);
        }
        setLatestResult(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/30';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-6" />
              <div className="h-6 bg-muted rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-64 mx-auto" />
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl industrial-title mb-4">Sign In to View Results</h1>
            <p className="text-muted-foreground mb-8">
              Your diagnostic results will appear here after running the calculator.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!latestResult) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl industrial-title mb-4">No Results Yet</h1>
            <p className="text-muted-foreground mb-8">
              Run a diagnostic using the calculator to see your results here.
            </p>
            <Button asChild>
              <Link to="/calculator">
                Go to Calculator
                <ArrowRight size={16} className="ml-2" />
              </Link>
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
        <div className="mb-6">
          <p className="industrial-label mb-2">Latest Diagnostic</p>
          <h1 className="text-2xl md:text-3xl industrial-title mb-2">
            Analysis <span className="text-primary">Results</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date(latestResult.created_at).toLocaleString()}
          </p>
        </div>

        {/* Severity Badge */}
        <Card className={`p-6 mb-6 border ${getSeverityColor(latestResult.severity)}`}>
          <div className="flex items-center gap-4">
            <AlertTriangle size={32} />
            <div>
              <p className="text-sm opacity-75">Severity Level</p>
              <p className="text-xl font-bold uppercase">{latestResult.severity}</p>
            </div>
          </div>
        </Card>

        {/* Cause */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-3">Identified Cause</h2>
          <p className="text-lg">{latestResult.cause}</p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">{latestResult.location}</Badge>
            <Badge variant="secondary">{latestResult.tracking_direction}</Badge>
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-3">
            {latestResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* BeltSaver Benefits */}
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <h2 className="font-semibold mb-4 text-primary">BeltSaver® Benefits</h2>
          <ul className="space-y-3">
            {latestResult.belt_saver_benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 gap-2">
            <Share2 size={16} />
            Share
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button asChild className="flex-1">
            <Link to="/saved-runs">View All Runs</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
