import { describe, it, expect } from 'vitest';
import { DEMO_KEY, DEMO_TTL_MS, advance, loadDemo, newDemo, resetDemo, saveDemo } from '../demoPortal';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
};

describe('demo portal', () => {
  it('reset removes only the demo key', () => {
    const s = mem();
    s.setItem('sb-auth-token', 'real');
    saveDemo(s, newDemo());
    resetDemo(s);
    expect(s.m.has(DEMO_KEY)).toBe(false);
    expect(s.getItem('sb-auth-token')).toBe('real');
  });
  it('expires after 30 minutes', () => {
    const s = mem();
    saveDemo(s, newDemo(0));
    expect(loadDemo(s, DEMO_TTL_MS + 1)).toBeNull();
    expect(s.m.has(DEMO_KEY)).toBe(false);
  });
  it('stops at Paid', () => {
    let d = newDemo();
    for (let i = 0; i < 6; i++) d = advance(d);
    expect(d.step).toBe(3);
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('demo isolation (regression)', () => {
  const realKeys: Record<string, string> = {
    'sb-zpslppxkrwjxsfotypdp-auth-token': '{"access_token":"real"}',
    'customer_profile': '{"full_name":"Real Customer"}',
    'crm_invoice_cache': '[{"id":"inv_real_123","status":"unpaid"}]',
    'stripe_config': '{"mode":"live"}',
  };
  const seeded = () => {
    const s = mem();
    Object.entries(realKeys).forEach(([k, v]) => s.setItem(k, v));
    return s;
  };
  const untouched = (s: ReturnType<typeof mem>) => Object.entries(realKeys).forEach(([k, v]) => expect(s.getItem(k)).toBe(v));

  it('demo key lives in the hinjd_demo_ namespace', () => {
    expect(DEMO_KEY.startsWith('hinjd_demo_')).toBe(true);
  });
  it('transitions and reset leave real data untouched', () => {
    const s = seeded();
    let d = newDemo();
    saveDemo(s, d);
    for (let i = 0; i < 3; i++) { d = advance(d); saveDemo(s, d); }
    resetDemo(s);
    untouched(s);
    expect([...s.m.keys()].sort()).toEqual(Object.keys(realKeys).sort());
  });
  it('expiration sweep leaves real data untouched', () => {
    const s = seeded();
    saveDemo(s, newDemo(0));
    loadDemo(s, DEMO_TTL_MS + 1);
    untouched(s);
    expect(s.m.has(DEMO_KEY)).toBe(false);
  });
  it('corrupt or non-demo data under the demo key is wiped without touching others', () => {
    const s = seeded();
    s.setItem(DEMO_KEY, JSON.stringify({ createdAt: Date.now(), step: 3, quote: { id: 'inv_real_123' } }));
    expect(loadDemo(s)).toBeNull();
    untouched(s);
  });
  it('demo ids never look like real invoice ids', () => {
    expect(newDemo().quote.id.startsWith('DEMO-')).toBe(true);
  });
  it('demo code never talks to the database or Stripe', () => {
    for (const f of ['src/lib/demoPortal.ts', 'src/components/portal/DemoWalkthrough.tsx']) {
      const src = readFileSync(resolve(process.cwd(), f), 'utf8');
      expect(src).not.toMatch(/supabase|stripe\.|functions\.invoke|fetch\(/i);
    }
  });
});
