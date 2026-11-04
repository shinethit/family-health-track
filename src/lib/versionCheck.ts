// Version-update prompt guard (v2.4.16, reworked v2.4.20).
//
// Root cause fixed here: App.handleCheckVersion runs on mount AND on every
// focus / visibilitychange, and whenever the served bundle hash differed
// from the loaded hash it showed the VersionUpdateModal + toast every
// single time, with no memory of having shown it already. Dismissing the
// modal without reloading left the stale bundle loaded, so the next focus
// event showed the SAME prompt again — about 5 times for a user who
// switches apps/tabs a few times.
//
// Rule: the AUTO prompt is shown at most ONCE per new deploy. The served
// bundle hash for which the prompt was already shown is remembered in
// localStorage (v2.4.20 — was sessionStorage, which resets on every cold
// PWA launch, so each launch prompted once more; and the modal's reload
// button used to CLEAR the marker first (H-H2), so a reload that served
// the stale bundle again re-prompted for the same deploy). A MANUAL check
// ("စနစ်ဗားရှင်း စစ်ဆေးမည်") always shows its result, even if the auto
// prompt was already shown once for this deploy. When a still-newer deploy
// arrives (different served hash), the prompt shows once again for it.

export const VERSION_UPDATE_PROMPT_SHOWN_KEY =
  'fht_version_update_prompt_shown_for';

/**
 * Storage for the prompt marker. localStorage survives reloads AND cold
 * PWA launches, so one prompt per deploy. Falls back to sessionStorage
 * when localStorage is unavailable (e.g. some private modes), and to
 * nothing when neither exists (Node test env) — the helpers then behave
 * as "never shown" and never throw.
 */
function promptStorage(): Pick<Storage, 'getItem' | 'setItem'> | null {
  try {
    if (typeof localStorage !== 'undefined') {
      // Probe it: merely existing is not enough in locked-down modes.
      localStorage.getItem(VERSION_UPDATE_PROMPT_SHOWN_KEY);
      return localStorage;
    }
  } catch {
    // Fall through to the sessionStorage fallback below.
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.getItem(VERSION_UPDATE_PROMPT_SHOWN_KEY);
      return sessionStorage;
    }
  } catch {
    // Neither storage works — behave as "never shown", never crash.
  }
  return null;
}

/** Served bundle hash (if any) for which the prompt was already shown. */
export function readShownVersionUpdateHash(): string | null {
  try {
    return promptStorage()?.getItem(VERSION_UPDATE_PROMPT_SHOWN_KEY) ?? null;
  } catch {
    // Storage unavailable (e.g. some private modes) — treat as
    // "never shown". The prompt may repeat there, but it never crashes.
    return null;
  }
}

/** Remember that the prompt was shown for this served bundle hash. */
export function markVersionUpdatePromptShown(servedHash: string): void {
  try {
    promptStorage()?.setItem(VERSION_UPDATE_PROMPT_SHOWN_KEY, servedHash);
  } catch {
    // Ignore — the prompt simply may repeat in this rare environment.
  }
}

/**
 * Extract the served deploy's version string (e.g. 'v2.4.20') from the
 * served bundle's JS text (v2.4.20). The bundle emits
 * CURRENT_SYSTEM_VERSION as a template literal (`v2.4.20` — verified
 * against the real built bundle, where both occurrences are backtick
 * quoted and agree), so the first backtick-quoted semver IS the served
 * version. Returns null when no such string is found — the caller then
 * keeps the honest "version unknown" text and must NEVER invent one.
 */
export function extractServedVersion(bundleText: string): string | null {
  const m = bundleText.match(/`v(\d+\.\d+\.\d+)`/);
  return m ? `v${m[1]}` : null;
}

/** The served version's change summary, as extracted from its bundle. */
export interface ServedVersionHighlights {
  /** The entry title, e.g. '🔄 [NEW] Version Update ပြတာ သေချာမယ် + …'. */
  title: string;
  /** Up to 4 summary bullets, in history order. */
  items: string[];
}

/**
 * Extract the VersionHistoryModal chunk filename (e.g.
 * 'VersionHistoryModal-ZZJ-1ZPO.js') from the served index bundle's JS
 * text (v2.4.21). The index bundle references the lazy chunk by filename
 * (verified against the real built bundle — it appears twice). Returns
 * null when not found — the caller then shows the version without a
 * summary, never an invented one.
 */
export function extractHistoryChunkFile(indexBundleText: string): string | null {
  try {
    const m = indexBundleText.match(/VersionHistoryModal-[A-Za-z0-9_-]+\.js/);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

/**
 * Read one backtick-quoted string starting at `at` (which must point at
 * the opening backtick). The minifier emits history strings as template
 * literals, so escapes are \` \\ and \${ (plus \n \r \t for safety).
 * Returns the unescaped value and the index just past the closing
 * backtick, or null when the string is unterminated / malformed.
 */
function readBacktickString(text: string, at: number): { value: string; end: number } | null {
  if (text[at] !== '`') return null;
  let out = '';
  let i = at + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\' && i + 1 < text.length) {
      const next = text[i + 1];
      if (next === '`') out += '`';
      else if (next === '\\') out += '\\';
      else if (next === '$') out += '$';
      else if (next === 'n') out += '\n';
      else if (next === 'r') out += '\r';
      else if (next === 't') out += '\t';
      else out += next;
      i += 2;
      continue;
    }
    if (ch === '`') return { value: out, end: i + 1 };
    out += ch;
    i++;
  }
  return null;
}

/**
 * Parse the backtick-quoted strings of an `items:[...]` array starting
 * just after the opening bracket. Stops at the array's closing `]` (a
 * `]` inside a string does not end it). Returns the items and the index
 * just past the closing `]`, or null when malformed.
 */
function readItemsArray(text: string, afterOpen: number): { items: string[]; end: number } | null {
  const items: string[] = [];
  let i = afterOpen;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === ',') {
      i++;
      continue;
    }
    if (ch === ']') return { items, end: i + 1 };
    if (ch === '`') {
      const str = readBacktickString(text, i);
      if (!str) return null;
      items.push(str.value);
      i = str.end;
      continue;
    }
    return null;
  }
  return null;
}

/**
 * Extract the served version's change summary from the served
 * VersionHistoryModal chunk's JS text (v2.4.21).
 *
 * Real minified shape (verified against the built bundle):
 *   version:`v2.4.20`,type:`minor`,...,title:`🔄 [NEW] ...`,
 *   badge:`...`,highlights:[{title:`...`,icon:<component>,
 *   items:[`...`,`...`,`...`]},{title:`...`,icon:<component>,items:[...]}]
 *
 * Returns { title, items } with at most 4 items (first group's items,
 * then the next group's when the first has fewer), or null when the
 * version's entry, its title, or any items cannot be found. Never
 * throws, never invents content — the caller falls back to the honest
 * "details in Version History after reload" note.
 */
export function extractServedHighlights(
  chunkText: string,
  version: string,
): ServedVersionHighlights | null {
  try {
    const marker = `version:\`${version}\``;
    const start = chunkText.indexOf(marker);
    if (start < 0) return null;
    // The entry ends where the next entry begins (`,version:`) — slicing
    // here bounds every search below to THIS version's entry, so an older
    // version's title/items can never leak in as the new version's.
    const nextEntry = chunkText.indexOf(',version:`', start + marker.length);
    const entry = nextEntry < 0 ? chunkText.slice(start) : chunkText.slice(start, nextEntry);

    const titleAt = entry.indexOf('title:`');
    if (titleAt < 0) return null;
    const title = readBacktickString(entry, titleAt + 'title:'.length);
    if (!title || !title.value) return null;

    const highlightsAt = entry.indexOf('highlights:[');
    if (highlightsAt < 0) return null;
    const items: string[] = [];
    let searchFrom = highlightsAt + 'highlights:['.length;
    while (items.length < 4) {
      const itemsAt = entry.indexOf('items:[', searchFrom);
      if (itemsAt < 0) break;
      const parsed = readItemsArray(entry, itemsAt + 'items:['.length);
      if (!parsed) return null;
      for (const item of parsed.items) {
        if (items.length < 4) items.push(item);
      }
      searchFrom = parsed.end;
    }
    if (items.length === 0) return null;
    return { title: title.value, items };
  } catch {
    return null;
  }
}

/**
 * Pure decision: should the update prompt (modal + toast) be shown?
 * - Manual checks always show their result.
 * - Auto checks show at most once per served deploy hash.
 * - With no served hash (cannot compare), auto never shows.
 */
export function shouldShowVersionUpdatePrompt(args: {
  isManual: boolean;
  servedHash: string | null;
  alreadyShownHash: string | null;
}): boolean {
  if (args.isManual) return true;
  if (!args.servedHash) return false;
  return args.alreadyShownHash !== args.servedHash;
}
