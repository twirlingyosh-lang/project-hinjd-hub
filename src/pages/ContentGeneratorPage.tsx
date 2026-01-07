import { ContentGenerator } from '@/components/ContentGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BeltAssistant from '@/components/BeltAssistant';

const ContentGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">AI Content Generator</h1>
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Demo</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ContentGenerator />
      </main>

      <BeltAssistant />
    </div>
  );
};

export default ContentGeneratorPage;
