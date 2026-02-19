import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Loader2 } from 'lucide-react';

const Base44AppPage = () => {
  const [loading, setLoading] = useState(true);

  return (
    <AppLayout>
      <div className="relative w-full h-[calc(100vh-4rem)]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading Cox Aggs App…</p>
          </div>
        )}
        <iframe
          src="https://preview--cox-aggs-27e91ba7.base44.app"
          className="w-full h-full border-0"
          title="Cox Aggs App"
          allow="clipboard-write; clipboard-read"
          onLoad={() => setLoading(false)}
        />
      </div>
    </AppLayout>
  );
};

export default Base44AppPage;
