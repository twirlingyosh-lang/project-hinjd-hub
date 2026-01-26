import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, X, FileText } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
}

const STATUSES = [
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const CRMInvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const [clientId, setClientId] = useState<string>('');
  const [dealId, setDealId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('draft');
  const [dueDate, setDueDate] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchDeals();
      if (isEdit) {
        fetchInvoice();
      }
    }
  }, [id, user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('id, title, value')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data?.map(d => ({ ...d, value: Number(d.value) || 0 })) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setClientId(data.client_id || '');
      setDealId(data.deal_id || '');
      setAmount(data.amount?.toString() || '');
      setStatus(data.status);
      setDueDate(data.due_date || '');
      setPdfUrl(data.pdf_url);
      if (data.pdf_url) {
        const urlParts = data.pdf_url.split('/');
        setPdfName(urlParts[urlParts.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
      navigate('/crm/invoices');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill amount when deal is selected
  useEffect(() => {
    if (dealId && !isEdit) {
      const selectedDeal = deals.find(d => d.id === dealId);
      if (selectedDeal) {
        setAmount(selectedDeal.value.toString());
      }
    }
  }, [dealId, deals, isEdit]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('crm-invoices')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from('crm-invoices')
        .createSignedUrl(fileName, 3600);

      setPdfUrl(signedData?.signedUrl || null);
      setPdfName(file.name);
      toast.success('Invoice PDF uploaded');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const removePdf = () => {
    setPdfUrl(null);
    setPdfName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const invoiceData = {
        client_id: clientId || null,
        deal_id: dealId || null,
        amount: parseFloat(amount),
        status,
        due_date: dueDate || null,
        pdf_url: pdfUrl,
        user_id: user.id
      };

      if (isEdit) {
        const { error } = await supabase
          .from('crm_invoices')
          .update(invoiceData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Invoice updated');
      } else {
        const { error } = await supabase
          .from('crm_invoices')
          .insert(invoiceData);

        if (error) throw error;
        toast.success('Invoice created');
      }

      navigate('/crm/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CRMLayout title={isEdit ? 'Edit Invoice' : 'New Invoice'}>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? 'Edit Invoice' : 'New Invoice'}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Client</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal */}
            <div className="space-y-2">
              <Label htmlFor="deal">Related Deal (Optional)</Label>
              <Select value={dealId} onValueChange={setDealId}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to a deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Deal</SelectItem>
                  {deals.map(deal => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title} (${deal.value.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label>Invoice PDF</Label>
              {pdfUrl ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText size={20} className="text-primary" />
                  <span className="flex-1 text-sm truncate">{pdfName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePdf}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload PDF
                  </Button>
                  <span className="text-sm text-muted-foreground">Max 10MB</span>
                </div>
              )}
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEdit ? 'Update Invoice' : 'Create Invoice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/crm/invoices')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CRMLayout>
  );
};

export default CRMInvoiceForm;
