import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useContentGeneration, ContentType } from '@/hooks/useContentGeneration';
import { toast } from 'sonner';

const contentTypes: { value: ContentType; label: string; description: string }[] = [
  { value: 'description', label: 'Description', description: 'Generate product or feature descriptions' },
  { value: 'summary', label: 'Summary', description: 'Summarize text or documents' },
  { value: 'report', label: 'Report', description: 'Create structured reports' },
  { value: 'custom', label: 'Custom', description: 'Free-form content generation' },
];

export const ContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('custom');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { generateContent, isGenerating } = useContentGeneration();

  const handleGenerate = async () => {
    const content = await generateContent({
      prompt,
      type: contentType,
      context: context || undefined,
    });

    if (content) {
      setGeneratedContent(content);
      toast.success('Content generated successfully!');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate descriptions, summaries, reports, or custom content using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe what content you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (optional)</Label>
          <Textarea
            id="context"
            placeholder="Add any additional context or instructions..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
