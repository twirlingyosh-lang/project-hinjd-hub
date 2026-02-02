import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkerPool, PoolTask, PoolTaskResult } from '@/workers/workerPool';

interface PoolStats {
  poolSize: number;
  busyWorkers: number;
  queuedTasks: number;
}

interface UseWorkerPoolReturn {
  execute: (task: PoolTask) => Promise<PoolTaskResult>;
  executeAll: (tasks: PoolTask[]) => Promise<PoolTaskResult[]>;
  executeWithProgress: (
    tasks: PoolTask[],
    onProgress: (completed: number, total: number, result: PoolTaskResult) => void
  ) => Promise<PoolTaskResult[]>;
  stats: PoolStats;
  isProcessing: boolean;
  progress: { completed: number; total: number } | null;
  terminate: () => void;
}

export function useWorkerPool(poolSize?: number): UseWorkerPoolReturn {
  const poolRef = useRef<WorkerPool | null>(null);
  const [stats, setStats] = useState<PoolStats>({ poolSize: 0, busyWorkers: 0, queuedTasks: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  useEffect(() => {
    poolRef.current = new WorkerPool(poolSize);
    setStats(poolRef.current.getStats());

    return () => {
      poolRef.current?.terminate();
    };
  }, [poolSize]);

  const updateStats = useCallback(() => {
    if (poolRef.current) {
      setStats(poolRef.current.getStats());
    }
  }, []);

  const execute = useCallback(async (task: PoolTask): Promise<PoolTaskResult> => {
    if (!poolRef.current) {
      return { success: false, error: 'Pool not initialized', taskIndex: 0 };
    }

    setIsProcessing(true);
    updateStats();

    try {
      const result = await poolRef.current.execute(task);
      return result;
    } finally {
      updateStats();
      setIsProcessing(false);
    }
  }, [updateStats]);

  const executeAll = useCallback(async (tasks: PoolTask[]): Promise<PoolTaskResult[]> => {
    if (!poolRef.current) {
      return tasks.map((_, i) => ({ success: false, error: 'Pool not initialized', taskIndex: i }));
    }

    setIsProcessing(true);
    setProgress({ completed: 0, total: tasks.length });
    updateStats();

    try {
      const results = await poolRef.current.executeWithProgress(tasks, (completed, total) => {
        setProgress({ completed, total });
        updateStats();
      });
      return results;
    } finally {
      updateStats();
      setIsProcessing(false);
      setProgress(null);
    }
  }, [updateStats]);

  const executeWithProgress = useCallback(
    async (
      tasks: PoolTask[],
      onProgress: (completed: number, total: number, result: PoolTaskResult) => void
    ): Promise<PoolTaskResult[]> => {
      if (!poolRef.current) {
        return tasks.map((_, i) => ({ success: false, error: 'Pool not initialized', taskIndex: i }));
      }

      setIsProcessing(true);
      setProgress({ completed: 0, total: tasks.length });
      updateStats();

      try {
        const results = await poolRef.current.executeWithProgress(tasks, (completed, total, result) => {
          setProgress({ completed, total });
          updateStats();
          onProgress(completed, total, result);
        });
        return results;
      } finally {
        updateStats();
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [updateStats]
  );

  const terminate = useCallback(() => {
    poolRef.current?.terminate();
    poolRef.current = null;
    setStats({ poolSize: 0, busyWorkers: 0, queuedTasks: 0 });
    setIsProcessing(false);
    setProgress(null);
  }, []);

  return {
    execute,
    executeAll,
    executeWithProgress,
    stats,
    isProcessing,
    progress,
    terminate,
  };
}
