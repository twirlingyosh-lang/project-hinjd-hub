import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const envVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID',
] as const;

const Debug = () => {
  const checkEnvVar = (key: string): boolean => {
    const value = import.meta.env[key];
    return typeof value === 'string' && value.length > 0;
  };

  const allPresent = envVars.every(checkEnvVar);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              Environment Check
              <Badge variant={allPresent ? 'default' : 'destructive'}>
                {allPresent ? 'OK' : 'Missing'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {envVars.map((key) => {
              const present = checkEnvVar(key);
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <code className="text-muted-foreground">{key}</code>
                  {present ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center">
          Values are not shown for security.
        </p>
      </div>
    </div>
  );
};

export default Debug;
