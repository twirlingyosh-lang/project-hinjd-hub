import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/app/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, AlertCircle, Info, Wrench, Package, DollarSign, Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DiagnosticEntry {
  id: string;
  fault_code: string;
  fault_description: string;
  category: string | null;
  part_number: string;
  part_name: string;
  price: number;
  equipment_types: string[] | null;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "crusher", label: "Crushers" },
  { value: "screener", label: "Screeners" },
  { value: "conveyor", label: "Conveyors" },
  { value: "heavy-equipment", label: "Heavy Equipment" },
];

export default function FaultCodePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<DiagnosticEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [ordering, setOrdering] = useState<string | null>(null);
  const { user } = useAuth();

  const handleOrderPart = async (entry: DiagnosticEntry) => {
    if (!user) { toast.error("Sign in to order parts"); return; }
    setOrdering(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-part-order", {
        body: { partNumber: entry.part_number, partName: entry.part_name },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error("Order failed", { description: err.message });
    } finally {
      setOrdering(null);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() && category === "all") return;
    setLoading(true);
    setSearched(true);

    let q = supabase.from("diagnostic_logic").select("*");
    if (query.trim()) {
      q = q.or(`fault_code.ilike.%${query.trim()}%,fault_description.ilike.%${query.trim()}%,part_number.ilike.%${query.trim()}%`);
    }
    if (category !== "all") {
      q = q.eq("category", category);
    }

    const { data, error } = await q.order("fault_code", { ascending: true }).limit(50);
    if (error) {
      toast.error("Search failed", { description: error.message });
      setResults([]);
    } else {
      setResults((data as DiagnosticEntry[]) || []);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <AppLayout title="Fault Code Lookup">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Diagnostic Engine</h1>
          <p className="text-muted-foreground">Search fault codes, find parts and pricing from the diagnostic database.</p>
        </div>

        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search fault code, description, or part number..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

        {!loading && searched && results.length === 0 && (
          <Card className="text-center py-12"><CardContent><Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No fault codes found.</p></CardContent></Card>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
            {results.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary/60 hover:border-l-primary transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <code className="text-primary">{entry.fault_code}</code>
                        <span className="text-foreground">{entry.fault_description}</span>
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        {entry.category && <Badge variant="outline" className="text-xs">{entry.category}</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/30 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{entry.part_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">Part # {entry.part_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-primary font-bold text-xl">
                        <DollarSign className="w-5 h-5" />{entry.price.toFixed(2)}
                      </div>
                      <Button size="sm" onClick={() => handleOrderPart(entry)} disabled={ordering === entry.id} className="gap-1">
                        {ordering === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}Order $500
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!searched && (
          <div className="text-center py-16">
            <Wrench className="w-16 h-16 mx-auto text-primary/30 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">Enter a fault code or keyword</h2>
            <p className="text-sm text-muted-foreground">Search across crushers, screeners, heavy equipment, and more.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
