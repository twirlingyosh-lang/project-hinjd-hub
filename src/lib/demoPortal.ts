// Demo-only state. Lives solely in localStorage under DEMO_KEY — never sent to the backend or the payment processor.
export const DEMO_KEY = 'hinjd_demo_portal_v1';
export const DEMO_TTL_MS = 30 * 60 * 1000;
export const DEMO_STEPS = ['Requested', 'Quoted', 'Invoiced', 'Paid'] as const;

export interface DemoState {
  createdAt: number;
  step: number; // index into DEMO_STEPS
  quote: { id: string; product: string; quantity: number; amount: number };
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function newDemo(now = Date.now()): DemoState {
  return { createdAt: now, step: 0, quote: { id: `DEMO-${now.toString(36).toUpperCase()}`, product: 'BeltSaver® tail pulley (demo)', quantity: 1, amount: 4850 } };
}

export function loadDemo(store: Store, now = Date.now()): DemoState | null {
  const raw = store.getItem(DEMO_KEY);
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as DemoState;
    if (!d.quote?.id?.startsWith('DEMO-') || now - d.createdAt > DEMO_TTL_MS) {
      store.removeItem(DEMO_KEY);
      return null;
    }
    return d;
  } catch {
    store.removeItem(DEMO_KEY);
    return null;
  }
}

export const saveDemo = (store: Store, d: DemoState) => store.setItem(DEMO_KEY, JSON.stringify(d));
/** Removes only the demo key. */
export const resetDemo = (store: Store) => store.removeItem(DEMO_KEY);
export const advance = (d: DemoState): DemoState => ({ ...d, step: Math.min(d.step + 1, DEMO_STEPS.length - 1) });
