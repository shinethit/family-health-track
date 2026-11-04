import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  VERSION_UPDATE_PROMPT_SHOWN_KEY,
  extractServedVersion,
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
    expect(latest[0].version).toBe('v2.4.20');
    expect(latest[0].badge).toContain('v2.4.20');
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

  it('round-trips the shown hash through localStorage (v2.4.20: survives relaunches)', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
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

  it('does not throw when no storage exists at all', () => {
    // Node test env has neither localStorage nor sessionStorage — helpers
    // must not throw.
    expect(readShownVersionUpdateHash()).toBeNull();
    expect(() => markVersionUpdatePromptShown('x')).not.toThrow();
  });

  it('does not throw when both storages throw (e.g. private mode)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
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

  it('falls back to sessionStorage when localStorage is unavailable', () => {
    const sessionStore = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => sessionStore.get(k) ?? null,
      setItem: (k: string, v: string) => {
        sessionStore.set(k, v);
      },
    });
    markVersionUpdatePromptShown('hash456');
    expect(readShownVersionUpdateHash()).toBe('hash456');
    expect(sessionStore.get(VERSION_UPDATE_PROMPT_SHOWN_KEY)).toBe('hash456');
  });
});

// v2.4.20 — the served version is read from the served bundle's JS text.
describe('extractServedVersion', () => {
  it('extracts the version from the real minified bundle pattern', () => {
    // Both occurrences in the real built bundle are backtick-quoted and agree.
    expect(extractServedVersion('or(`useNotifications must be used`);return e},Jt=`v2.4.20`;function Yt(e){if(e.record')).toBe('v2.4.20');
    expect(extractServedVersion('t t=Je();if(!t){let t=localStorage.getItem(`myanmar_health_app_version`);t?t===`v2.4.19`?e&&n({message:')).toBe('v2.4.19');
  });

  it('returns the first version when several are present', () => {
    expect(extractServedVersion('a=`v2.4.20`;b=`v2.4.21`')).toBe('v2.4.20');
  });

  it('returns null when the bundle has no backtick-quoted version', () => {
    expect(extractServedVersion('const x = "v2.4.20";')).toBeNull();
    expect(extractServedVersion('no version here at all')).toBeNull();
    expect(extractServedVersion('')).toBeNull();
  });
});
