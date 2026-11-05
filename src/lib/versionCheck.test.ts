import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  VERSION_UPDATE_PROMPT_SHOWN_KEY,
  extractHistoryChunkFile,
  extractServedHighlights,
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
    expect(latest[0].version).toBe('v2.4.23');
    expect(latest[0].badge).toContain('v2.4.23');
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

// v2.4.21 — the served version's change summary is read from the served
// VersionHistoryModal chunk, so the update modal can show WHAT was fixed.
describe('extractHistoryChunkFile', () => {
  it('finds the history chunk filename in the real index-bundle pattern', () => {
    expect(
      extractHistoryChunkFile('import("./VersionHistoryModal-ZZJ-1ZPO.js")'),
    ).toBe('VersionHistoryModal-ZZJ-1ZPO.js');
  });

  it('returns null when the chunk is not referenced', () => {
    expect(extractHistoryChunkFile('no chunk here')).toBeNull();
    expect(extractHistoryChunkFile('')).toBeNull();
  });
});

describe('extractServedHighlights', () => {
  // Realistic fixture in the REAL minified shape: backtick strings,
  // icon:<component> between title and items, two highlight groups,
  // an item containing double quotes and a bracket.
  const CHUNK =
    'x={version:`v2.4.21`,type:`minor`,releaseDate:`၂၀၂၆ ခုနှစ်၊ နိုဝင်ဘာလ`,isLatest:!0,' +
    'title:`🎉 [NEW] Version Update modal မှာ ပြင်ထားတာ အကျဉ်းချုပ် ပြမယ်`,badge:`Latest Release (v2.4.21)`,badgeColor:`bg-emerald-100`,' +
    'highlights:[{title:`🎉 Version Update — ဘာပြင်ထားလဲ modal ထဲမှာ ပြမယ်`,icon:f,items:[' +
    '`ဗားရှင်းအသစ် ရောက်ရင် နံပါတ်နဲ့တကွ ပြင်ထားတာ အကျဉ်းချုပ် (၄ ချက်အထိ) ကို modal ထဲမှာ တခါတည်း ပြမယ် — Version History သွားကြည့်စရာ မလိုတော့ဘူး`,' +
    '`v2.4.20 မှာ နံပါတ်ပဲ ပြပြီး အကျဉ်းချုပ် ကျန်ခဲ့တာ — အခု ပြင်ပေးထားတယ်`,' +
    '`ဗားရှင်းအသစ်ရဲ့ အကျဉ်းချုပ် ဖတ်မရရင် အတုမပြဘူး — အမှန်အတိုင်း \"ပြန်ဖွင့်ပြီးမှ Version History မှာ ကြည့်နိုင်ပါသည်\" လို့ပဲ ပြမယ်`]},' +
    '{title:`⚖️ BMI — မှတ်တမ်း အခန်းမှာပါ လက်ရှိ BMI ပြမယ်`,icon:s,items:[' +
    '`Admin ရဲ့ လူနာအသေးစိတ် စာမျက်နှာ BMI မှတ်တမ်း အခန်းမှာ လက်ရှိ BMI ကို အပေါ်ဆုံးမှာ ပြမယ်`,' +
    '`Trends ရဲ့ BMI Graph / ဇယား နေရာမှာလည်း မှတ်တမ်း မရှိရင် လက်ရှိ BMI ကို Profile အရ ပြမယ်`]}]}' +
    ',{version:`v2.4.20`,type:`minor`,title:`🔄 [NEW] Version Update ပြတာ သေချာမယ်`,highlights:[{title:`🔄 Version Update`,icon:f,items:[`old item one`,`old item two`]}]}';

  it('extracts the title and at most 4 items (first group, then the next)', () => {
    const out = extractServedHighlights(CHUNK, 'v2.4.21');
    expect(out).not.toBeNull();
    expect(out!.title).toBe('🎉 [NEW] Version Update modal မှာ ပြင်ထားတာ အကျဉ်းချုပ် ပြမယ်');
    expect(out!.items).toHaveLength(4);
    expect(out!.items[0]).toContain('အကျဉ်းချုပ် (၄ ချက်အထိ)');
    expect(out!.items[2]).toContain('အတုမပြဘူး');
    // 4th item comes from the second group — and is NOT the old version's.
    expect(out!.items[3]).toContain('လူနာအသေးစိတ်');
    expect(out!.items).not.toContain('old item one');
  });

  it('returns only the requested version’s items, never an older entry’s', () => {
    const out = extractServedHighlights(CHUNK, 'v2.4.20');
    expect(out).not.toBeNull();
    expect(out!.title).toBe('🔄 [NEW] Version Update ပြတာ သေချာမယ်');
    expect(out!.items).toEqual(['old item one', 'old item two']);
  });

  it('returns null when the version has no entry', () => {
    expect(extractServedHighlights(CHUNK, 'v2.4.99')).toBeNull();
    expect(extractServedHighlights('no entries here', 'v2.4.21')).toBeNull();
    expect(extractServedHighlights('', 'v2.4.21')).toBeNull();
  });

  it('returns null when the entry has no highlights or no items', () => {
    expect(
      extractServedHighlights('{version:`v2.4.21`,title:`T`,highlights:[]}', 'v2.4.21'),
    ).toBeNull();
    expect(
      extractServedHighlights('{version:`v2.4.21`,title:`T`}', 'v2.4.21'),
    ).toBeNull();
  });

  it('returns null on a malformed (unterminated) items array instead of throwing', () => {
    expect(
      extractServedHighlights(
        '{version:`v2.4.21`,title:`T`,highlights:[{title:`G`,icon:f,items:[`a`,`b`}',
        'v2.4.21',
      ),
    ).toBeNull();
  });

  it('unescapes backticks inside an item', () => {
    const out = extractServedHighlights(
      '{version:`v2.4.21`,title:`T`,highlights:[{title:`G`,icon:f,items:[`has \\`tick\\` inside`]}]}',
      'v2.4.21',
    );
    expect(out).not.toBeNull();
    expect(out!.items).toEqual(['has `tick` inside']);
  });

  it('does not end an item at a bracket inside the item text', () => {
    const out = extractServedHighlights(
      '{version:`v2.4.21`,title:`T`,highlights:[{title:`G`,icon:f,items:[`see [NEW] here`,`second`]}]}',
      'v2.4.21',
    );
    expect(out).not.toBeNull();
    expect(out!.items).toEqual(['see [NEW] here', 'second']);
  });
});
