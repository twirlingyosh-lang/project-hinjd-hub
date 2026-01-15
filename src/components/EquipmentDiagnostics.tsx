import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Loader2, Wrench, Truck, AlertTriangle, Settings, Zap, History, MapPin, Package, Upload, Image, X, Save, Search, Phone, Globe, Map, DollarSign, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import GoogleMapView from '@/components/app/GoogleMapView';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DiagnosticRecord {
  id: string;
  created_at: string;
  equipment_type: string | null;
  make: string | null;
  model: string | null;
  symptoms: string;
  diagnosis: string | null;
  parts_needed: unknown;
  status: string;
  images: string[] | null;
}

interface Dealer {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  makes_served: string[];
  latitude: number | null;
  longitude: number | null;
}

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string | null;
  category: string | null;
  equipment_types: string[];
  makes: string[];
  avg_price: number | null;
}

const EQUIPMENT_TYPES = [
  { value: 'excavator', label: 'Excavator / Trackhoe' },
  { value: 'dozer', label: 'Dozer / Bulldozer' },
  { value: 'loader', label: 'Wheel Loader' },
  { value: 'backhoe', label: 'Backhoe' },
  { value: 'skidsteer', label: 'Skid Steer' },
  { value: 'grader', label: 'Motor Grader' },
  { value: 'truck', label: 'Articulated Truck' },
  { value: 'compactor', label: 'Compactor' },
  { value: 'crane', label: 'Crane' },
  { value: 'other', label: 'Other' },
];

const MAKES = [
  'CAT (Caterpillar)',
  'Komatsu',
  'John Deere',
  'Hitachi',
  'Volvo',
  'Case',
  'Kubota',
  'Bobcat',
  'Liebherr',
  'Kobelco',
  'JCB',
  'Doosan',
  'Hyundai',
  'Other',
];

export const EquipmentDiagnostics = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentType, setEquipmentType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [activeTab, setActiveTab] = useState('diagnose');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);
  const [dealerSearch, setDealerSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [jobSiteLocation, setJobSiteLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Get user's location for job site
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setJobSiteLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Salt Lake area if geolocation fails
          setJobSiteLocation({ lat: 40.76, lng: -111.89 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory();
    }
    if (activeTab === 'dealers') {
      fetchDealers();
    }
    if (activeTab === 'parts') {
      fetchParts();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('equipment_diagnostics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDiagnosticHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchDealers = async () => {
    setIsLoadingDealers(true);
    try {
      let query = supabase
        .from('equipment_dealers')
        .select('*')
        .order('name');

      if (dealerSearch) {
        query = query.or(`name.ilike.%${dealerSearch}%,city.ilike.%${dealerSearch}%,state.ilike.%${dealerSearch}%`);
      }

      if (make) {
        query = query.contains('makes_served', [make]);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setDealers(data || []);
    } catch (error) {
      console.error('Error fetching dealers:', error);
    } finally {
      setIsLoadingDealers(false);
    }
  };

  const fetchParts = async () => {
    setIsLoadingParts(true);
    try {
      let query = supabase
        .from('equipment_parts')
        .select('*')
        .order('name');

      if (partSearch) {
        query = query.or(`name.ilike.%${partSearch}%,part_number.ilike.%${partSearch}%,description.ilike.%${partSearch}%,category.ilike.%${partSearch}%`);
      }

      if (make) {
        query = query.contains('makes', [make]);
      }

      if (equipmentType) {
        query = query.contains('equipment_types', [equipmentType]);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setIsLoadingParts(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('equipment-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('equipment-images')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      toast({
        title: 'Images uploaded',
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveDiagnostic = async () => {
    if (!user || messages.length === 0) return;

    setIsSaving(true);
    try {
      const symptoms = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
      const diagnosis = messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n\n');

      const { error } = await supabase.from('equipment_diagnostics').insert({
        user_id: user.id,
        equipment_type: equipmentType || null,
        make: make || null,
        model: model || null,
        symptoms,
        diagnosis,
        images: uploadedImages,
        status: 'completed',
      });

      if (error) throw error;

      toast({
        title: 'Diagnostic saved',
        description: 'Your diagnostic has been saved to history',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save diagnostic',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/equipment-diagnostics`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: userMessages,
          equipmentType,
          make,
          model,
          images: uploadedImages,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get diagnosis');
    }

    return response;
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await streamChat(newMessages);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (!reader) throw new Error('No response stream');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      toast({
        title: 'Diagnosis Error',
        description: error instanceof Error ? error.message : 'Failed to get diagnosis',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewDiagnosis = () => {
    setMessages([]);
    setInput('');
    setUploadedImages([]);
  };

  const loadFromHistory = (record: DiagnosticRecord) => {
    setEquipmentType(record.equipment_type || '');
    setMake(record.make || '');
    setModel(record.model || '');
    setMessages([
      { role: 'user', content: record.symptoms },
      { role: 'assistant', content: record.diagnosis || '' },
    ]);
    setUploadedImages(record.images || []);
    setActiveTab('diagnose');
  };


  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="diagnose" className="flex items-center gap-1 text-xs sm:text-sm">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Diagnose</span>
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex items-center gap-1 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Parts</span>
          </TabsTrigger>
          <TabsTrigger value="dealers" className="flex items-center gap-1 text-xs sm:text-sm">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Dealers</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* DIAGNOSE TAB */}
        <TabsContent value="diagnose" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <Card className="mb-4 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Equipment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment-type">Equipment Type</Label>
                  <Select value={equipmentType} onValueChange={setEquipmentType}>
                    <SelectTrigger id="equipment-type">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Select value={make} onValueChange={setMake}>
                    <SelectTrigger id="make">
                      <SelectValue placeholder="Select make..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MAKES.map(m => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., 320D, PC200, 410L"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Upload Photos
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !user}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-md border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {!user && (
                  <p className="text-xs text-muted-foreground mt-2">Sign in to upload images</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setInput("My equipment won't start. The engine cranks but doesn't fire.")}
              >
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-xs">Won't Start</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setInput("Hydraulic system is losing power and moving slowly.")}
              >
                <Settings className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Hydraulic Issues</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setInput("Engine is overheating and the temp gauge is in the red.")}
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-xs">Overheating</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setInput("Strange noise coming from the undercarriage/tracks.")}
              >
                <Wrench className="h-5 w-5 text-orange-500" />
                <span className="text-xs">Unusual Noise</span>
              </Button>
            </div>
          )}

          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-2 flex-shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Diagnostic Chat
              </CardTitle>
              <div className="flex gap-2">
                {messages.length > 0 && user && (
                  <Button variant="outline" size="sm" onClick={saveDiagnostic} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                )}
                {messages.length > 0 && (
                  <Button variant="outline" size="sm" onClick={startNewDiagnosis}>
                    New
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Equipment Opps AI</p>
                    <p className="text-sm">
                      Describe your equipment problem and I'll diagnose it, show you the fix, 
                      identify parts, and help you find them at local dealers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          {msg.role === 'assistant' && msg.content && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <Badge variant="secondary" className="text-xs">
                                Equipment Opps AI
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Textarea
                  placeholder="Describe your equipment problem..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className="px-4"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARTS TAB */}
        <TabsContent value="parts" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Search
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by part number, name, or category..."
                    value={partSearch}
                    onChange={e => setPartSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchParts} disabled={isLoadingParts}>
                  {isLoadingParts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Select value={make} onValueChange={(v) => { setMake(v); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Makes</SelectItem>
                    {MAKES.filter(m => m !== 'Other').map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={equipmentType} onValueChange={(v) => { setEquipmentType(v); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {EQUIPMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingParts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : parts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No parts found</p>
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-3">
                    {parts.map(part => (
                      <Card key={part.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono">{part.part_number}</Badge>
                                {part.category && <Badge variant="secondary">{part.category}</Badge>}
                              </div>
                              <h3 className="font-semibold">{part.name}</h3>
                              {part.description && (
                                <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {part.makes?.map((m, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                                ))}
                              </div>
                            </div>
                            {part.avg_price && (
                              <div className="text-right ml-4">
                                <div className="flex items-center text-lg font-bold text-primary">
                                  <DollarSign className="h-4 w-4" />
                                  {part.avg_price.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">avg. price</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEALERS TAB */}
        <TabsContent value="dealers" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Find Dealers
                </CardTitle>
                <Button 
                  variant={showMap ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                >
                  <Map className="h-4 w-4 mr-1" />
                  {showMap ? 'List' : 'Map'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, city, or state..."
                    value={dealerSearch}
                    onChange={e => setDealerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchDealers} disabled={isLoadingDealers}>
                  {isLoadingDealers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {isLoadingDealers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : showMap ? (
                <div className="flex-1 min-h-[500px] rounded-lg overflow-hidden border">
                  <GoogleMapView
                    dealers={dealers}
                    selectedDealer={selectedDealer}
                    onDealerSelect={setSelectedDealer}
                    jobSiteLocation={jobSiteLocation}
                    onJobSiteChange={setJobSiteLocation}
                    showLogistics={true}
                    showInventoryStatus={true}
                    allowManualJobSite={true}
                  />
                </div>
              ) : dealers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No dealers found</p>
                  <p className="text-sm mt-2">Try a different search</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4">
                        Add Dealer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a Dealer</DialogTitle>
                      </DialogHeader>
                      <AddDealerForm onSuccess={fetchDealers} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-3">
                    {dealers.map(dealer => (
                      <Card key={dealer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{dealer.name}</h3>
                              {(dealer.address || dealer.city || dealer.state) && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {[dealer.address, dealer.city, dealer.state].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {dealer.makes_served && dealer.makes_served.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {dealer.makes_served.map((m, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {m}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {dealer.phone && (
                                <a href={`tel:${dealer.phone}`} className="text-sm flex items-center gap-1 text-primary hover:underline">
                                  <Phone className="h-3 w-3" />
                                  {dealer.phone}
                                </a>
                              )}
                              {dealer.website && (
                                <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 text-primary hover:underline">
                                  <Globe className="h-3 w-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Diagnostic History
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {!user ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sign in to view your diagnostic history</p>
                </div>
              ) : isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : diagnosticHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No diagnostic history yet</p>
                  <p className="text-sm mt-2">Your saved diagnostics will appear here</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {diagnosticHistory.map(record => (
                      <Card key={record.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => loadFromHistory(record)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {record.make && <Badge variant="outline">{record.make}</Badge>}
                                {record.model && <Badge variant="secondary">{record.model}</Badge>}
                                {record.equipment_type && (
                                  <Badge variant="secondary" className="capitalize">
                                    {record.equipment_type}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm line-clamp-2">{record.symptoms}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(record.created_at).toLocaleDateString()} at{' '}
                                {new Date(record.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            {record.images && record.images.length > 0 && (
                              <div className="ml-4 flex gap-1">
                                {record.images.slice(0, 2).map((img, i) => (
                                  <img key={i} src={img} alt="" className="h-12 w-12 object-cover rounded" />
                                ))}
                                {record.images.length > 2 && (
                                  <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-sm">
                                    +{record.images.length - 2}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add Dealer Form Component
const AddDealerForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('equipment_dealers').insert({
        name,
        address: address || null,
        city: city || null,
        state: state || null,
        phone: phone || null,
        website: website || null,
        makes_served: selectedMakes,
      });

      if (error) throw error;

      toast({
        title: 'Dealer added',
        description: 'The dealer has been added to the database',
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding dealer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add dealer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Dealer Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input value={state} onChange={e => setState(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={website} onChange={e => setWebsite(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Makes Served</Label>
        <div className="flex flex-wrap gap-2">
          {MAKES.filter(m => m !== 'Other').map(m => (
            <Badge
              key={m}
              variant={selectedMakes.includes(m) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                setSelectedMakes(prev =>
                  prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                );
              }}
            >
              {m}
            </Badge>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Add Dealer
      </Button>
    </form>
  );
};

export default EquipmentDiagnostics;
