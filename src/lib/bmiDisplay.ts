import { calculateBMI } from './medicalCalculations';
import type { BMIRecord } from '../types/health';

export type BMIDisplaySource = 'record' | 'profile';

export interface ResolvedBMIDisplay {
  /** The BMI evaluation to show (value, category, label, colours). */
  eval: Exclude<ReturnType<typeof calculateBMI>, null>;
  /** Where the numbers came from — a real measurement record, or the person's profile. */
  source: BMIDisplaySource;
  /** The measurement record, when the value comes from one (null when profile-derived). */
  record: BMIRecord | null;
}

/**
 * Resolve which BMI to display for one person (v2.4.19).
 *
 * A real BMI record ALWAYS wins. Only when the person has no BMI record
 * do we fall back to their PROFILE height/weight — and the caller must
 * label that case honestly ("Profile အရ တွက်ချက်ထားသည်") and must never
 * show a measurement date for it: a profile is not a measurement.
 *
 * `profileWeightKg` / `profileHeightCm` must be THE VIEWED PERSON's
 * profile values (the selected patient, or the signed-in user's own
 * profile). A family member carries no height/weight on their record —
 * pass undefined for a member view so the owner's profile is never
 * borrowed for someone else.
 */
export function resolveBMIDisplay(args: {
  record: BMIRecord | null;
  profileWeightKg?: number | null;
  profileHeightCm?: number | null;
  /** The viewed person's age (paediatric guard); the record's own ageYears wins when present. */
  age?: number | null;
}): ResolvedBMIDisplay | null {
  if (args.record?.weightKg && args.record?.heightCm) {
    const fromRecord = calculateBMI(
      args.record.weightKg,
      args.record.heightCm,
      args.record.ageYears ?? args.age ?? undefined,
    );
    if (fromRecord) return { eval: fromRecord, source: 'record', record: args.record };
  }
  if (args.profileWeightKg && args.profileHeightCm) {
    const fromProfile = calculateBMI(
      args.profileWeightKg,
      args.profileHeightCm,
      args.age ?? undefined,
    );
    if (fromProfile) return { eval: fromProfile, source: 'profile', record: null };
  }
  return null;
}
