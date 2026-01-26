import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Receipt, MoreHorizontal, Download, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  pdf_url: string | null;
  client_id: string | null;
  client_name: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/10 text-blue-500',
  paid: 'bg-green-500/10 text-green-500',
  overdue: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-muted text-muted-foreground line-through'
};

export const CRMInvoices = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_invoices')
        .select(`
          *,
          crm_clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data?.map(inv => ({
        ...inv,
        amount: Number(inv.amount) || 0,
        client_name: (inv.crm_clients as any)?.name || 'No Client'
      })) || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvoices(invoices.filter(i => i.id !== id));
      toast.success('Invoice deleted');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('crm_invoices')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setInvoices(invoices.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <CRMLayout title="Invoices">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Paid This Month</p>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(
                invoices
                  .filter(i => i.status === 'paid')
                  .reduce((sum, i) => sum + i.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => navigate('/crm/invoices/new')}>
          <Plus size={18} className="mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first invoice to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/crm/invoices/new')}>
                <Plus size={18} className="mr-2" />
                New Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(invoice => (
                <TableRow 
                  key={invoice.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/crm/invoices/${invoice.id}`)}
                >
                  <TableCell className="font-mono text-sm">
                    {invoice.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[invoice.status] || STATUS_COLORS.draft}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.due_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.pdf_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(invoice.pdf_url!, '_blank');
                        }}
                      >
                        <Download size={16} />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/crm/invoices/${invoice.id}/edit`);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        {['draft', 'sent', 'paid', 'overdue', 'cancelled']
                          .filter(s => s !== invoice.status)
                          .map(s => (
                            <DropdownMenuItem 
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(invoice.id, s);
                              }}
                            >
                              Mark as {s}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInvoice(invoice.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </CRMLayout>
  );
};

export default CRMInvoices;
