import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Loader2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IFRAME_URL = "https://preview--cox-aggs-27e91ba7.base44.app";

const Base44AppPage = () => {
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <AppLayout>
      <div className="relative w-full h-[calc(100vh-4rem)]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-10">
            {timedOut ? (
              <>
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Cox Aggs is taking too long to load. The external app may be down or blocking iframe access.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimedOut(false);
                      setLoading(true);
                      // Force iframe reload
                      const iframe = document.querySelector('iframe[title="Cox Aggs App"]') as HTMLIFrameElement;
                      if (iframe) iframe.src = IFRAME_URL;
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Retry
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(IFRAME_URL, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" /> Open Directly
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading Cox Aggs App…</p>
              </>
            )}
          </div>
        )}
        <iframe
          src={IFRAME_URL}
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
