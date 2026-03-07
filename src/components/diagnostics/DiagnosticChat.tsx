import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, X, Sparkles, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

type MessageContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
type Message = { role: 'user' | 'assistant'; content: MessageContent };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/equipment-diagnostics`;

interface DiagnosticChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiagnosticChat({ isOpen, onClose }: DiagnosticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm CrushFix AI — your expert guide to fixing crusher and screener problems **without waiting for a dealer**.\n\nTell me what's happening and I'll walk you through the diagnosis and repair step-by-step. Upload photos for visual analysis!\n\n**What's the issue?**\n- Equipment type (crusher/screener model if known)\n- Symptoms you're seeing\n- Any unusual sounds, smells, or behaviors"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (event) => { setPendingImage(event.target?.result as string); toast.success('Image ready to send'); };
    reader.onerror = () => { toast.error('Failed to read image'); };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    if (resp.status === 402) throw new Error("AI credits depleted. Please add credits to continue.");
    if (!resp.ok || !resp.body) throw new Error("Failed to connect to diagnostic service");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch { textBuffer = line + "\n" + textBuffer; break; }
      }
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage) || isLoading) return;
    let userContent: MessageContent;
    if (pendingImage) {
      const contentParts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [];
      contentParts.push({ type: 'text', text: input.trim() || 'Please analyze this image and help diagnose any visible issues.' });
      contentParts.push({ type: 'image_url', image_url: { url: pendingImage } });
      userContent = contentParts;
    } else {
      userContent = input.trim();
    }
    const userMessage: Message = { role: 'user', content: userContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setPendingImage(null);
    setIsLoading(true);
    try {
      const contextMessages = newMessages.filter((_, i) => i > 0);
      await streamChat(contextMessages);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getDisplayContent = (content: MessageContent): string => {
    if (typeof content === 'string') return content;
    const textPart = content.find(c => c.type === 'text');
    return textPart?.type === 'text' ? textPart.text : '';
  };

  const hasImage = (content: MessageContent): boolean => {
    if (typeof content === 'string') return false;
    return content.some(c => c.type === 'image_url');
  };

  const getImageUrl = (content: MessageContent): string | null => {
    if (typeof content === 'string') return null;
    const imgPart = content.find(c => c.type === 'image_url');
    return imgPart?.type === 'image_url' ? imgPart.image_url.url : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col bg-card border-border shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold">CrushFix AI</h2>
              <p className="text-xs text-muted-foreground">Diagnostic Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {hasImage(message.content) && (
                    <img src={getImageUrl(message.content) || ''} alt="Uploaded equipment" className="max-w-full max-h-48 rounded mb-2 object-contain" />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{getDisplayContent(message.content)}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
                <div className="bg-muted rounded-lg p-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
              </div>
            )}
          </div>
        </ScrollArea>

        {pendingImage && (
          <div className="px-4 py-2 border-t border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <img src={pendingImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
              <span className="text-sm text-muted-foreground flex-1">Image ready to send</span>
              <Button variant="ghost" size="sm" onClick={() => setPendingImage(null)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Upload image">
              <ImagePlus className="w-5 h-5" />
            </Button>
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={pendingImage ? "Add a description (optional)..." : "Describe your equipment issue..."} className="flex-1 bg-muted border-border" disabled={isLoading} />
            <Button onClick={handleSend} disabled={(!input.trim() && !pendingImage) || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Upload photos for visual analysis. Always follow safety procedures.</p>
        </div>
      </Card>
    </div>
  );
}
