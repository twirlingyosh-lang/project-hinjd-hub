// Web Worker for heavy computation tasks
// This runs in a separate thread to avoid blocking the main UI

export type WorkerMessage = {
  type: 'process' | 'calculate' | 'transform';
  payload: unknown;
  id: string;
};

export type WorkerResponse = {
  type: 'result' | 'error' | 'progress';
  payload: unknown;
  id: string;
};

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;

  try {
    let result: unknown;

    switch (type) {
      case 'process':
        result = await processData(payload);
        break;
      case 'calculate':
        result = await calculate(payload);
        break;
      case 'transform':
        result = await transform(payload);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    self.postMessage({ type: 'result', payload: result, id } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error',
      id,
    } as WorkerResponse);
  }
};

// Example processing functions - customize as needed
async function processData(data: unknown): Promise<unknown> {
  // Simulate heavy processing
  const items = Array.isArray(data) ? data : [data];
  return items.map((item) => ({ processed: true, original: item }));
}

async function calculate(data: unknown): Promise<unknown> {
  // Example: heavy calculation
  const input = data as { numbers?: number[] };
  if (input.numbers) {
    return {
      sum: input.numbers.reduce((a, b) => a + b, 0),
      avg: input.numbers.reduce((a, b) => a + b, 0) / input.numbers.length,
      max: Math.max(...input.numbers),
      min: Math.min(...input.numbers),
    };
  }
  return { error: 'No numbers provided' };
}

async function transform(data: unknown): Promise<unknown> {
  // Example: data transformation
  return JSON.parse(JSON.stringify(data));
}
