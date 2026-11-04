// Version-update prompt guard (v2.4.16).
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
// sessionStorage (survives remounts; a new tab gets its own prompt, which
// is correct because that tab may not have seen it yet). A MANUAL check
// ("စနစ်ဗားရှင်း စစ်ဆေးမည်") always shows its result, even if the auto
// prompt was already shown once for this deploy. When a still-newer deploy
// arrives (different served hash), the prompt shows once again for it.

export const VERSION_UPDATE_PROMPT_SHOWN_KEY =
  'fht_version_update_prompt_shown_for';

/** Served bundle hash (if any) for which the prompt was already shown in this tab. */
export function readShownVersionUpdateHash(): string | null {
  try {
    return sessionStorage.getItem(VERSION_UPDATE_PROMPT_SHOWN_KEY);
  } catch {
    // sessionStorage unavailable (e.g. some private modes) — treat as
    // "never shown". The prompt may repeat there, but it never crashes.
    return null;
  }
}

/** Remember that the prompt was shown for this served bundle hash. */
export function markVersionUpdatePromptShown(servedHash: string): void {
  try {
    sessionStorage.setItem(VERSION_UPDATE_PROMPT_SHOWN_KEY, servedHash);
  } catch {
    // Ignore — the prompt simply may repeat in this rare environment.
  }
}

/**
 * Forget that the prompt was shown (v2.4.16, H-H2). Called right before
 * the user reloads from the update modal: if the reload serves the STALE
 * bundle again (slow edge / service worker), the next auto check must be
 * allowed to prompt again instead of staying silent forever for that
 * deploy. A successful reload loads the new bundle, so the hashes match
 * and no prompt appears anyway.
 */
export function clearVersionUpdatePromptShown(): void {
  try {
    sessionStorage.removeItem(VERSION_UPDATE_PROMPT_SHOWN_KEY);
  } catch {
    // Ignore — the prompt simply may repeat in this rare environment.
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
