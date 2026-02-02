import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerMessage, WorkerResponse } from '@/workers/computation.worker';

type WorkerStatus = 'idle' | 'processing' | 'error';

interface UseWebWorkerReturn {
  execute: (type: WorkerMessage['type'], payload: unknown) => Promise<unknown>;
  status: WorkerStatus;
  error: string | null;
  terminate: () => void;
}

export function useWebWorker(): UseWebWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>>(new Map());
  const [status, setStatus] = useState<WorkerStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create worker using Vite's worker syntax
    workerRef.current = new Worker(
      new URL('../workers/computation.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload, id } = event.data;
      const pending = pendingRef.current.get(id);

      if (pending) {
        if (type === 'error') {
          pending.reject(new Error(payload as string));
          setError(payload as string);
          setStatus('error');
        } else {
          pending.resolve(payload);
          setStatus('idle');
          setError(null);
        }
        pendingRef.current.delete(id);
      }
    };

    workerRef.current.onerror = (e) => {
      setError(e.message);
      setStatus('error');
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const execute = useCallback(
    (type: WorkerMessage['type'], payload: unknown): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const id = crypto.randomUUID();
        pendingRef.current.set(id, { resolve, reject });
        setStatus('processing');
        setError(null);

        workerRef.current.postMessage({ type, payload, id } as WorkerMessage);
      });
    },
    []
  );

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setStatus('idle');
  }, []);

  return { execute, status, error, terminate };
}
