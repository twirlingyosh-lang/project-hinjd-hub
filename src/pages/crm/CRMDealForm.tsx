import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, X, FileText } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' },
];

export const CRMDealForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('lead');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [contractName, setContractName] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchClients();
      if (isEdit) {
        fetchDeal();
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

  const fetchDeal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setClientId(data.client_id || '');
      setValue(data.value?.toString() || '');
      setStage(data.stage);
      setExpectedCloseDate(data.expected_close_date || '');
      setNotes(data.notes || '');
      setContractUrl(data.contract_url);
      if (data.contract_url) {
        const urlParts = data.contract_url.split('/');
        setContractName(urlParts[urlParts.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast.error('Failed to load deal');
      navigate('/crm/deals');
    } finally {
      setLoading(false);
    }
  };

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('crm-contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for private bucket
      const { data: signedData } = await supabase.storage
        .from('crm-contracts')
        .createSignedUrl(fileName, 3600);

      setContractUrl(signedData?.signedUrl || null);
      setContractName(file.name);
      toast.success('Contract uploaded');
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast.error('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  const removeContract = () => {
    setContractUrl(null);
    setContractName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const dealData = {
        title: title.trim(),
        client_id: clientId || null,
        value: parseFloat(value) || 0,
        stage,
        expected_close_date: expectedCloseDate || null,
        notes: notes.trim() || null,
        contract_url: contractUrl,
        user_id: user.id
      };

      if (isEdit) {
        const { error } = await supabase
          .from('crm_deals')
          .update(dealData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Deal updated');
      } else {
        const { error } = await supabase
          .from('crm_deals')
          .insert(dealData);

        if (error) throw error;
        toast.success('Deal created');
      }

      navigate('/crm/deals');
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CRMLayout title={isEdit ? 'Edit Deal' : 'New Deal'}>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? 'Edit Deal' : 'New Deal'}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Deal' : 'Create New Deal'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Website Redesign Project"
                required
              />
            </div>

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

            {/* Value and Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Close Date */}
            <div className="space-y-2">
              <Label htmlFor="closeDate">Expected Close Date</Label>
              <Input
                id="closeDate"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </div>

            {/* Contract Upload */}
            <div className="space-y-2">
              <Label>Contract</Label>
              {contractUrl ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText size={20} className="text-primary" />
                  <span className="flex-1 text-sm truncate">{contractName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeContract}
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
                    onClick={() => document.getElementById('contract-upload')?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Contract
                  </Button>
                  <span className="text-sm text-muted-foreground">PDF or Word (max 10MB)</span>
                </div>
              )}
              <input
                id="contract-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleContractUpload}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Deal details, requirements, or other notes..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEdit ? 'Update Deal' : 'Create Deal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/crm/deals')}
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

export default CRMDealForm;
