import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from './CRMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Loader2, Sparkles, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  category: string | null;
  client_id: string | null;
  client_name: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  sales: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  support: 'bg-green-500/10 text-green-500 border-green-500/20',
  billing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  other: 'bg-muted text-muted-foreground'
};

export const CRMMessages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);

  // New message form
  const [content, setContent] = useState('');
  const [clientId, setClientId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/crm/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchClients();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_messages')
        .select(`
          *,
          crm_clients(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setMessages(data?.map(m => ({
        ...m,
        client_name: (m.crm_clients as any)?.name || 'Unknown'
      })) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('crm_messages')
        .insert({
          content: content.trim(),
          client_id: clientId || null,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Message logged');
      setContent('');
      setClientId('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to log message');
    } finally {
      setSending(false);
    }
  };

  const classifyMessage = async (messageId: string, messageContent: string) => {
    setClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-classify-message', {
        body: { messageId, content: messageContent }
      });

      if (error) throw error;

      // Update local state with the new category
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, category: data.category } : m
      ));

      toast.success(`Classified as ${data.category}`);
    } catch (error) {
      console.error('Error classifying message:', error);
      toast.error('Failed to classify message');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <CRMLayout title="Messages">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* New Message Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} />
              Log Message
            </CardTitle>
            <CardDescription>
              Record client communications for AI classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type the client message..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Log Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Click the AI button to auto-classify messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages logged yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{message.client_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {message.category ? (
                          <Badge className={CATEGORY_COLORS[message.category] || CATEGORY_COLORS.other}>
                            <Tag size={12} className="mr-1" />
                            {message.category}
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={classifying}
                            onClick={() => classifyMessage(message.id, message.content)}
                          >
                            {classifying ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Sparkles size={14} className="mr-1" />
                                Classify
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default CRMMessages;
