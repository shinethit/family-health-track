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
 *
 * v2.4.25: generalised to any marker key — the reload-attempt marker
 * (below) uses the same storage, so it survives the same way.
 */
type MarkerStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function storageFor(probeKey: string): MarkerStorage | null {
  try {
    if (typeof localStorage !== 'undefined') {
      // Probe it: merely existing is not enough in locked-down modes.
      localStorage.getItem(probeKey);
      return localStorage;
    }
  } catch {
    // Fall through to the sessionStorage fallback below.
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.getItem(probeKey);
      return sessionStorage;
    }
  } catch {
    // Neither storage works — behave as "never shown", never crash.
  }
  return null;
}

function promptStorage(): MarkerStorage | null {
  return storageFor(VERSION_UPDATE_PROMPT_SHOWN_KEY);
}

/** Storage for the reload-attempt marker (v2.4.25, same rules as above). */
function attemptStorage(): MarkerStorage | null {
  return storageFor(VERSION_UPDATE_RELOAD_ATTEMPT_KEY);
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
    // The entry ends where the next entry begins (`},{version:`) — slicing
    // here bounds every search below to THIS version's entry, so an older
    // version's title/items can never leak in as the new version's.
    // v2.4.25: the separator is `},{version:` — the earlier `,version:`
    // never matched the real minified output, so the slice ran to the end
    // of the chunk and a short entry (< 4 items) silently pulled in the
    // NEXT entry's bullets. Caught by the v2.4.25 entry (3 items).
    const nextEntry = chunkText.indexOf('},{version:`', start + marker.length);
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
 * - v2.4.25: auto shows ONE more time for a served hash when the user
 *   already tapped "ပြန်ဖွင့်မည်" for it but the reload still served the
 *   old bundle (the reload-attempt marker). The caller CONSUMES the
 *   marker when it shows the prompt, so this can never repeat on every
 *   focus event (the v2.4.16 5-times bug) — at most one extra prompt
 *   per failed reload attempt.
 */
export function shouldShowVersionUpdatePrompt(args: {
  isManual: boolean;
  servedHash: string | null;
  alreadyShownHash: string | null;
  /** Hash for which the user already tapped reload once (v2.4.25). */
  reloadAttemptedHash?: string | null;
}): boolean {
  if (args.isManual) return true;
  if (!args.servedHash) return false;
  if (args.alreadyShownHash !== args.servedHash) return true;
  return args.reloadAttemptedHash === args.servedHash;
}

// ---------------------------------------------------------------------------
// v2.4.25 — reload-attempt marker: the "one more prompt after a failed
// reload" half of the fix. The modal records the served hash when the
// user taps "ပြန်ဖွင့်မည်"; App consumes the marker when it re-shows
// the prompt for that hash, and clears it when the loaded bundle is
// up-to-date again. Storage rules are the same as the prompt marker.
// ---------------------------------------------------------------------------

/** Served bundle hash for which the user already tapped reload once. */
export const VERSION_UPDATE_RELOAD_ATTEMPT_KEY =
  'fht_version_update_reload_attempted_for';

/** Served bundle hash of the last reload attempt, if any. */
export function readReloadAttemptedHash(): string | null {
  try {
    const v = attemptStorage()?.getItem(VERSION_UPDATE_RELOAD_ATTEMPT_KEY) ?? null;
    return v ? v : null;
  } catch {
    return null;
  }
}

/** Remember that the user tapped reload for this served bundle hash. */
export function markVersionUpdateReloadAttempted(servedHash: string): void {
  try {
    attemptStorage()?.setItem(VERSION_UPDATE_RELOAD_ATTEMPT_KEY, servedHash);
  } catch {
    // Ignore — the prompt simply will not re-show in this rare environment.
  }
}

/** Consume/clear the reload-attempt marker (prompt re-shown, or up-to-date). */
export function clearVersionUpdateReloadAttempted(): void {
  try {
    const s = attemptStorage();
    if (!s) return;
    try {
      s.removeItem(VERSION_UPDATE_RELOAD_ATTEMPT_KEY);
    } catch {
      s.setItem(VERSION_UPDATE_RELOAD_ATTEMPT_KEY, '');
    }
  } catch {
    // Ignore.
  }
}

// ---------------------------------------------------------------------------
// v2.4.25 — reloadForUpdate(): ONE tap on "ပြန်ဖွင့်မည်" must actually
// land the new version.
//
// Root cause: the modal did a plain window.location.reload(). The app is
// an installed PWA (registerType 'autoUpdate'); when the modal appears
// the new deploy exists on the SERVER, but the service worker has NOT
// yet downloaded/installed the new SW + precache. A plain reload asks
// the OLD service worker for the page, and the old SW serves the OLD
// precached bundle — the user stays on the old version. Only after the
// SW's background update check downloads the new SW does a LATER reload
// land the new version (the reported "tap the header arrow and update
// again" behaviour).
//
// Fix: force the update check NOW (registration.update()), then wait for
// the new worker to activate (the generated autoUpdate SW calls
// skipWaiting() + clientsClaim() itself — verified in dist/sw.js — so
// activation fires `controllerchange` on this page), and only THEN
// reload. Any failure or timeout falls back to a plain reload, so the
// user is never hung and never stranded; the reload-attempt marker lets
// the modal re-appear once if that reload still serves the old bundle.
// ---------------------------------------------------------------------------

/** Canonical updater captured from registerSW() in main.tsx. */
let registeredSwUpdater: ((reloadPage?: boolean) => Promise<void>) | null = null;

/**
 * Register the updateSW function returned by registerSW() (vite-plugin-pwa)
 * so reloadForUpdate() can use the canonical path when available.
 * NOTE (verified against the installed vite-plugin-pwa 1.3.0 client
 * source): in autoUpdate mode updateSW() only awaits registration — it
 * sends no skipWaiting and reloads nothing. It is kept for
 * forward-compat; the manual registration.update() path below is what
 * actually lands the update.
 */
export function setServiceWorkerUpdater(
  fn: ((reloadPage?: boolean) => Promise<void>) | null,
): void {
  registeredSwUpdater = fn;
}

export type ReloadForUpdateStage = 'checking' | 'activating';
export type ReloadForUpdateResult = 'sw-updated' | 'plain-reload';

export interface ReloadForUpdateOptions {
  /** Total budget for the SW update + activation wait (default 20000ms). */
  timeoutMs?: number;
  /** Progress callback so the modal can show honest in-flight text. */
  onProgress?: (stage: ReloadForUpdateStage) => void;
  /** Injectable for tests (default: navigator.serviceWorker.getRegistration). */
  getRegistration?: () => Promise<ServiceWorkerRegistration | undefined | null>;
  /** Injectable SW container (default: navigator.serviceWorker). */
  serviceWorkerContainer?: {
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  } | null;
  /** Injectable canonical updater (default: the one registered from main.tsx). */
  swUpdater?: ((reloadPage?: boolean) => Promise<void>) | null;
  /** Injectable reload (default: window.location.reload). */
  doReload?: () => void;
}

function promiseWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('reloadForUpdate: timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * Wait for the new service worker to take control (controllerchange).
 * Belt-and-braces: if a worker is already waiting, tell it to skip
 * waiting (the generated autoUpdate SW self-skips, but an older cached
 * SW might not). Resolves true on activation, false on timeout.
 */
function waitForServiceWorkerActivation(
  reg: ServiceWorkerRegistration,
  container: ReloadForUpdateOptions['serviceWorkerContainer'],
  timeoutMs: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let poller: ReturnType<typeof setInterval> | undefined;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      if (poller !== undefined) clearInterval(poller);
      try {
        container?.removeEventListener('controllerchange', onControllerChange);
      } catch {
        // Ignore.
      }
      resolve(value);
    };
    const onControllerChange = () => finish(true);
    try {
      container?.addEventListener('controllerchange', onControllerChange);
    } catch {
      // Ignore — the poller + timeout below still apply.
    }
    poller = setInterval(() => {
      try {
        const waiting = reg.waiting;
        if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
      } catch {
        // Ignore.
      }
    }, 250);
    timer = setTimeout(() => finish(false), Math.max(0, timeoutMs));
  });
}

/**
 * Reload for an update: force the service worker to fetch the new
 * deploy now, wait for it to activate, then reload — so ONE tap lands
 * the new version. Always reloads (directly or via the fallback);
 * never throws; never hangs past `timeoutMs`.
 */
export async function reloadForUpdate(
  options: ReloadForUpdateOptions = {},
): Promise<ReloadForUpdateResult> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const startedAt = Date.now();
  const remainingMs = () => Math.max(0, timeoutMs - (Date.now() - startedAt));
  const doReload = options.doReload ?? (() => {
    window.location.reload();
  });
  const swContainer =
    options.serviceWorkerContainer !== undefined
      ? options.serviceWorkerContainer
      : typeof navigator !== 'undefined'
        ? navigator.serviceWorker
        : undefined;
  const swUpdater =
    options.swUpdater !== undefined ? options.swUpdater : registeredSwUpdater;
  try {
    // Canonical vite-plugin-pwa path first (a no-op in autoUpdate mode —
    // see setServiceWorkerUpdater — but harmless and forward-compatible).
    if (swUpdater) {
      try {
        await promiseWithTimeout(swUpdater(false), Math.min(5000, remainingMs()));
      } catch {
        // Fall through to the manual path below.
      }
    }
    const getRegistration =
      options.getRegistration ??
      (async () => {
        try {
          if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
            return undefined;
          }
          return await navigator.serviceWorker.getRegistration();
        } catch {
          return undefined;
        }
      });
    const reg = await getRegistration();
    if (!reg) {
      doReload();
      return 'plain-reload';
    }
    options.onProgress?.('checking');
    // Force the update check NOW. Without this, the old worker keeps
    // serving the old precache and a plain reload lands the old version.
    await promiseWithTimeout(reg.update(), remainingMs());
    options.onProgress?.('activating');
    const activated = await waitForServiceWorkerActivation(
      reg,
      swContainer ?? null,
      remainingMs(),
    );
    doReload();
    return activated ? 'sw-updated' : 'plain-reload';
  } catch {
    // Never hang, never strand the user: any failure reloads anyway.
    // The re-prompt guard (reload-attempt marker) lets the modal appear
    // once more if this reload still serves the old bundle.
    doReload();
    return 'plain-reload';
  }
}
