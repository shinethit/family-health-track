import { describe, it, expect, vi } from 'vitest';
import {
  SAVE_LATE_CONFIRM_MESSAGE,
  SAVE_TIMEOUT_MESSAGE,
  SAVE_UNCONFIRMED_MESSAGE,
  SaveTimeoutError,
  isSameBMIRecord,
  isSameBPRecord,
  isSameBroadcastTicker,
  isSameDoctorAdvice,
  isSameDoctorQuestion,
  isSameFamilyMember,
  isSameGlucoseRecord,
  isSameLabRecord,
  isSameMedication,
  isSamePatient,
  isSameVaccineRecord,
  isSaveTimeoutError,
  withSaveConfirmation,
  withSaveTimeout,
} from './saveConfirmation';

// v2.4.22 (Bug A, CORRECTED) — the write can land server-side while its
// ack is lost, so a timeout must FIRST check the list for the record
// (confirm by presence) instead of assuming the save failed. Fake timers
// keep these tests in milliseconds, not 15 real seconds.

describe('withSaveConfirmation', () => {
  it('(a) a write that settles returns it as written', async () => {
    vi.useFakeTimers();
    try {
      const result = await withSaveConfirmation(
        Promise.resolve('doc-1'),
        () => false,
        15000,
      );
      expect(result).toEqual({ outcome: 'written', value: 'doc-1' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('(b) a hanging write whose record appears in the list resolves as already-present', async () => {
    vi.useFakeTimers();
    try {
      // The listener delivers the server-landed record 5s in — the ack is
      // still lost, but the record IS there.
      let recordInList = false;
      setTimeout(() => {
        recordInList = true;
      }, 5000);
      const hanging = new Promise<string>(() => {});
      const resultPromise = withSaveConfirmation(
        hanging,
        () => recordInList,
        15000,
      );
      const assertion = expect(resultPromise).resolves.toEqual({
        outcome: 'already-present',
      });
      await vi.advanceTimersByTimeAsync(15000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('(c) a hanging write with no record in the list rejects as a timeout', async () => {
    vi.useFakeTimers();
    try {
      const hanging = new Promise<string>(() => {});
      const resultPromise = withSaveConfirmation(hanging, () => false, 15000);
      const assertion = expect(resultPromise).rejects.toBeInstanceOf(
        SaveTimeoutError,
      );
      await vi.advanceTimersByTimeAsync(15000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('the timeout error carries the honest "not saved yet" message', async () => {
    vi.useFakeTimers();
    try {
      const hanging = new Promise<string>(() => {});
      const resultPromise = withSaveConfirmation(hanging, () => false, 1000);
      const assertion = expect(resultPromise).rejects.toThrow(
        SAVE_TIMEOUT_MESSAGE,
      );
      await vi.advanceTimersByTimeAsync(1000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('a real rejection passes through unchanged (never masked as a timeout)', async () => {
    vi.useFakeTimers();
    try {
      const failing = Promise.reject(new Error('permission-denied'));
      await expect(
        withSaveConfirmation(failing, () => false, 15000),
      ).rejects.toThrow('permission-denied');
    } finally {
      vi.useRealTimers();
    }
  });

  it('a slow write that settles just before the timeout still counts as written', async () => {
    vi.useFakeTimers();
    try {
      let resolveWrite!: (v: string) => void;
      const slow = new Promise<string>((resolve) => {
        resolveWrite = resolve;
      });
      const resultPromise = withSaveConfirmation(slow, () => false, 15000);
      await vi.advanceTimersByTimeAsync(14000);
      resolveWrite('late-doc');
      await expect(resultPromise).resolves.toEqual({
        outcome: 'written',
        value: 'late-doc',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('withSaveTimeout (plain race for edits)', () => {
  it('resolves when the write settles in time', async () => {
    vi.useFakeTimers();
    try {
      await expect(
        withSaveTimeout(Promise.resolve('ok'), 15000),
      ).resolves.toBe('ok');
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects with the custom unconfirmed message on timeout', async () => {
    vi.useFakeTimers();
    try {
      const hanging = new Promise<string>(() => {});
      const resultPromise = withSaveTimeout(
        hanging,
        15000,
        SAVE_UNCONFIRMED_MESSAGE,
      );
      const assertion = expect(resultPromise).rejects.toThrow(
        SAVE_UNCONFIRMED_MESSAGE,
      );
      await vi.advanceTimersByTimeAsync(15000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('isSaveTimeoutError', () => {
  it('recognises a SaveTimeoutError instance and the name', () => {
    expect(isSaveTimeoutError(new SaveTimeoutError())).toBe(true);
    const err = new Error('x');
    err.name = 'SaveTimeoutError';
    expect(isSaveTimeoutError(err)).toBe(true);
  });

  it('rejects ordinary errors, strings and null', () => {
    expect(isSaveTimeoutError(new Error('permission-denied'))).toBe(false);
    expect(isSaveTimeoutError('slow')).toBe(false);
    expect(isSaveTimeoutError(null)).toBe(false);
  });
});

describe('presence matchers', () => {
  it('glucose: same user + value + type + minute matches; anything else does not', () => {
    const existing: any = {
      userId: 'u1',
      glucoseValue: 110,
      value: 110,
      timing: 'fasting',
      type: 'fasting',
      date: '2026-11-05T07:35',
    };
    const base: any = {
      userId: 'u1',
      glucoseValue: 110,
      timing: 'fasting',
      date: '2026-11-05T07:35',
    };
    expect(isSameGlucoseRecord(existing, base)).toBe(true);
    expect(isSameGlucoseRecord(existing, { ...base, glucoseValue: 111 })).toBe(false);
    expect(isSameGlucoseRecord(existing, { ...base, userId: 'u2' })).toBe(false);
    expect(isSameGlucoseRecord(existing, { ...base, timing: 'random' })).toBe(false);
    expect(isSameGlucoseRecord(existing, { ...base, date: '2026-11-05T07:36' })).toBe(false);
    // Same reading on another day is a different record.
    expect(isSameGlucoseRecord(existing, { ...base, date: '2026-11-06T07:35' })).toBe(false);
  });

  it('BP: same user + sys/dia + minute matches', () => {
    const existing: any = { userId: 'u1', systolic: 120, diastolic: 80, date: '2026-11-05T07:35' };
    expect(isSameBPRecord(existing, { ...existing })).toBe(true);
    expect(isSameBPRecord(existing, { ...existing, diastolic: 81 })).toBe(false);
    expect(isSameBPRecord(existing, { ...existing, date: '2026-11-05T08:35' })).toBe(false);
  });

  it('BMI: same user + weight + height + day matches', () => {
    const existing: any = { userId: 'u1', weightKg: 82.1, heightCm: 158, date: '2026-11-05' };
    expect(isSameBMIRecord(existing, { ...existing })).toBe(true);
    expect(isSameBMIRecord(existing, { ...existing, weightKg: 82.2 })).toBe(false);
    expect(isSameBMIRecord(existing, { ...existing, date: '2026-11-06' })).toBe(false);
  });

  it('lab: same user + lab name + day matches', () => {
    const existing: any = { userId: 'u1', labName: 'CBC', testDate: '2026-11-05' };
    expect(isSameLabRecord(existing, { ...existing })).toBe(true);
    expect(isSameLabRecord(existing, { ...existing, labName: 'LFT' })).toBe(false);
  });

  it('medication: same user + name + dosage + start day matches', () => {
    const existing: any = { userId: 'u1', name: 'Paracetamol', dosage: '500mg', startDate: '2026-11-05' };
    expect(isSameMedication(existing, { ...existing })).toBe(true);
    expect(isSameMedication(existing, { ...existing, dosage: '250mg' })).toBe(false);
  });

  it('vaccine: same user + name + dose + status matches', () => {
    const existing: any = { userId: 'u1', vaccineName: 'Flu', doseNumber: 1, status: 'completed' };
    expect(isSameVaccineRecord(existing, { ...existing })).toBe(true);
    expect(isSameVaccineRecord(existing, { ...existing, doseNumber: 2 })).toBe(false);
  });

  it('question: same user + title + category matches', () => {
    const existing: any = { userId: 'u1', title: 'သွေးပေါင်များနေတယ်', category: 'bp' };
    expect(isSameDoctorQuestion(existing, { ...existing })).toBe(true);
    expect(isSameDoctorQuestion(existing, { ...existing, title: 'အခြား' })).toBe(false);
  });

  it('advice: same user + text + day matches', () => {
    const existing: any = { userId: 'u1', advice: 'ဆားလျှော့စားပါ', date: '2026-11-05' };
    expect(isSameDoctorAdvice(existing, { ...existing })).toBe(true);
    expect(isSameDoctorAdvice(existing, { ...existing, advice: 'အခြား' })).toBe(false);
  });

  it('broadcast: same message matches', () => {
    expect(
      isSameBroadcastTicker({ message: 'သတိပေးချက်' } as any, { message: 'သတိပေးချက်' }),
    ).toBe(true);
    expect(
      isSameBroadcastTicker({ message: 'သတိပေးချက်' } as any, { message: 'အခြား' }),
    ).toBe(false);
  });

  it('family member: same name + relationship matches (list is already owner-scoped)', () => {
    const existing: any = { userId: 'owner1', name: 'မောင်မောင်', relationship: 'သား' };
    expect(isSameFamilyMember(existing, { ...existing })).toBe(true);
    expect(isSameFamilyMember(existing, { ...existing, relationship: 'သမီး' })).toBe(false);
  });

  it('(d) patient: a real email must match; a generated fallback email is ignored', () => {
    const existing: any = {
      displayName: 'ဒေါ်စန်းမြင့်',
      email: 'auntysan178@gmail.com',
      phone: '09123456789',
    };
    // Same person, same real email.
    expect(
      isSamePatient(existing, { displayName: 'ဒေါ်စန်းမြင့်', email: 'auntysan178@gmail.com' }),
    ).toBe(true);
    // Same name, different real email → a different person.
    expect(
      isSamePatient(existing, { displayName: 'ဒေါ်စန်းမြင့်', email: 'other@gmail.com' }),
    ).toBe(false);
    // A retry builds a DIFFERENT generated email — it must not block the
    // match: the phone still identifies the person.
    expect(
      isSamePatient(existing, {
        displayName: 'ဒေါ်စန်းမြင့်',
        email: 'pat-999999@familyhealth.local',
        phone: '09123456789',
      }),
    ).toBe(true);
    // Name only, nothing else entered → matches (weakest case).
    expect(isSamePatient(existing, { displayName: 'ဒေါ်စန်းမြင့်' })).toBe(true);
    // Different name never matches.
    expect(isSamePatient(existing, { displayName: 'ဦးမောင်' })).toBe(false);
  });
});

describe('late-confirmation wording', () => {
  it('says the save went through but the confirmation was slow', () => {
    expect(SAVE_LATE_CONFIRM_MESSAGE).toContain('သိမ်းဆည်းပြီးပါပြီ');
    expect(SAVE_LATE_CONFIRM_MESSAGE).toContain('နောက်ကျ');
  });
});
