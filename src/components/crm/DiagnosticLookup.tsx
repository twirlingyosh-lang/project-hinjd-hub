import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Wrench, DollarSign, Tag, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticResult {
  id: string;
  fault_code: string;
  fault_description: string;
  part_number: string;
  part_name: string;
  price: number;
  category: string | null;
  equipment_types: string[];
}

const ORDER_PRICE = 500; // Fixed $500 order price

export const DiagnosticLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a fault code or description');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('diagnostic_logic')
        .select('*')
        .or(`fault_code.ilike.%${searchTerm}%,fault_description.ilike.%${searchTerm}%,part_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  const handleOrderPart = async (result: DiagnosticResult) => {
    try {
      toast.loading('Creating order...', { id: 'order-loading' });
      
      const { data, error } = await supabase.functions.invoke('create-part-order', {
        body: {
          partNumber: result.part_number,
          partName: result.part_name,
          faultCode: result.fault_code,
        },
      });

      toast.dismiss('order-loading');

      if (error) {
        console.error('Order error:', error);
        toast.error('Failed to create order. Please try again.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to checkout...');
      } else {
        toast.error('No checkout URL received');
      }
    } catch (err) {
      toast.dismiss('order-loading');
      console.error('Order error:', err);
      toast.error('Failed to create order');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Diagnostic Engine
        </CardTitle>
        <CardDescription>
          Search fault codes to find matching parts and pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fault codes (e.g., HIGH_TEMP, BELT_SLIP)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No matching diagnostics found</p>
                <p className="text-sm">Try a different fault code or description</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">
                          {result.fault_code}
                        </Badge>
                        {result.category && (
                          <Badge variant="secondary">{result.category}</Badge>
                        )}
                      </div>
                      <p className="font-medium">{result.fault_description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(result.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span className="font-mono">{result.part_number}</span>
                      </div>
                      <span className="text-sm">{result.part_name}</span>
                    </div>
                    <div className="flex gap-1">
                      {result.equipment_types?.slice(0, 3).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-3" 
                    onClick={() => handleOrderPart(result)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order Part - ${ORDER_PRICE} (80% Revenue / 20% Scholarship)
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Enter a fault code to search the diagnostic database</p>
            <p className="text-sm mt-1">Examples: HIGH_TEMP, LOW_PRESS, BELT_SLIP</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticLookup;
