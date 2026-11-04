import { describe, it, expect } from 'vitest';
import { resolveBMIDisplay } from './bmiDisplay';
import type { BMIRecord } from '../types/health';

const record = (overrides: Partial<BMIRecord> = {}): BMIRecord => ({
  id: 'bmi-1',
  userId: 'u1',
  weightKg: 80,
  heightCm: 165,
  bmi: 29.4,
  category: 'obese1',
  date: '2026-11-01',
  ...overrides,
});

describe('resolveBMIDisplay', () => {
  it('a real record always wins over the profile', () => {
    const r = resolveBMIDisplay({
      record: record({ weightKg: 80, heightCm: 165, bmi: 29.4 }),
      profileWeightKg: 60,
      profileHeightCm: 165,
      age: 64,
    });
    expect(r).not.toBeNull();
    expect(r!.source).toBe('record');
    expect(r!.record).not.toBeNull();
    expect(r!.eval.bmi).toBe(29.4);
  });

  it('falls back to the profile when there is no record', () => {
    const r = resolveBMIDisplay({
      record: null,
      profileWeightKg: 70,
      profileHeightCm: 165,
      age: 64,
    });
    expect(r).not.toBeNull();
    expect(r!.source).toBe('profile');
    expect(r!.record).toBeNull();
    expect(r!.eval.bmi).toBe(25.7);
    expect(r!.eval.category).toBe('obese1');
  });

  it('returns null when there is neither a record nor profile values', () => {
    expect(resolveBMIDisplay({ record: null })).toBeNull();
    expect(
      resolveBMIDisplay({ record: null, profileWeightKg: 70, profileHeightCm: null }),
    ).toBeNull();
    expect(
      resolveBMIDisplay({ record: null, profileWeightKg: null, profileHeightCm: 165 }),
    ).toBeNull();
  });

  it('falls through to the profile when the record has no usable values', () => {
    const r = resolveBMIDisplay({
      record: record({ weightKg: 0, heightCm: 0, bmi: 0 }),
      profileWeightKg: 70,
      profileHeightCm: 165,
      age: 64,
    });
    expect(r).not.toBeNull();
    expect(r!.source).toBe('profile');
  });

  it('applies the paediatric guard from the age for both sources', () => {
    const fromRecord = resolveBMIDisplay({
      record: record({ weightKg: 40, heightCm: 150 }),
      profileWeightKg: 70,
      profileHeightCm: 165,
      age: 10,
    });
    expect(fromRecord!.eval.isPediatric).toBe(true);
    const fromProfile = resolveBMIDisplay({
      record: null,
      profileWeightKg: 40,
      profileHeightCm: 150,
      age: 10,
    });
    expect(fromProfile!.eval.isPediatric).toBe(true);
  });

  it('the record’s own ageYears wins over the passed age', () => {
    const r = resolveBMIDisplay({
      record: record({ weightKg: 40, heightCm: 150, ageYears: 10 }),
      profileWeightKg: 70,
      profileHeightCm: 165,
      age: 64,
    });
    expect(r!.eval.isPediatric).toBe(true);
  });
});
