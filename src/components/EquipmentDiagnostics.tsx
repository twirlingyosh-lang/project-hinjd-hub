import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Wrench, Truck, AlertTriangle, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
  };

  return (
    <div className="flex flex-col h-full">
      {/* Equipment Selection Header */}
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
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={startNewDiagnosis}>
              New Diagnosis
            </Button>
          )}
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
    </div>
  );
};

export default EquipmentDiagnostics;
