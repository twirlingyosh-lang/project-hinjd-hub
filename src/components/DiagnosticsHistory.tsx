import { useEffect, useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Diagnostic {
  id: string;
  created_at: string;
  location: string;
  tracking_direction: string;
  severity: string;
  cause: string;
  recommendations: string[];
  belt_saver_benefits: string[];
  status: string;
  notes: string | null;
}

const DiagnosticsHistory = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('belt_diagnostics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiagnostics(data || []);
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError('Failed to load diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-green-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left': return <ArrowLeft size={14} />;
      case 'right': return <ArrowRight size={14} />;
      case 'alternating': return <span className="text-xs">↔</span>;
      default: return <span className="text-xs">⬇</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (location: string) => {
    const locations: Record<string, string> = {
      'head': 'Head Pulley',
      'tail': 'Tail Pulley',
      'midspan': 'Mid-Span',
      'multiple': 'Multiple Locations'
    };
    return locations[location] || location;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="py-6 text-center">
          <AlertTriangle className="mx-auto mb-2 text-destructive" size={32} />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchDiagnostics}>
            <RefreshCw size={14} className="mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (diagnostics.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Clock className="mx-auto mb-4 text-muted-foreground/30" size={48} />
          <h3 className="industrial-title text-lg mb-2">No Diagnostics Yet</h3>
          <p className="text-muted-foreground text-sm">
            Run a diagnosis using the BeltSaver tool to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="industrial-title text-lg">Diagnostic History</h3>
        <Button variant="ghost" size="sm" onClick={fetchDiagnostics}>
          <RefreshCw size={14} className="mr-2" />
          Refresh
        </Button>
      </div>

      {diagnostics.map((diag) => (
        <Card key={diag.id} className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {diag.cause}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {formatDate(diag.created_at)}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getSeverityColor(diag.severity)}>
                  {diag.severity}
                </Badge>
                <Badge variant="outline" className={getStatusColor(diag.status)}>
                  {diag.status === 'in_progress' ? 'In Progress' : diag.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {formatLocation(diag.location)}
              </span>
              <span className="flex items-center gap-1">
                {getDirectionIcon(diag.tracking_direction)}
                {diag.tracking_direction}
              </span>
            </div>
            
            {diag.notes && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2 mb-3">
                {diag.notes}
              </p>
            )}

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Recommendations:</span>{' '}
              {diag.recommendations.length} items
            </div>

            {diag.belt_saver_benefits.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <CheckCircle size={12} />
                BeltSaver® solution available
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DiagnosticsHistory;
