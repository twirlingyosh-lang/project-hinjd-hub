import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Copy, Check, Trash2, Edit, Search, Code2, Globe, Lock } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSnippets, Snippet } from '@/hooks/useSnippets';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'html', 'css', 'sql',
  'bash', 'json', 'yaml', 'markdown', 'java', 'csharp', 'cpp', 'ruby', 'php',
];

const emptyForm = {
  title: '',
  description: '',
  code: '',
  language: 'javascript',
  tags: [] as string[],
  is_public: false,
};

const SnippetsPage = () => {
  const { user } = useAuth();
  const { snippets, isLoading, createSnippet, updateSnippet, deleteSnippet } = useSnippets();
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = snippets.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = filterLang === 'all' || s.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagInput('');
    setDialogOpen(true);
  };

  const openEdit = (s: Snippet) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description || '',
      code: s.code,
      language: s.language,
      tags: s.tags || [],
      is_public: s.is_public,
    });
    setTagInput('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error('Title and code are required');
      return;
    }
    if (editingId) {
      await updateSnippet.mutateAsync({ id: editingId, ...form });
    } else {
      await createSnippet.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Please sign in to manage snippets.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Code Snippets
            </h1>
            <p className="text-muted-foreground text-sm">Save, organize, and share reusable code</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Snippet</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Snippet' : 'New Snippet'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React useDebounce hook" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this snippet do?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={form.language} onValueChange={v => setForm(f => ({ ...f, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch checked={form.is_public} onCheckedChange={v => setForm(f => ({ ...f, is_public: v }))} />
                      <span className="text-sm text-muted-foreground">{form.is_public ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.tags.map(t => (
                        <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}>
                          {t} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Textarea value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} rows={12} className="font-mono text-sm resize-y" placeholder="Paste your code here..." />
                </div>
                <Button onClick={handleSave} className="w-full" disabled={createSnippet.isPending || updateSnippet.isPending}>
                  {editingId ? 'Update Snippet' : 'Save Snippet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snippets..." className="pl-9" />
          </div>
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Code2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No snippets yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(s => (
              <Card key={s.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {s.title}
                        {s.is_public ? <Globe className="h-3.5 w-3.5 text-muted-foreground" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      </CardTitle>
                      {s.description && <CardDescription>{s.description}</CardDescription>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(s.code, s.id)}>
                        {copiedId === s.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSnippet.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <Badge variant="outline">{s.language}</Badge>
                    {s.tags?.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="rounded-md overflow-hidden text-sm">
                    <SyntaxHighlighter language={s.language} style={oneDark} customStyle={{ margin: 0, borderRadius: '0.375rem', fontSize: '0.8125rem' }}>
                      {s.code}
                    </SyntaxHighlighter>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SnippetsPage;
