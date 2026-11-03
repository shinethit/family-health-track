// Per-user localStorage keys (v2.4.11, audit privacy leak).
//
// Phone-only data (dental/eye/hearing records, physio progress, special-care
// checklist, bookmarked articles, notifications/reminders) used to live
// under device-global keys (fht_*, physio_completed_<date>,
// special_care_checklist, bookmarked_articles), so on a shared phone the
// next user who logged in saw the previous user's data. Since v2.4.11 every
// such key is suffixed with the owner's uid: `<base>_<uid>`.
//
// Legacy un-suffixed keys still exist on devices that used the app before
// this fix. They carry no owner info, so the first signed-in user to open
// the module after the update adopts them once (migrateLegacyKey) — that is
// the only honest option, and after migration the legacy key is gone, so a
// later user on the same phone can never see them.
//
// Dependency-free: plain localStorage + try/catch only.
const LEGACY_DATE_KEY = /^physio_completed_\d{4}-\d{2}-\d{2}$/;
const SUFFIXED_DATE_KEY = /^physio_completed_\d{4}-\d{2}-\d{2}_(.+)$/;

// Bases of phone-only keys. `health_family_members` is the one-time local
// cache HealthDataContext migrates into Firestore; `family_health_profile`
// is deliberately NOT here — it is the cached auth profile, exported
// separately as the top-level `profile`, never as localData.
export const KNOWN_LOCAL_BASES = [
  'fht_dental_records',
  'fht_selected_teeth',
  'fht_eye_prescriptions',
  'fht_hearing_records',
  'special_care_checklist',
  'bookmarked_articles',
  'health_family_members',
  'family_health_notifications',
  'family_health_custom_reminders',
  'family_health_reminders_fired',
] as const;

/** Per-user key for a base, e.g. `fht_dental_records_<uid>`. No uid → legacy key. */
export const userKey = (base: string, uid?: string | null): string =>
  uid ? `${base}_${uid}` : base;

/** Read the per-user value first, falling back to the legacy un-suffixed key. */
export const readUserStored = (base: string, uid?: string | null): string | null => {
  try {
    if (uid) {
      const mine = localStorage.getItem(userKey(base, uid));
      if (mine !== null) return mine;
    }
    return localStorage.getItem(base);
  } catch {
    return null;
  }
};

/** True when a value exists under the per-user key or the legacy key. */
export const hasUserStored = (base: string, uid?: string | null): boolean =>
  readUserStored(base, uid) !== null;

/**
 * Move a legacy un-suffixed key's value to the current user's suffixed key,
 * ONCE. Only moves when the suffixed key does not exist yet; the legacy key
 * is always removed afterwards so a later user never sees it. No-op when
 * there is no uid or no legacy value.
 */
export const migrateLegacyKey = (base: string, uid?: string | null): void => {
  if (!uid) return;
  try {
    const legacy = localStorage.getItem(base);
    if (legacy === null) return;
    const suffixed = userKey(base, uid);
    if (localStorage.getItem(suffixed) === null) {
      localStorage.setItem(suffixed, legacy);
    }
    localStorage.removeItem(base);
  } catch {
    // Storage unavailable — the legacy key stays; nothing is lost.
  }
};

/**
 * Move every legacy key matching `pattern` (e.g. dated physio keys
 * `physio_completed_YYYY-MM-DD`) to the current user's suffixed keys.
 * Used where the key itself contains a variable part (a date), so a single
 * base name cannot be migrated.
 */
export const migrateLegacyKeysMatching = (pattern: RegExp, uid?: string | null): void => {
  if (!uid) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && pattern.test(k)) keys.push(k);
    }
    keys.forEach((k) => migrateLegacyKey(k, uid));
  } catch {
    // Storage unavailable — nothing is lost.
  }
};

/** The uid a suffixed key belongs to, or null for a legacy (un-suffixed) key. */
export const localKeyOwnerUid = (key: string): string | null => {
  for (const base of KNOWN_LOCAL_BASES) {
    if (key.startsWith(`${base}_`)) return key.slice(base.length + 1);
  }
  const dated = SUFFIXED_DATE_KEY.exec(key);
  if (dated) return dated[1];
  return null;
};

/** True for a legacy un-suffixed phone-only key (no owner uid in the name). */
export const isLegacyLocalKey = (key: string): boolean => {
  if ((KNOWN_LOCAL_BASES as readonly string[]).includes(key)) return true;
  return LEGACY_DATE_KEY.test(key);
};

/**
 * True when `key` belongs to `uid`: either it is suffixed with that uid, or
 * it is a legacy key (legacy keys belong to the current user after the
 * on-load migration; before migration they are the only copy in existence).
 * Another user's suffixed key returns false.
 */
export const isOwnLocalKey = (key: string, uid?: string | null): boolean => {
  const owner = localKeyOwnerUid(key);
  if (owner !== null) return uid != null && owner === uid;
  return isLegacyLocalKey(key);
};
