import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, CheckCircle, 
  AlertCircle, ArrowRight, Save 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ResultsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materialData, setMaterialData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentMaterial');
    if (saved) {
      setMaterialData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    if (!user) {
      toast.error('Please sign in to save results');
      navigate('/auth');
      return;
    }

    const runData = {
      id: Date.now().toString(),
      type: 'analysis',
      data: materialData,
      timestamp: new Date().toISOString(),
    };

    const existingRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    existingRuns.unshift(runData);
    localStorage.setItem('savedRuns', JSON.stringify(existingRuns.slice(0, 50)));
    
    toast.success('Results saved');
    navigate('/app/saved');
  };

  if (!materialData) {
    return (
      <AppLayout title="Results">
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Target className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
          <p className="text-muted-foreground mb-6">
            Enter material data to see analysis results
          </p>
          <Link to="/app/materials">
            <Button>Go to Materials</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Mock analysis results
  const efficiency = 87;
  const recommendations = [
    { status: 'good', text: 'Feed rate within optimal range' },
    { status: 'warning', text: 'Consider increasing screen deck angle' },
    { status: 'good', text: 'Crusher CSS is properly set' },
  ];

  return (
    <AppLayout title="Results">
      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Efficiency</p>
                <p className="text-4xl font-bold text-primary">{efficiency}%</p>
              </div>
              <div className={`p-3 rounded-full ${efficiency >= 80 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                {efficiency >= 80 ? (
                  <TrendingUp className="w-8 h-8 text-green-400" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-yellow-400" />
                )}
              </div>
            </div>
            <Progress value={efficiency} className="h-2" />
          </CardContent>
        </Card>

        {/* Material Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Material Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Yardage</span>
              <span className="font-medium">{materialData.yardage} yd³</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Aggregate Type</span>
              <Badge variant="secondary">{materialData.aggregateType}</Badge>
            </div>
            {materialData.crusherType && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Crusher</span>
                <span className="font-medium capitalize">{materialData.crusherType}</span>
              </div>
            )}
            {materialData.feedSize && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Feed Size</span>
                <span className="font-medium">{materialData.feedSize}"</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  rec.status === 'good' 
                    ? 'bg-green-500/10' 
                    : 'bg-yellow-500/10'
                }`}
              >
                {rec.status === 'good' ? (
                  <CheckCircle className="text-green-400 shrink-0" size={18} />
                ) : (
                  <AlertCircle className="text-yellow-400 shrink-0" size={18} />
                )}
                <span className="text-sm">{rec.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleSave}>
            <Save size={16} />
            Save Results
          </Button>
          <Link to="/app/calculator" className="flex-1">
            <Button className="w-full gap-2">
              <ArrowRight size={16} />
              Run Calculator
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ResultsPage;
