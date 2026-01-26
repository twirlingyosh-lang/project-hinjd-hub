import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Handshake, MoreHorizontal, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  expected_close_date: string | null;
  client_id: string | null;
  client_name: string;
  created_at: string;
}

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { key: 'qualified', label: 'Qualified', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { key: 'closed_won', label: 'Won', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { key: 'closed_lost', label: 'Lost', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
];

export const CRMDeals = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
          *,
          crm_clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeals(data?.map(d => ({
        ...d,
        value: Number(d.value) || 0,
        client_name: (d.crm_clients as any)?.name || 'No Client'
      })) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDeals(deals.filter(d => d.id !== id));
      toast.success('Deal deleted');
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    }
  };

  const updateStage = async (id: string, newStage: string) => {
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ stage: newStage })
        .eq('id', id);

      if (error) throw error;
      
      setDeals(deals.map(d => d.id === id ? { ...d, stage: newStage } : d));
      toast.success('Stage updated');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageInfo = (stage: string) => {
    return STAGES.find(s => s.key === stage) || STAGES[0];
  };

  // Group deals by stage for kanban view
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredDeals.filter(d => d.stage === stage.key);
    return acc;
  }, {} as Record<string, Deal[]>);

  return (
    <CRMLayout title="Deals">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => navigate('/crm/deals/new')}>
          <Plus size={18} className="mr-2" />
          New Deal
        </Button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGES.map(stage => (
            <div key={stage.key} className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage.key} className="min-w-[250px]">
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${stage.color}`}>
                <span className="font-medium text-sm">{stage.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {dealsByStage[stage.key]?.length || 0}
                </Badge>
              </div>
              <div className="bg-muted/30 rounded-b-lg p-2 min-h-[200px] space-y-2">
                {dealsByStage[stage.key]?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No deals
                  </p>
                ) : (
                  dealsByStage[stage.key]?.map(deal => (
                    <Card 
                      key={deal.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => navigate(`/crm/deals/${deal.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{deal.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {deal.client_name}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/crm/deals/${deal.id}/edit`);
                              }}>
                                Edit
                              </DropdownMenuItem>
                              {STAGES.filter(s => s.key !== deal.stage).map(s => (
                                <DropdownMenuItem 
                                  key={s.key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStage(deal.id, s.key);
                                  }}
                                >
                                  Move to {s.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDeal(deal.id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-sm text-primary">
                            {formatCurrency(deal.value)}
                          </span>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar size={12} />
                              {format(new Date(deal.expected_close_date), 'MMM d')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && deals.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No deals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first deal to start tracking your pipeline
            </p>
            <Button onClick={() => navigate('/crm/deals/new')}>
              <Plus size={18} className="mr-2" />
              New Deal
            </Button>
          </CardContent>
        </Card>
      )}
    </CRMLayout>
  );
};

export default CRMDeals;
