// v2.4.22 (Bug A, CORRECTED) — a Firestore write can land server-side
// while its acknowledgement never comes back. The user proved it: after a
// glucose save hung on "သိမ်းဆည်းနေသည်..." they pressed Cancel — and the
// record WAS in the list. The list is fed by the live onSnapshot listener
// (HealthDataContext subscribeMerged), which delivers the server-landed doc
// independently of the addDoc promise; the local prependUnique only runs
// AFTER addDoc resolves, so it could not have put the record there. The old
// "slow internet stopped the write" diagnosis was wrong: the data was saved,
// only the UI was stuck waiting forever for a "done" reply that got lost.
//
// So the fix is "confirm by presence", not "timeout and say not saved":
//   - withSaveConfirmation races the write against a 15s timer. On timeout
//     it FIRST checks the listener-fed local list for a matching record.
//     Found → the save went through (confirmation was just slow): the call
//     succeeds, the modal closes, the success toast says so. Not found → it
//     rejects with SaveTimeoutError: the form stays open with every value
//     intact and the user can retry.
//   - On RETRY the caller MUST re-check first (opts.isRetry in the context
//     add functions; module-side pre-check where the call crosses a prop
//     boundary): if the matching record is already in the list, the first
//     attempt landed — report success WITHOUT writing a second copy.
//   - An edit (setDoc merge on the same doc id) is idempotent, so a retry
//     can never duplicate it — but its presence can NOT be confirmed from
//     the list either, because the optimistic update already put the edited
//     values there. Edits therefore use the plain withSaveTimeout and, on
//     timeout, say honestly that the save could NOT be confirmed (never
//     "not saved" — that claim needs the presence check to prove absence).
//   - The underlying write is never cancelled (Firestore offers no cancel)
//     and callers must NEVER auto-retry: a retry after a timeout is a manual
//     user action, guarded by the presence check above.

import type {
  BMIRecord,
  BloodPressureRecord,
  BloodSugarRecord,
  BroadcastTicker,
  DoctorAdvice,
  DoctorQuestion,
  FamilyMember,
  LabTestRecord,
  Medication,
  UserProfile,
  VaccinationRecord,
} from '../types/health';

export const SAVE_CONFIRM_TIMEOUT_MS = 15000;

// Shown only when the presence check proved the record is NOT in the list
// (as far as the app can see) — the values are kept, the user retries.
export const SAVE_TIMEOUT_MESSAGE =
  'အင်တာနက် နှေးနေလို့ မသိမ်းရသေးပါ — တန်ဖိုး မပျောက်ပါ၊ ပြန်ကြိုးစားနိုင်ပါတယ်';

// Shown when a save (usually an edit) timed out and its outcome could NOT
// be confirmed either way — never claims "not saved".
export const SAVE_UNCONFIRMED_MESSAGE =
  'အင်တာနက် နှေးနေလို့ အတည်ပြုချက် မရသေးပါ — တန်ဖိုး မပျောက်ပါ၊ မှတ်တမ်းစာရင်းမှာ ပေါ်နေရင် သိမ်းပြီးသား ဖြစ်ပါတယ်';

// Success toast when the record was found in the list after the ack was
// lost — the save went through, only the confirmation was slow.
export const SAVE_LATE_CONFIRM_MESSAGE =
  'သိမ်းဆည်းပြီးပါပြီ — အင်တာနက် နှေးနေလို့ အတည်ပြုချက် နောက်ကျသွားပါတယ်';

export class SaveTimeoutError extends Error {
  constructor(message: string = SAVE_TIMEOUT_MESSAGE) {
    super(message);
    this.name = 'SaveTimeoutError';
  }
}

export function isSaveTimeoutError(err: unknown): boolean {
  return (
    err instanceof SaveTimeoutError ||
    (typeof err === 'object' &&
      err !== null &&
      (err as { name?: unknown }).name === 'SaveTimeoutError')
  );
}

/** What an add function reports: was the write confirmed normally, or did
 *  the record turn out to be already present (first attempt landed, ack
 *  lost)? Callers show the late-confirmation success toast when true. */
export interface SaveResult {
  confirmedLate: boolean;
}

/** Options for context add functions. isRetry MUST be true when the user is
 *  pressing save again after a previous attempt timed out — the function
 *  then checks the list first and never writes a second copy. */
export interface SaveOptions {
  isRetry?: boolean;
}

export type SavePresenceCheck = () => boolean;

export type SaveConfirmationOutcome<T> =
  | { outcome: 'written'; value: T }
  | { outcome: 'already-present' };

/**
 * Race a Firestore write against a timer. If the write settles first its
 * value is returned as 'written'. If the timer fires first, the presence
 * check runs: a matching record in the listener-fed list means the write
 * landed and only the ack was lost → 'already-present' (success, no second
 * write). Otherwise it rejects with SaveTimeoutError.
 */
export async function withSaveConfirmation<T>(
  writePromise: Promise<T>,
  isAlreadySaved: SavePresenceCheck,
  ms: number = SAVE_CONFIRM_TIMEOUT_MS,
): Promise<SaveConfirmationOutcome<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new SaveTimeoutError());
    }, ms);
  });
  try {
    const value = await Promise.race([writePromise, timeout]);
    return { outcome: 'written', value };
  } catch (err) {
    if (isSaveTimeoutError(err)) {
      if (isAlreadySaved()) return { outcome: 'already-present' };
      throw err;
    }
    throw err;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Plain race for writes whose outcome cannot be confirmed from the list
 * (edits — the optimistic update already put the values there — and
 * best-effort refreshes). On timeout it rejects with SaveTimeoutError
 * carrying `message` (default: the "not saved yet" text; pass
 * SAVE_UNCONFIRMED_MESSAGE when the outcome genuinely cannot be known).
 */
export function withSaveTimeout<T>(
  promise: Promise<T>,
  ms: number = SAVE_CONFIRM_TIMEOUT_MS,
  message: string = SAVE_TIMEOUT_MESSAGE,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new SaveTimeoutError(message));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

// ---------------------------------------------------------------------------
// Presence matchers — "is this list record the one we just tried to save?"
// The list is the live listener's copy, so a match proves the write landed
// server-side. Dates compare to the minute (datetime-local values) or the
// day (date-only values); numeric values compare as numbers so '110' and
// 110 match. Each matcher is deliberately narrow: a different user, value,
// type or date must NOT match.
// ---------------------------------------------------------------------------

const sameMinute = (a?: string, b?: string): boolean =>
  !!a && !!b && String(a).slice(0, 16) === String(b).slice(0, 16);

const sameDay = (a?: string, b?: string): boolean =>
  !!a && !!b && String(a).slice(0, 10) === String(b).slice(0, 10);

const sameText = (a?: string, b?: string): boolean =>
  (a || '').trim() === (b || '').trim();

const glucoseValueOf = (r: Partial<BloodSugarRecord>): number =>
  Number(r.glucoseValue ?? r.value);

export function isSameGlucoseRecord(
  existing: BloodSugarRecord,
  candidate: Partial<BloodSugarRecord>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    Number.isFinite(glucoseValueOf(candidate)) &&
    glucoseValueOf(existing) === glucoseValueOf(candidate) &&
    (existing.timing || existing.type) === (candidate.timing || candidate.type) &&
    sameMinute(existing.date, candidate.date)
  );
}

export function isSameBPRecord(
  existing: BloodPressureRecord,
  candidate: Partial<BloodPressureRecord>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    Number(existing.systolic) === Number(candidate.systolic) &&
    Number(existing.diastolic) === Number(candidate.diastolic) &&
    sameMinute(existing.date, candidate.date)
  );
}

export function isSameBMIRecord(
  existing: BMIRecord,
  candidate: Partial<BMIRecord>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    Number(existing.weightKg) === Number(candidate.weightKg) &&
    Number(existing.heightCm) === Number(candidate.heightCm) &&
    sameDay(existing.date, candidate.date)
  );
}

export function isSameLabRecord(
  existing: LabTestRecord,
  candidate: Partial<LabTestRecord>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    sameText(existing.labName, candidate.labName) &&
    sameDay(existing.testDate, candidate.testDate)
  );
}

export function isSameMedication(
  existing: Medication,
  candidate: Partial<Medication>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    sameText(existing.name, candidate.name) &&
    sameText(existing.dosage, candidate.dosage) &&
    sameDay(existing.startDate, candidate.startDate)
  );
}

export function isSameVaccineRecord(
  existing: VaccinationRecord,
  candidate: Partial<VaccinationRecord>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    sameText(existing.vaccineName, candidate.vaccineName) &&
    Number(existing.doseNumber || 1) === Number(candidate.doseNumber || 1) &&
    (existing.status || '') === (candidate.status || '')
  );
}

export function isSameDoctorQuestion(
  existing: DoctorQuestion,
  candidate: Partial<DoctorQuestion>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    sameText(existing.title, candidate.title) &&
    (existing.category || '') === (candidate.category || '')
  );
}

export function isSameDoctorAdvice(
  existing: DoctorAdvice,
  candidate: Partial<DoctorAdvice>,
): boolean {
  return (
    existing.userId === candidate.userId &&
    sameText(existing.advice, candidate.advice) &&
    sameDay(existing.date, candidate.date)
  );
}

export function isSameBroadcastTicker(
  existing: BroadcastTicker,
  candidate: { message: string },
): boolean {
  return sameText(existing.message, candidate.message);
}

export function isSameFamilyMember(
  existing: FamilyMember,
  candidate: Partial<FamilyMember>,
): boolean {
  // No userId on FamilyMember: the listener list is already scoped to
  // the signed-in user's family, so name + relationship is the match.
  return (
    sameText(existing.name, candidate.name) &&
    sameText(existing.relationship, candidate.relationship)
  );
}

const isGeneratedEmail = (email: string): boolean =>
  email.toLowerCase().endsWith('@familyhealth.local');

export function isSamePatient(
  existing: UserProfile,
  candidate: Partial<UserProfile>,
): boolean {
  if (!sameText(existing.displayName, candidate.displayName)) return false;
  const candidateEmail = (candidate.email || '').trim().toLowerCase();
  // A real email is a strong identity — it must match. The generated
  // '<id>@familyhealth.local' fallback is unique per attempt, so it must
  // NEVER be compared: a retry builds a different one.
  if (candidateEmail && !isGeneratedEmail(candidateEmail)) {
    return (existing.email || '').trim().toLowerCase() === candidateEmail;
  }
  const candidatePhone = (candidate.phone || '').trim();
  if (candidatePhone) return (existing.phone || '').trim() === candidatePhone;
  if (candidate.dateOfBirth && existing.dateOfBirth) {
    return existing.dateOfBirth === candidate.dateOfBirth;
  }
  if (typeof candidate.age === 'number' && typeof existing.age === 'number') {
    return existing.age === candidate.age;
  }
  // Name only — the weakest match, used only when nothing else was entered.
  return true;
}
