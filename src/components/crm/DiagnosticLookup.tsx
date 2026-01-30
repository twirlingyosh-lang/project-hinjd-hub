import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Wrench, Loader2, ShoppingCart, Bot, Send, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EQUIPMENT_TYPES = [
  'Excavator',
  'Dozer',
  'Wheel Loader',
  'Backhoe',
  'Skid Steer',
  'Motor Grader',
  'Articulated Truck',
  'Compactor',
  'Crane',
];

const MAKES = [
  'CAT',
  'Komatsu',
  'John Deere',
  'Hitachi',
  'Volvo',
  'Case',
  'Kubota',
  'Bobcat',
  'JCB',
  'Kobelco',
];

const ORDER_PRICE = 500;

export const DiagnosticLookup = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [equipmentType, setEquipmentType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to use AI diagnostics');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/equipment-diagnostics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          equipmentType,
          make,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 402) {
          toast.error('AI quota exceeded. Please try again later.');
        } else {
          toast.error(errorData.error || 'Failed to get AI response');
        }
        setLoading(false);
        return;
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      if (!reader) {
        throw new Error('No response stream');
      }

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

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
            // Partial JSON, continue
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
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
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error('Diagnostics error:', error);
      toast.error('Failed to connect to AI diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    streamChat(input.trim());
  };

  const handleOrderPart = async () => {
    try {
      toast.loading('Creating order...', { id: 'order-loading' });
      
      const { data, error } = await supabase.functions.invoke('create-part-order', {
        body: {
          partNumber: 'AI-DIAG',
          partName: 'AI Diagnosed Part',
          faultCode: 'AI-ASSIST',
        },
      });

      toast.dismiss('order-loading');

      if (error) {
        toast.error('Failed to create order');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to checkout...');
      }
    } catch (err) {
      toast.dismiss('order-loading');
      toast.error('Failed to create order');
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Diagnostic Engine
          <Badge variant="secondary" className="ml-2">Gemini Powered</Badge>
        </CardTitle>
        <CardDescription>
          Real AI diagnostics for heavy equipment - powered by Google Gemini
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Equipment Context Selectors */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={make} onValueChange={setMake}>
            <SelectTrigger>
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              {MAKES.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="Model (e.g., 320D)" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          
          <Select value={equipmentType} onValueChange={setEquipmentType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/30" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">AI Diagnostics Ready</p>
              <p className="text-sm text-center mt-1">
                Describe your equipment issue and I'll diagnose it with parts & repair steps
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput("My excavator is running hot and losing hydraulic power")}
                >
                  "Excavator running hot, losing hydraulic power"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput("CAT 320D error code E360 - what does it mean?")}
                >
                  "CAT 320D error code E360"
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-background border rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Describe the symptoms... (e.g., 'Engine overheating after 30 minutes of operation')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            {messages.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={clearChat}>
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Order Button */}
        {messages.length > 0 && (
          <Button 
            className="w-full" 
            onClick={handleOrderPart}
            variant="secondary"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Order Diagnosed Part - ${ORDER_PRICE} (80/20 Split)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticLookup;
