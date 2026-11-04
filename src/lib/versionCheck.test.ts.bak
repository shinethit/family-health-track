import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  VERSION_UPDATE_PROMPT_SHOWN_KEY,
  markVersionUpdatePromptShown,
  readShownVersionUpdateHash,
  shouldShowVersionUpdatePrompt,
} from './versionCheck';
import { VERSION_HISTORY_DATA } from '../components/modules/VersionHistoryModal';

// v2.4.16 (H-H12) — the "Latest" badge in the Version History list is
// derived from isLatest (VersionHistoryModal renders the Latest pill only
// when item.isLatest is true), never from a hardcoded version string. So
// the data itself must have exactly one latest entry, and it must be the
// current version at the head of the list.
describe('version history latest entry', () => {
  it('has exactly one entry with isLatest: true', () => {
    expect(VERSION_HISTORY_DATA.filter((v) => v.isLatest).length).toBe(1);
  });

  it('the latest entry is the first entry and matches the current version', () => {
    const latest = VERSION_HISTORY_DATA.filter((v) => v.isLatest);
    expect(latest[0]).toBe(VERSION_HISTORY_DATA[0]);
    expect(latest[0].version).toBe('v2.4.18');
    expect(latest[0].badge).toContain('v2.4.18');
  });

  it('no other entry claims to be latest', () => {
    expect(VERSION_HISTORY_DATA.slice(1).some((v) => v.isLatest)).toBe(false);
  });
});

// v2.4.16 — the auto version-update prompt must appear at most once per
// new deploy; a manual check always shows its result.

describe('shouldShowVersionUpdatePrompt', () => {
  it('manual checks always show, even if already shown for this hash', () => {
    expect(
      shouldShowVersionUpdatePrompt({ isManual: true, servedHash: 'abc', alreadyShownHash: 'abc' }),
    ).toBe(true);
    expect(
      shouldShowVersionUpdatePrompt({ isManual: true, servedHash: 'abc', alreadyShownHash: null }),
    ).toBe(true);
  });

  it('auto shows the first time for a served hash', () => {
    expect(
      shouldShowVersionUpdatePrompt({ isManual: false, servedHash: 'abc', alreadyShownHash: null }),
    ).toBe(true);
  });

  it('auto skips when the prompt was already shown for this served hash', () => {
    expect(
      shouldShowVersionUpdatePrompt({ isManual: false, servedHash: 'abc', alreadyShownHash: 'abc' }),
    ).toBe(false);
  });

  it('auto shows again when a NEWER deploy arrives (different served hash)', () => {
    expect(
      shouldShowVersionUpdatePrompt({ isManual: false, servedHash: 'def', alreadyShownHash: 'abc' }),
    ).toBe(true);
  });

  it('auto never shows without a served hash', () => {
    expect(
      shouldShowVersionUpdatePrompt({ isManual: false, servedHash: null, alreadyShownHash: null }),
    ).toBe(false);
  });
});

describe('version update prompt storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips the shown hash through sessionStorage', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    });
    expect(readShownVersionUpdateHash()).toBeNull();
    markVersionUpdatePromptShown('hash123');
    expect(readShownVersionUpdateHash()).toBe('hash123');
    expect(store.get(VERSION_UPDATE_PROMPT_SHOWN_KEY)).toBe('hash123');
  });

  it('does not throw when sessionStorage is unavailable', () => {
    // Node test env has no sessionStorage at all — helpers must not throw.
    expect(readShownVersionUpdateHash()).toBeNull();
    expect(() => markVersionUpdatePromptShown('x')).not.toThrow();
  });

  it('does not throw when sessionStorage throws (e.g. private mode)', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(readShownVersionUpdateHash()).toBeNull();
    expect(() => markVersionUpdatePromptShown('x')).not.toThrow();
  });
});
