import { ContentGenerator } from '@/components/ContentGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BeltAssistant from '@/components/BeltAssistant';

const ContentGeneratorPage = () => {
  const { user } = useAuth();

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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user ? (
          <ContentGenerator />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to use the AI content generator.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </main>

      <BeltAssistant />
    </div>
  );
};

export default ContentGeneratorPage;
