import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, TrendingUp, Users, DollarSign, Target, ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCRMAI } from '@/hooks/useCRMAI';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  client_name: string;
  expected_close_date: string | null;
  ai_next_steps: string | null;
}

interface FunnelStage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  deals: Deal[];
  totalValue: number;
}

const STAGES: Omit<FunnelStage, 'deals' | 'totalValue'>[] = [
  { id: 'lead', name: 'Lead', color: 'text-blue-600', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'qualified', name: 'Qualified', color: 'text-yellow-600', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'proposal', name: 'Proposal', color: 'text-purple-600', bgColor: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'negotiation', name: 'Negotiation', color: 'text-orange-600', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'closed_won', name: 'Closed Won', color: 'text-green-600', bgColor: 'bg-green-500/10 border-green-500/30' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/30' },
];

export const CRMSalesFunnel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { suggestNextSteps, loading: aiLoading } = useCRMAI();
  const { toast } = useToast();
  
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDeals();
    }
  }, [user]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select(`
          id,
          title,
          value,
          stage,
          expected_close_date,
          ai_next_steps,
          crm_clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dealsWithClients = data?.map(d => ({
        id: d.id,
        title: d.title,
        value: Number(d.value) || 0,
        stage: d.stage,
        client_name: (d.crm_clients as any)?.name || 'Unknown',
        expected_close_date: d.expected_close_date,
        ai_next_steps: d.ai_next_steps
      })) || [];

      const populatedStages = STAGES.map(stage => {
        const stageDeals = dealsWithClients.filter(d => d.stage === stage.id);
        return {
          ...stage,
          deals: stageDeals,
          totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0)
        };
      });

      setStages(populatedStages);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    e.dataTransfer.setData('dealId', deal.id);
    e.dataTransfer.setData('fromStage', deal.stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const fromStage = e.dataTransfer.getData('fromStage');

    if (fromStage === toStage) return;

    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ stage: toStage, updated_at: new Date().toISOString() })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: 'Deal Updated',
        description: `Deal moved to ${STAGES.find(s => s.id === toStage)?.name}`,
      });

      fetchDeals();
    } catch (error) {
      console.error('Error updating deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update deal stage',
        variant: 'destructive'
      });
    }
  };

  const handleGetAISuggestions = async (deal: Deal) => {
    setSelectedDeal(deal);
    setShowSuggestions(true);
    
    const suggestions = await suggestNextSteps(deal.title, {
      stage: deal.stage,
      value: deal.value,
      client_name: deal.client_name
    });

    if (suggestions) {
      setAiSuggestions(suggestions);
      
      // Save suggestions to the deal
      await supabase
        .from('crm_deals')
        .update({ ai_next_steps: suggestions.join('\n') })
        .eq('id', deal.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalPipelineValue = stages
    .filter(s => !['closed_won', 'closed_lost'].includes(s.id))
    .reduce((sum, s) => sum + s.totalValue, 0);

  const wonValue = stages.find(s => s.id === 'closed_won')?.totalValue || 0;
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0);

  if (authLoading) {
    return (
      <CRMLayout title="Sales Funnel">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Sales Funnel">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won Value</p>
                <p className="text-xl font-bold">{formatCurrency(wonValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold">{totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold">
                  {totalDeals > 0 
                    ? `${Math.round((stages.find(s => s.id === 'closed_won')?.deals.length || 0) / totalDeals * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Deal Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate('/crm/deals/new')}>
          <Plus size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Funnel Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {loading ? (
          STAGES.map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))
        ) : (
          stages.map((stage) => (
            <div
              key={stage.id}
              className={`rounded-lg border-2 ${stage.bgColor} p-3 min-h-[400px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${stage.color}`}>{stage.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stage.deals.length}
                </Badge>
              </div>
              
              <p className={`text-sm font-medium mb-3 ${stage.color}`}>
                {formatCurrency(stage.totalValue)}
              </p>

              <div className="space-y-2">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-sm truncate">{deal.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{deal.client_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetAISuggestions(deal);
                        }}
                      >
                        <Sparkles size={14} className="text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Suggestions Dialog */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Suggested Next Steps
            </DialogTitle>
            <DialogDescription>
              {selectedDeal?.title} - {selectedDeal?.client_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {aiLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : aiSuggestions.length > 0 ? (
              aiSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No suggestions available
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSuggestions(false)}>
              Close
            </Button>
            <Button onClick={() => navigate(`/crm/deals/${selectedDeal?.id}`)}>
              View Deal <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default CRMSalesFunnel;
