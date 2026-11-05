// Per-user localStorage-backed state (v2.4.23, Team 1 #27).
//
// Guide-module interactive state used to vanish on every tab switch:
// App renders one module at a time, so switching tabs unmounts the module
// and all useState-only state resets (milestone ticks, fever triage,
// checklists, quiz/ABCDE answers, fall-risk answers, the lab interpreter
// result, the water tracker). This hook persists the state under a
// per-user key (same userKey scheme as Pregnancy's kick logs), so a later
// user on a shared phone never sees it. Legacy un-suffixed keys are
// adopted once, exactly like the other phone-only keys.
//
// The pure helpers are exported for unit tests (the hook itself needs a
// React renderer to test, which this project does not have).
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { userKey, readUserStored, migrateLegacyKey } from './perUserStorage';

/** Read a persisted JSON value, or the fallback when absent/corrupt. */
export function loadPersistedValue<T>(base: string, uid: string | null | undefined, fallback: T): T {
  try {
    const raw = readUserStored(base, uid || null);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a value as JSON under the per-user key. Never throws. */
export function savePersistedValue<T>(base: string, uid: string | null | undefined, value: T): void {
  try {
    localStorage.setItem(userKey(base, uid || null), JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, ...) — state just won't survive
    // a reload. Never crash the screen for it.
  }
}

/**
 * useState whose value survives tab switches and reloads, scoped to one
 * user. The initial value is used when nothing is stored yet. When the
 * uid arrives late (profile loads after mount), the stored value is
 * re-read once — the same migrate-then-reload pattern Pregnancy uses.
 */
export function usePersistentState<T>(
  base: string,
  uid: string | null | undefined,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const initialRef = useRef(initial);
  const [value, setValue] = useState<T>(() => loadPersistedValue(base, uid, initialRef.current));
  const uidRef = useRef(uid);
  useEffect(() => {
    migrateLegacyKey(base, uid || null);
    if (uid && uid !== uidRef.current) {
      uidRef.current = uid;
      setValue(loadPersistedValue(base, uid, initialRef.current));
    }
  }, [base, uid]);
  useEffect(() => {
    savePersistedValue(base, uid, value);
  }, [base, uid, value]);
  return [value, setValue];
}
