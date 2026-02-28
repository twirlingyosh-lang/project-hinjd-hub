import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { FileText, Download, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Manifest {
  id: string;
  part_number: string;
  part_name: string;
  order_amount: number;
  pdf_url: string;
  status: string;
  created_at: string;
}

export const ManifestViewer = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchManifests();
  }, [user]);

  const fetchManifests = async () => {
    try {
      const { data, error } = await supabase
        .from('order_manifests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setManifests((data as Manifest[]) || []);
    } catch (err) {
      console.error('Error fetching manifests:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadManifest = async (manifest: Manifest) => {
    setDownloading(manifest.id);
    try {
      const { data, error } = await supabase.storage
        .from('manifests')
        .createSignedUrl(manifest.pdf_url, 3600);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
      toast.success('Manifest PDF opened');
    } catch (err) {
      toast.error('Failed to download manifest');
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Moroni Hub Manifests</CardTitle>
            <CardDescription>Warehouse fulfillment documents for part orders</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : manifests.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">
            No manifests generated yet. Manifests are auto-created after successful part orders.
          </p>
        ) : (
          <div className="space-y-2">
            {manifests.map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{m.part_name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{m.part_number} · {formatCurrency(m.order_amount)} · {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{m.status}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadManifest(m)}
                    disabled={downloading === m.id}
                  >
                    {downloading === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
