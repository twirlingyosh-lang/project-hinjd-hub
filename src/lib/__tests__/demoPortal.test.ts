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
