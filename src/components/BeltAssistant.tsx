import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Minimize2, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/belt-assistant`;

const BeltAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm BeltSaver AI, your conveyor belt diagnostic assistant. Describe your belt tracking issue and I'll help you troubleshoot it. What problem are you experiencing?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session, user } = useAuth();
  const { freeUsesRemaining, hasActiveSubscription, canUse, decrementUsage } = useUsageLimit();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check authentication before sending
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }

    // Check usage limits
    if (!hasActiveSubscription && !canUse) {
      toast({
        title: "Usage Limit Reached",
        description: "You've used all your free uses. Subscribe for unlimited access.",
        variant: "destructive"
      });
      return;
    }

    // Decrement usage for AI chat
    const usageSuccess = await decrementUsage();
    if (!usageSuccess && !hasActiveSubscription) {
      toast({
        title: "Usage Limit Reached",
        description: "You've used all your free uses. Subscribe for unlimited access.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message to start streaming into
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
            // Incomplete JSON, put back and wait
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });
      // Remove the empty assistant message if error occurred
      if (!assistantContent) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle size={24} />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-card border border-border rounded-3xl shadow-2xl flex flex-col z-50 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Bot size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">BeltSaver AI</h3>
            <p className="text-xs text-muted-foreground">Diagnostic Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
          <Minimize2 size={16} />
        </Button>
      </div>

      {/* Authentication Check */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <LogIn size={32} className="text-muted-foreground" />
          </div>
          <h4 className="font-semibold mb-2">Sign In Required</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Please sign in to use the AI diagnostic assistant.
          </p>
          <Button onClick={() => navigate('/auth')} className="rounded-xl">
            Sign In
          </Button>
        </div>
      ) : !canUse && !hasActiveSubscription ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <AlertCircle size={32} className="text-destructive" />
          </div>
          <h4 className="font-semibold mb-2">Usage Limit Reached</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You've used all 10 free uses. Subscribe for unlimited access.
          </p>
          <Button 
            onClick={() => window.open('mailto:info@hinjd.com?subject=Subscription%20Inquiry', '_blank')} 
            className="rounded-xl"
          >
            Subscribe Now
          </Button>
        </div>
      ) : (
        <>
          {/* Usage indicator */}
          {!hasActiveSubscription && (
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Free uses remaining</span>
                <span className={`font-bold ${freeUsesRemaining <= 3 ? 'text-primary' : 'text-foreground'}`}>
                  {freeUsesRemaining}/10
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    {msg.content || (isLoading && i === messages.length - 1 ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null)}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <User size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your belt issue..."
                disabled={isLoading}
                className="flex-1 rounded-xl"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-xl"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BeltAssistant;
