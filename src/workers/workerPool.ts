import type { WorkerMessage, WorkerResponse } from './computation.worker';

export interface PoolTask {
  type: WorkerMessage['type'];
  payload: unknown;
}

export interface PoolTaskResult {
  success: boolean;
  result?: unknown;
  error?: string;
  taskIndex: number;
}

interface QueuedTask {
  task: PoolTask;
  taskIndex: number;
  resolve: (result: PoolTaskResult) => void;
}

interface WorkerState {
  worker: Worker;
  busy: boolean;
  currentTaskId: string | null;
}

export class WorkerPool {
  private workers: WorkerState[] = [];
  private taskQueue: QueuedTask[] = [];
  private pendingTasks: Map<string, { queued: QueuedTask; workerIndex: number }> = new Map();
  private poolSize: number;

  constructor(poolSize: number = navigator.hardwareConcurrency || 4) {
    this.poolSize = Math.max(1, Math.min(poolSize, 16)); // Limit between 1-16
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(
        new URL('./computation.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(i, event.data);
      };

      worker.onerror = (error) => {
        console.error(`Worker ${i} error:`, error);
        this.handleWorkerError(i, error.message);
      };

      this.workers.push({
        worker,
        busy: false,
        currentTaskId: null,
      });
    }
  }

  private handleWorkerMessage(workerIndex: number, response: WorkerResponse): void {
    const { type, payload, id } = response;
    const pending = this.pendingTasks.get(id);

    if (pending) {
      const { queued } = pending;
      
      if (type === 'error') {
        queued.resolve({
          success: false,
          error: payload as string,
          taskIndex: queued.taskIndex,
        });
      } else {
        queued.resolve({
          success: true,
          result: payload,
          taskIndex: queued.taskIndex,
        });
      }

      this.pendingTasks.delete(id);
    }

    // Mark worker as available and process next task
    this.workers[workerIndex].busy = false;
    this.workers[workerIndex].currentTaskId = null;
    this.processQueue();
  }

  private handleWorkerError(workerIndex: number, errorMessage: string): void {
    const workerState = this.workers[workerIndex];
    
    if (workerState.currentTaskId) {
      const pending = this.pendingTasks.get(workerState.currentTaskId);
      if (pending) {
        pending.queued.resolve({
          success: false,
          error: errorMessage,
          taskIndex: pending.queued.taskIndex,
        });
        this.pendingTasks.delete(workerState.currentTaskId);
      }
    }

    workerState.busy = false;
    workerState.currentTaskId = null;
    this.processQueue();
  }

  private getAvailableWorker(): number {
    return this.workers.findIndex((w) => !w.busy);
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const workerIndex = this.getAvailableWorker();
      if (workerIndex === -1) break;

      const queued = this.taskQueue.shift()!;
      this.executeOnWorker(workerIndex, queued);
    }
  }

  private executeOnWorker(workerIndex: number, queued: QueuedTask): void {
    const id = crypto.randomUUID();
    const workerState = this.workers[workerIndex];

    workerState.busy = true;
    workerState.currentTaskId = id;
    this.pendingTasks.set(id, { queued, workerIndex });

    const message: WorkerMessage = {
      type: queued.task.type,
      payload: queued.task.payload,
      id,
    };

    workerState.worker.postMessage(message);
  }

  /**
   * Execute a single task on an available worker
   */
  execute(task: PoolTask): Promise<PoolTaskResult> {
    return new Promise((resolve) => {
      const queued: QueuedTask = {
        task,
        taskIndex: 0,
        resolve,
      };

      const workerIndex = this.getAvailableWorker();
      if (workerIndex !== -1) {
        this.executeOnWorker(workerIndex, queued);
      } else {
        this.taskQueue.push(queued);
      }
    });
  }

  /**
   * Execute multiple tasks in parallel across all workers
   */
  executeAll(tasks: PoolTask[]): Promise<PoolTaskResult[]> {
    const promises = tasks.map((task, taskIndex) => {
      return new Promise<PoolTaskResult>((resolve) => {
        const queued: QueuedTask = {
          task,
          taskIndex,
          resolve,
        };

        const workerIndex = this.getAvailableWorker();
        if (workerIndex !== -1) {
          this.executeOnWorker(workerIndex, queued);
        } else {
          this.taskQueue.push(queued);
        }
      });
    });

    return Promise.all(promises);
  }

  /**
   * Execute tasks with a callback for each completed task (useful for progress tracking)
   */
  executeWithProgress(
    tasks: PoolTask[],
    onProgress: (completed: number, total: number, result: PoolTaskResult) => void
  ): Promise<PoolTaskResult[]> {
    let completed = 0;
    const total = tasks.length;
    const results: PoolTaskResult[] = new Array(total);

    const promises = tasks.map((task, taskIndex) => {
      return new Promise<PoolTaskResult>((resolve) => {
        const queued: QueuedTask = {
          task,
          taskIndex,
          resolve: (result) => {
            completed++;
            results[taskIndex] = result;
            onProgress(completed, total, result);
            resolve(result);
          },
        };

        const workerIndex = this.getAvailableWorker();
        if (workerIndex !== -1) {
          this.executeOnWorker(workerIndex, queued);
        } else {
          this.taskQueue.push(queued);
        }
      });
    });

    return Promise.all(promises);
  }

  /**
   * Get current pool statistics
   */
  getStats(): { poolSize: number; busyWorkers: number; queuedTasks: number } {
    return {
      poolSize: this.poolSize,
      busyWorkers: this.workers.filter((w) => w.busy).length,
      queuedTasks: this.taskQueue.length,
    };
  }

  /**
   * Terminate all workers and clean up
   */
  terminate(): void {
    this.workers.forEach((w) => w.worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.pendingTasks.clear();
  }
}
