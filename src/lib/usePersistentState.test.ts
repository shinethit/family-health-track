import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadPersistedValue, savePersistedValue } from './usePersistentState';

function makeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe('usePersistentState helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the fallback when nothing is stored', () => {
    expect(loadPersistedValue('fht_test', 'u1', { a: false })).toEqual({ a: false });
  });

  it('round-trips a saved value under the per-user key', () => {
    savePersistedValue('fht_test', 'u1', { a: true });
    expect(loadPersistedValue('fht_test', 'u1', { a: false })).toEqual({ a: true });
  });

  it('keeps users apart: another uid sees the fallback', () => {
    savePersistedValue('fht_test', 'u1', { a: true });
    expect(loadPersistedValue('fht_test', 'u2', { a: false })).toEqual({ a: false });
  });

  it('falls back on corrupt JSON instead of throwing', () => {
    (globalThis as any).localStorage.setItem('fht_test_u1', '{not json');
    expect(loadPersistedValue('fht_test', 'u1', { a: false })).toEqual({ a: false });
  });

  it('falls back when localStorage itself is missing', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadPersistedValue('fht_test', 'u1', 7)).toBe(7);
    expect(() => savePersistedValue('fht_test', 'u1', 7)).not.toThrow();
  });
});
