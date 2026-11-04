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
