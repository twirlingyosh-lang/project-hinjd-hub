import { useState } from 'react';
import { useWorkerPool } from '@/hooks/useWorkerPool';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { PoolTask, PoolTaskResult } from '@/workers/workerPool';

export function WorkerPoolDemo() {
  const { executeAll, stats, progress, isProcessing } = useWorkerPool(4);
  const [results, setResults] = useState<PoolTaskResult[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const runDemo = async () => {
    setResults(null);
    setDuration(null);

    // Generate 50 calculation tasks
    const tasks: PoolTask[] = Array.from({ length: 50 }, (_, i) => ({
      type: 'calculate' as const,
      payload: {
        numbers: Array.from({ length: 1000 }, () => Math.random() * 100),
      },
    }));

    const start = performance.now();
    const taskResults = await executeAll(tasks);
    const end = performance.now();

    setResults(taskResults);
    setDuration(Math.round(end - start));
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const errorCount = results?.filter((r) => !r.success).length ?? 0;
  const progressPercent = progress ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Worker Pool Demo
        </CardTitle>
        <CardDescription>
          Parallel processing with {stats.poolSize} workers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">
            Pool Size: {stats.poolSize}
          </Badge>
          <Badge variant={stats.busyWorkers > 0 ? 'default' : 'secondary'}>
            Busy: {stats.busyWorkers}
          </Badge>
          <Badge variant={stats.queuedTasks > 0 ? 'destructive' : 'secondary'}>
            Queued: {stats.queuedTasks}
          </Badge>
        </div>

        {/* Progress */}
        {isProcessing && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing...</span>
              <span>{progress.completed}/{progress.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {successCount} success
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {errorCount} errors
                </span>
              )}
            </div>
            {duration !== null && (
              <p className="text-sm text-muted-foreground">
                Completed in {duration}ms
              </p>
            )}
          </div>
        )}

        {/* Run Button */}
        <Button 
          onClick={runDemo} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing 50 Tasks...
            </>
          ) : (
            'Run 50 Parallel Tasks'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
