import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { 
  Scale, 
  Ruler, 
  Calendar, 
  Activity, 
  Plus, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  HeartPulse,
  UserCheck,
  BarChart2,
  Table,
  Pencil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useToast } from '../../context/ToastContext';
import { BMIWeightChart } from '../charts/HealthCharts';
import {
  calculateAge,
  calculateBMI,
  calculateWaistRisk,
  ftInToCm,
  cmToFtIn,
  lbToKg,
  kgToLb,
  parseDateToMs,
  formatDateLabel
} from '../../lib/medicalCalculations';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

// Measurement date + time for display (D-M3): never substitute createdAt
// for a measurement date — a record with no date shows 'ရက်စွဲ မရှိပါ'.
// formatDateLabel is the hardcoded Myanmar date helper (no 'my-MM').
const recordDateTime = (record: { date?: string; timestamp?: string }): string => {
  const raw = record.date || record.timestamp || '';
  if (!raw) return 'ရက်စွဲ မရှိပါ';
  const d = formatDateLabel(raw);
  return d.time ? `${d.date} ${d.time}` : d.date;
};

// Local (Asia/Rangoon) date (YYYY-MM-DD) — new Date().toISOString() is UTC,
// so a record entered early in the morning got yesterday's date (v2.4.11 F4).
const localDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const BMIModule: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { bmiRecords, latestBMI, addBMIRecord, updateBMIRecord, deleteBMIRecord, selectedPatient, selectedFamilyMember, isPooledView, dataLoading } = useHealthData();
  const { showToast } = useToast();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  // v2.4.13 edit: id of the record being edited, null in add mode. The
  // same modal/form is reused, prefilled from the record.
  const [editingId, setEditingId] = useState<string | null>(null);
  // v2.4.16: delete confirm uses the app Modal, never window.confirm.
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isOpenEditProfile, setIsOpenEditProfile] = useState(false);

  // View state: 'both' | 'graph' | 'table'
  const [viewMode, setViewMode] = useState<'both' | 'graph' | 'table'>('both');
  // Timeframe state: 'all' | '1m' | '3m' | '6m'
  const [timeframe, setTimeframe] = useState<'all' | '1m' | '3m' | '6m'>('all');
  // History search + paging (latest 20 by default)
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Time boundaries for filtering
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();

  const sortedBMI = useMemo(() => {
    return [...bmiRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [bmiRecords]);

  const filteredBMI = useMemo(() => {
    return sortedBMI.filter(r => {
      const ms = parseDateToMs(r.date || r.timestamp || r.createdAt);
      if (timeframe === '1m') return ms >= oneMonthAgo;
      if (timeframe === '3m') return ms >= threeMonthsAgo;
      if (timeframe === '6m') return ms >= sixMonthsAgo;
      return true;
    });
  }, [sortedBMI, timeframe]);

  // Search the history list by date, notes — or by VALUE (B-M7):
  // searching "65" must find a 65 kg record, "22.5" a BMI of 22.5.
  const searchedBMI = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredBMI;
    return filteredBMI.filter((r) => {
      const hay = `${r.date || ''} ${r.timestamp || ''} ${r.notes || ''} ${r.weightKg} ${r.heightCm} ${r.bmi}`.toLowerCase();
      return hay.includes(q);
    });
  }, [filteredBMI, searchQuery]);

  // Newest first; show only the latest 20 unless expanded
  const displayBMI = showAllHistory ? [...searchedBMI].reverse() : [...searchedBMI].slice(-20).reverse();

  // Form states
  // Saved unit preference (v2.4.12) — read through a narrow cast; the
  // UserProfile type gains heightUnit/weightUnit in the same batch. 'm'
  // has no switch in this module, so it displays as cm (same metric family).
  const profileUnitPrefs = (profile ?? {}) as { heightUnit?: 'cm' | 'm' | 'ft'; weightUnit?: 'kg' | 'lb' };
  const prefHeightUnit: 'cm' | 'ft' = profileUnitPrefs.heightUnit === 'ft' ? 'ft' : 'cm';
  const prefWeightUnit: 'kg' | 'lb' = profileUnitPrefs.weightUnit === 'lb' ? 'lb' : 'kg';
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(prefHeightUnit);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(prefWeightUnit);

  const [heightCmInput, setHeightCmInput] = useState<string>(() => {
    if (!profile?.heightCm || profileUnitPrefs.heightUnit === 'ft') return '';
    return String(profile.heightCm);
  });
  const [heightFeetInput, setHeightFeetInput] = useState<string>(() => {
    if (!profile?.heightCm || profileUnitPrefs.heightUnit !== 'ft') return '';
    return String(cmToFtIn(profile.heightCm).feet);
  });
  const [heightInchesInput, setHeightInchesInput] = useState<string>(() => {
    if (!profile?.heightCm || profileUnitPrefs.heightUnit !== 'ft') return '';
    return String(cmToFtIn(profile.heightCm).inches);
  });

  const [weightKgInput, setWeightKgInput] = useState<string>(() => {
    if (!profile?.weightKg || profileUnitPrefs.weightUnit === 'lb') return '';
    return String(profile.weightKg);
  });
  const [weightLbInput, setWeightLbInput] = useState<string>(() => {
    if (!profile?.weightKg || profileUnitPrefs.weightUnit !== 'lb') return '';
    return String(kgToLb(profile.weightKg));
  });

  const [waistInput, setWaistInput] = useState<string>(() => profile?.waistCm ? String(profile.waistCm) : '');
  // Local (Asia/Rangoon) date — new Date().toISOString() is UTC, so a record
  // entered early in the morning got yesterday's date (v2.4.11 F4).
  const [recordDate, setRecordDate] = useState<string>(() => localDateStr(new Date()));
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit states (for Date of Birth & Age)
  const [editDob, setEditDob] = useState<string>(() => profile?.dateOfBirth || '');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>(() => profile?.gender || 'male');
  const [editBloodType, setEditBloodType] = useState<string>(() => profile?.bloodType || '');

  // Compute active user metrics
  // v2.4.14: the current-BMI card must read the latest BMI RECORD first
  // (same pattern as TrendsOverview) — a height/weight that lives only
  // in a record (added by the doctor, family or import) still counts.
  // The profile is only the fallback. Before this, the card said
  // 'မှတ်တမ်း မရှိသေးပါ' even when BMI records existed.
  // Family-member view: the age/DOB must come from THAT member (a
  // FamilyMember has an age but no dateOfBirth), never the owner's.
  const activeDOB = selectedFamilyMember ? undefined : (selectedPatient?.dateOfBirth || profile?.dateOfBirth);
  const activeAgeResult = calculateAge(activeDOB);
  const activeAgeYears = activeAgeResult ? activeAgeResult.years : (selectedPatient?.age || selectedFamilyMember?.age || profile?.age || null);

  // v2.4.19: a family member carries no height/weight on their record —
  // in member view the profile fallback must NOT borrow the signed-in
  // user's (owner's) measurements. The member's BMI comes from their own
  // BMI records only; otherwise the card would show the owner's BMI
  // under the member's name.
  const isMemberView = !!selectedFamilyMember;
  const profileHeight = isMemberView ? undefined : (selectedPatient?.heightCm || profile?.heightCm);
  const profileWeight = isMemberView ? undefined : (selectedPatient?.weightKg || profile?.weightKg);
  const profileWaist = isMemberView ? undefined : (selectedPatient?.waistCm || profile?.waistCm);
  const activeHeight = latestBMI?.heightCm || profileHeight || null;
  const activeWeight = latestBMI?.weightKg || profileWeight || null;
  const activeWaist = latestBMI?.waistCm || profileWaist || null;

  const currentBMIResult = (activeWeight && activeHeight) ? calculateBMI(activeWeight, activeHeight, activeAgeYears ?? undefined) : null;
  const waistRisk = activeWaist ? calculateWaistRisk(activeWaist, (selectedPatient?.gender || selectedFamilyMember?.gender || profile?.gender || 'male')) : null;

  // Live calculator inside Modal
  const resolvedHeightCm = heightUnit === 'cm' 
    ? Number(heightCmInput) || 0 
    : ftInToCm(Number(heightFeetInput) || 0, Number(heightInchesInput) || 0);

  const resolvedWeightKg = weightUnit === 'kg' 
    ? Number(weightKgInput) || 0 
    : lbToKg(Number(weightLbInput) || 0);

  const liveModalBMI = calculateBMI(resolvedWeightKg, resolvedHeightCm, activeAgeYears ?? undefined);

  // Switching units must NOT discard what the user already typed (v2.4.11
  // F10): convert the current value into the other unit's fields instead.
  // The refs remember a manual switch so the preference effect below never
  // overrides a unit the user already picked in this form.
  const userPickedHeightUnit = useRef(false);
  const userPickedWeightUnit = useRef(false);
  const switchHeightUnit = (unit: 'cm' | 'ft') => {
    if (unit === heightUnit) return;
    userPickedHeightUnit.current = true;
    if (unit === 'ft') {
      const cm = Number(heightCmInput);
      if (cm > 0) {
        const converted = cmToFtIn(cm);
        setHeightFeetInput(String(converted.feet));
        setHeightInchesInput(String(Math.round(converted.inches * 10) / 10));
      }
    } else {
      const cm = ftInToCm(Number(heightFeetInput) || 0, Number(heightInchesInput) || 0);
      if (cm > 0) setHeightCmInput(String(Math.round(cm * 10) / 10));
    }
    setHeightUnit(unit);
  };

  const switchWeightUnit = (unit: 'kg' | 'lb') => {
    if (unit === weightUnit) return;
    userPickedWeightUnit.current = true;
    if (unit === 'lb') {
      const kg = Number(weightKgInput);
      if (kg > 0) setWeightLbInput(String(Math.round(kgToLb(kg) * 10) / 10));
    } else {
      const lb = Number(weightLbInput);
      if (lb > 0) setWeightKgInput(String(Math.round(lbToKg(lb) * 10) / 10));
    }
    setWeightUnit(unit);
  };

  // Adopt the profile's saved unit preference once it loads (v2.4.12).
  // The useState initializers above run before the profile finishes
  // loading, so without this the switches would stay cm/kg even for a
  // user who saved ft/lb. Runs once; prefill only touches empty fields
  // so a value the user already typed is never overwritten.
  const prefApplied = useRef(false);
  useEffect(() => {
    if (prefApplied.current || !profile) return;
    prefApplied.current = true;
    if (!userPickedHeightUnit.current && prefHeightUnit !== heightUnit) {
      switchHeightUnit(prefHeightUnit);
    }
    if (!userPickedWeightUnit.current && prefWeightUnit !== weightUnit) {
      switchWeightUnit(prefWeightUnit);
    }
    const heightTouched = heightCmInput !== '' || heightFeetInput !== '' || heightInchesInput !== '';
    const weightTouched = weightKgInput !== '' || weightLbInput !== '';
    if (profile.heightCm && !heightTouched) {
      if (prefHeightUnit === 'ft') {
        const ft = cmToFtIn(profile.heightCm);
        setHeightFeetInput(String(ft.feet));
        setHeightInchesInput(String(ft.inches));
      } else {
        setHeightCmInput(String(profile.heightCm));
      }
    }
    if (profile.weightKg && !weightTouched) {
      if (prefWeightUnit === 'lb') setWeightLbInput(String(kgToLb(profile.weightKg)));
      else setWeightKgInput(String(profile.weightKg));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // v2.4.13 edit helpers — restore the form to fresh add-mode defaults
  // (the profile's values, in the current units) so a later Add never
  // shows the edited record's values.
  const resetBMIForm = () => {
    if (profile?.heightCm) {
      if (heightUnit === 'ft') {
        const ft = cmToFtIn(profile.heightCm);
        setHeightFeetInput(String(ft.feet));
        setHeightInchesInput(String(ft.inches));
      } else {
        setHeightCmInput(String(profile.heightCm));
      }
    } else {
      setHeightCmInput('');
      setHeightFeetInput('');
      setHeightInchesInput('');
    }
    if (profile?.weightKg) {
      if (weightUnit === 'lb') setWeightLbInput(String(kgToLb(profile.weightKg)));
      else setWeightKgInput(String(profile.weightKg));
    } else {
      setWeightKgInput('');
      setWeightLbInput('');
    }
    setWaistInput(profile?.waistCm ? String(profile.waistCm) : '');
    setRecordDate(localDateStr(new Date()));
    setNotes('');
  };

  // Open the form prefilled with an existing record for editing (height /
  // weight shown in the units currently selected in this form).
  const startEdit = (r: typeof bmiRecords[number]) => {
    setEditingId(r.id);
    if (heightUnit === 'ft') {
      const ft = cmToFtIn(r.heightCm);
      setHeightFeetInput(String(ft.feet));
      setHeightInchesInput(String(ft.inches));
      setHeightCmInput('');
    } else {
      setHeightCmInput(String(r.heightCm));
      setHeightFeetInput('');
      setHeightInchesInput('');
    }
    if (weightUnit === 'lb') {
      setWeightLbInput(String(kgToLb(r.weightKg)));
      setWeightKgInput('');
    } else {
      setWeightKgInput(String(r.weightKg));
      setWeightLbInput('');
    }
    setWaistInput(r.waistCm ? String(r.waistCm) : '');
    setRecordDate((r.date || '').slice(0, 10) || localDateStr(new Date()));
    setNotes(r.notes || '');
    setIsOpenAdd(true);
  };

  // Close the form. In edit mode the prefilled values are cleared back to
  // fresh add defaults so a later Add never inherits them.
  const closeForm = () => {
    if (editingId) {
      resetBMIForm();
      setEditingId(null);
    }
    setIsOpenAdd(false);
  };

  // Open the form in add mode (defensive: never carry an edit id in).
  const openAdd = () => {
    if (editingId) {
      resetBMIForm();
      setEditingId(null);
    }
    // v2.4.14: when a family member is selected, the form must NOT open
    // prefilled with the signed-in user's own height/weight (the form
    // defaults come from the profile). Prefill from THAT member's latest
    // record instead, or blank when they have none — otherwise the
    // owner's measurements could be saved under the member by mistake.
    if (selectedFamilyMember) {
      if (latestBMI) {
        if (heightUnit === 'ft') {
          const ft = cmToFtIn(latestBMI.heightCm);
          setHeightFeetInput(String(ft.feet));
          setHeightInchesInput(String(ft.inches));
          setHeightCmInput('');
        } else {
          setHeightCmInput(String(latestBMI.heightCm));
          setHeightFeetInput('');
          setHeightInchesInput('');
        }
        if (weightUnit === 'lb') {
          setWeightLbInput(String(kgToLb(latestBMI.weightKg)));
          setWeightKgInput('');
        } else {
          setWeightKgInput(String(latestBMI.weightKg));
          setWeightLbInput('');
        }
        setWaistInput(latestBMI.waistCm ? String(latestBMI.waistCm) : '');
      } else {
        setHeightCmInput('');
        setHeightFeetInput('');
        setHeightInchesInput('');
        setWeightKgInput('');
        setWeightLbInput('');
        setWaistInput('');
      }
    }
    setIsOpenAdd(true);
  };

  // Handle Save BMI Record
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    // Missing height/weight used to return silently with no message
    // (v2.4.11 F10) — tell the user instead.
    if (!resolvedHeightCm || !resolvedWeightKg) {
      showToast('အရပ်နှင့် ကိုယ်အလေးချိန် နှစ်ခုလုံး ထည့်ပေးပါ', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const calculated = calculateBMI(resolvedWeightKg, resolvedHeightCm, activeAgeYears ?? undefined);
      // No fabricated fallback: if BMI cannot be computed from the entered
      // height/weight, do not save a made-up 22 / 'normal' record.
      if (!calculated) {
        showToast('BMI တွက်ချက်၍ မရပါ — အရပ်နှင့် ကိုယ်အလေးချိန် မှန်ကန်စွာ ထည့်ပေးပါ', 'error');
        return;
      }
      if (editingId) {
        // v2.4.13 edit: BMI is recomputed here from the edited height /
        // weight with the same helper the add path uses (the context also
        // recomputes, but an explicitly passed valid BMI wins there).
        // The profile is deliberately NOT updated on edit: an old record's
        // corrected weight must not overwrite the user's current profile.
        await updateBMIRecord(editingId, {
          heightCm: resolvedHeightCm,
          weightKg: resolvedWeightKg,
          waistCm: waistInput ? Number(waistInput) : undefined,
          bmi: calculated.bmi,
          category: calculated.category,
          date: recordDate,
          notes: notes.trim() || undefined,
        });
        setIsOpenAdd(false);
        setEditingId(null);
        resetBMIForm();
        showToast('BMI မှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ', 'success');
        return;
      }
      await addBMIRecord({
        userId: selectedPatient ? selectedPatient.id : (profile?.id || 'guest-user'),
        // v2.4.14: file the record under the family member's own name when
        // one is selected (the context stamps userId from the target, but
        // a passed userName wins there — the owner's name used to land on
        // a member's record).
        userName: selectedFamilyMember ? selectedFamilyMember.name : (selectedPatient ? selectedPatient.displayName : (profile?.displayName || 'အသုံးပြုသူ')),
        heightCm: resolvedHeightCm,
        weightKg: resolvedWeightKg,
        waistCm: waistInput ? Number(waistInput) : undefined,
        bmi: calculated.bmi,
        category: calculated.category,
        date: recordDate,
        notes: notes.trim() || undefined,
      });

      // Also update the profile with latest height & weight — but ONLY when
      // the record is for the signed-in user themself. When a family member
      // is selected, writing their height/weight onto the user's own profile
      // would corrupt it (the BMI record itself is already filed under the
      // family member by addBMIRecord).
      // B-M1: the profile sync is a separate step with its own failure
      // path. If the RECORD saved but the profile sync fails, the user must
      // NOT see a failure toast (and retry into a duplicate) — the record
      // is saved, only the profile update failed, and that is said plainly.
      if (!selectedPatient && !selectedFamilyMember) {
        try {
          await updateProfile({
            heightCm: resolvedHeightCm,
            weightKg: resolvedWeightKg,
            waistCm: waistInput ? Number(waistInput) : undefined,
            bmi: calculated?.bmi,
          });
        } catch (profileErr) {
          console.warn('BMI record saved but profile sync failed:', profileErr);
          setIsOpenAdd(false);
          setNotes('');
          showToast('BMI မှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 'success');
          showToast('ပရိုဖိုင်းထဲ အရပ်/ကိုယ်အလေးချိန် မွမ်းမံခြင်း မအောင်မြင်ပါ — BMI မှတ်တမ်းကိုတော့ သိမ်းဆည်းပြီးပါပြီ', 'error');
          return;
        }
      }

      setIsOpenAdd(false);
      setNotes('');
      showToast('BMI မှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 'success');
    } catch (err) {
      // Save failed: keep the form open with all values intact so the user
      // can retry (v2.4.11 F3 — saves used to fail silently). In edit mode
      // the context already shows its own failure toast, so no second one.
      console.warn('Error saving BMI record:', err);
      if (!editingId) {
        showToast('BMI မှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Profile / DOB update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = calculateAge(editDob);
    await updateProfile({
      dateOfBirth: editDob,
      age: calculated ? calculated.years : undefined,
      gender: editGender,
      bloodType: editBloodType,
    });
    setIsOpenEditProfile(false);
  };

  // While the first Firestore snapshot is still loading, show a loading
  // state instead of empty charts / "no records" messages.
  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin" aria-label="ဒေတာ ရယူနေပါသည်" />
        <p className="text-sm text-slate-500">ဒေတာ ရယူနေပါသည်...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                BMI နှင့် ခန္ဓာကိုယ် ဖွဲ့စည်းမှု တွက်ချက်ခြင်း (Body Mass Index & Age)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedPatient
                  ? `အသုံးပြုသူ ${selectedPatient.displayName} ၏ BMI မှတ်တမ်းများ`
                  : selectedFamilyMember
                    ? `အသုံးပြုသူ ${selectedFamilyMember.name} ၏ BMI မှတ်တမ်းများ`
                    : 'အရပ်အမောင်း၊ ကိုယ်အလေးချိန်၊ မွေးသက္ကရာဇ်မှ အသက်တွက်ချက်မှုနှင့် ကျန်းမာသော ကိုယ်အလေးချိန် အညွှန်းကိန်းများ'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOpenEditProfile(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            မွေးသက္ကရာဇ် / အသက် ပြင်ဆင်မည်
          </button>

          <button
            onClick={openAdd}
            className="btn-teal px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            BMI မှတ်တမ်းအသစ် ထည့်မည်
          </button>
        </div>
      </div>

      {/* Primary Vitals Cards: Age & BMI Current Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Age & Date of Birth */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-500" />
              တွက်ချက်ထားသော အသက် (Age)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
              အလိုအလျောက်
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeAgeYears !== null ? activeAgeYears : '--'}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {activeAgeYears !== null ? 'နှစ် (Years)' : 'နှစ်'}
              </span>
            </div>

            {activeAgeResult ? (
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-1">
                တိကျသောအသက်: {activeAgeResult.formattedMm}
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400 mt-1">
                မွေးသက္ကရာဇ် ထည့်သွင်းတွက်ချက်ပါ
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>မွေးသက္ကရာဇ်:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeDOB || 'မထည့်သွင်းရသေးပါ'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Current BMI */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-500" />
              ခန္ဓာကိုယ်အညွှန်း (BMI)
            </span>
            {currentBMIResult && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentBMIResult.bgColor} ${currentBMIResult.color} ${currentBMIResult.borderColor}`}>
                {currentBMIResult.labelMm}
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {currentBMIResult ? currentBMIResult.bmi : '--'}
              </span>
              <span className="text-xs font-semibold text-slate-400">kg/m²</span>
            </div>

            <p className={`text-xs font-bold mt-1 ${currentBMIResult?.color || 'text-slate-500'}`}>
              {currentBMIResult ? currentBMIResult.labelMm : 'မှတ်တမ်း မရှိသေးပါ'}
            </p>

            {/* v2.4.19: a profile-derived BMI is labelled as such — never
                presented as a measurement. The date line below only shows
                when a real record exists, so no fake date is ever shown. */}
            {currentBMIResult && !latestBMI && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Profile အရ တွက်ချက်ထားသည်
              </p>
            )}

            {/* D-H5: a "Latest" value with no date and no owner cannot be
                trusted — show when it was measured and whose it is. */}
            {latestBMI && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                {recordDateTime(latestBMI)}
                {isPooledView && latestBMI.userName ? ` • ${latestBMI.userName}` : isPooledView && latestBMI.patientName ? ` • ${latestBMI.patientName}` : ''}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>စံသတ်မှတ်ချက်:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                အာရှပစိဖိတ် (Asian Criteria)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Height & Weight */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-sky-500" />
              အရပ် နှင့် ကိုယ်အလေးချိန်
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">အရပ်အမောင်း:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeHeight ? `${activeHeight} cm (${cmToFtIn(activeHeight).feet}' ${cmToFtIn(activeHeight).inches}")` : 'မထည့်ရသေးပါ'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">ကိုယ်အလေးချိန်:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeWeight ? `${activeWeight} kg (${kgToLb(activeWeight)} lb)` : 'မထည့်ရသေးပါ'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>ခါးအတိုင်းအတာ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeWaist ? `${activeWaist} cm` : 'မတိုင်းရသေးပါ'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Ideal Weight & Water Recommendation */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:to-cyan-950/40 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              သင့်တော်သော ပစ်မှတ်
            </span>
          </div>

          <div className="mt-2.5 space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                သင့်အရပ်အတွက် သင့်တော်သော ကိုယ်အလေးချိန်:
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {currentBMIResult ? `${currentBMIResult.idealWeightRangeKg.min} kg ~ ${currentBMIResult.idealWeightRangeKg.max} kg` : '--'}
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200/40 dark:border-emerald-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-500" />
                တစ်နေ့ သောက်သင့်သော ရေပမာဏ:
              </span>
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                {currentBMIResult ? `${currentBMIResult.dailyWaterRequirementLiters} လီတာ (ခွက် ၈-၉ ခွက်)` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual BMI Gauge & Spectrum Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          အာရှ-ပစိဖိတ် BMI စံသတ်မှတ်ချက် တိုင်းတာပြကွက် (Asian BMI Classification Spectrum)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          အာရှလူမျိုးများတွင် ခန္ဓာကိုယ်အဆီဓာတ် ပိုမိုလွယ်ကူစွာ စုစည်းတတ်သဖြင့် WHO Asian Standard အရ BMI ၂၃ နှင့်အထက်တွင် ကျန်းမာရေးစောင့်ရှောက်မှု စတင်ရန် သတ်မှတ်ထားပါသည်
        </p>

        {/* Visual Multi-Color Bar */}
        <div className="relative pt-6 pb-2">
          {/* Current Marker Pin */}
          {currentBMIResult && (
            <div 
              className="absolute -top-1 transition-all duration-500 flex flex-col items-center -translate-x-1/2 z-10"
              style={{
                // Map BMI 15 -> 35 to percentage 0% -> 100%
                left: `${Math.min(Math.max(((currentBMIResult.bmi - 15) / (35 - 15)) * 100, 2), 98)}%`
              }}
            >
              <div className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold shadow-md whitespace-nowrap">
                သင့် BMI: {currentBMIResult.bmi}
              </div>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-white" />
            </div>
          )}

          {/* Color Segments */}
          <div className="h-4 rounded-full overflow-hidden flex shadow-inner">
            {/* Underweight: < 18.5 */}
            <div className="w-[17.5%] bg-blue-400" title="< 18.5: ပိန်လွန်းသည်" />
            {/* Normal: 18.5 - 22.9 */}
            <div className="w-[22%] bg-emerald-500" title="18.5 - 22.9: ပုံမှန်" />
            {/* Overweight: 23.0 - 24.9 */}
            <div className="w-[10%] bg-amber-400" title="23.0 - 24.9: အနည်းငယ်ပို" />
            {/* Obese 1: 25.0 - 29.9 */}
            <div className="w-[25%] bg-orange-500" title="25.0 - 29.9: အဝလွန် အဆင့် ၁" />
            {/* Obese 2: >= 30.0 */}
            <div className="w-[25.5%] bg-rose-500" title=">= 30.0: အဝလွန် အဆင့် ၂" />
          </div>

          {/* Labels underneath */}
          <div className="grid grid-cols-5 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 gap-1">
            <div>
              <span className="font-bold text-blue-600 dark:text-blue-400 block">&lt; 18.5</span>
              <span>ပိန်လွန်း</span>
            </div>
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">18.5 - 22.9</span>
              <span>ပုံမှန်</span>
            </div>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 block">23 - 24.9</span>
              <span>အနည်းငယ်ပို</span>
            </div>
            <div>
              <span className="font-bold text-orange-600 dark:text-orange-400 block">25 - 29.9</span>
              <span>အဝလွန် (၁)</span>
            </div>
            <div>
              <span className="font-bold text-rose-600 dark:text-rose-400 block">≥ 30</span>
              <span>အဝလွန် (၂)</span>
            </div>
          </div>
        </div>

        {/* Current Assessment & Medical Advice */}
        {currentBMIResult && (
          <div className={`mt-5 p-4 rounded-2xl border text-xs ${currentBMIResult.bgColor} ${currentBMIResult.borderColor}`}>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${currentBMIResult.color}`} />
              <div className="space-y-1">
                <span className={`font-bold ${currentBMIResult.color}`}>
                  {currentBMIResult.labelMm} (အန္တရာယ်အဆင့် သုံးသပ်ချက်)
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentBMIResult.riskMm}
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                  💡 <strong>အကြံပြုချက်:</strong> {currentBMIResult.adviceMm}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waist Risk Callout */}
        {waistRisk && (
          <div className={`mt-3 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            waistRisk.status === 'high_risk' 
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block">{waistRisk.labelMm}</span>
              <span>{waistRisk.adviceMm}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: View Switcher (Graph vs Table vs Both) + Timeframe Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ကိုယ်အလေးချိန် & BMI သမိုင်းမှတ်တမ်း ပြသမှု (BMI History Views)
            </h3>
            <p className="text-[11px] text-slate-500">
              Graph မျဉ်းကွေးဖြင့် ဖြစ်စေ၊ Data ဇယားဖြင့် ဖြစ်စေ ကာလအလိုက် စောင့်ကြည့်နိုင်ပါသည်
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
              <span>📊 Graph & Data</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>📈 Graph View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-teal-600" />
              <span>📋 Data ဇယား</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              အားလုံး
            </button>
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '1m'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၁ လ
            </button>
            <button
              onClick={() => setTimeframe('3m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '3m'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၃ လ
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '6m'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၆ လ
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH VIEW: BMI & Weight Trend Curve */}
      {(viewMode === 'both' || viewMode === 'graph') && (
        <div>
          <BMIWeightChart records={filteredBMI} />
        </div>
      )}

      {/* DATA TABLE VIEW */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ကိုယ်အလေးချိန် နှင့် BMI မှတ်တမ်းများ (BMI History Log)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                အချိန်နှင့်အမျှ ကိုယ်အလေးချိန် အတက်အကျနှင့် ကျန်းမာရေး တိုးတက်မှု အခြေအနေ ({timeframe === 'all' ? 'အားလုံး' : timeframe === '1m' ? '၁ လစာ' : timeframe === '3m' ? '၃ လစာ' : '၆ လစာ'})
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              စုစုပေါင်း: {searchedBMI.length} ခု
            </span>
          </div>

          {/* History search */}
          <div className="px-6 pt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ရှာဖွေမည် — ရက်စွဲ (သို့) မှတ်ချက်"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          {searchedBMI.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery.trim() ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော BMI မှတ်တမ်း မရှိပါ' : 'ရွေးချယ်ထားသော ကာလအတွင်း BMI မှတ်တမ်း မရှိပါ'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                သင်၏ အရပ်နှင့် ကိုယ်အလေးချိန်ကို နေ့စဉ် သို့မဟုတ် အပတ်စဉ် မှတ်သားခြင်းဖြင့် သွေးတိုးနှင့် ဆီးချိုရောဂါ ကာကွယ်မှု တိုးတက်စေနိုင်ပါသည်
              </p>
              <button
                onClick={openAdd}
                className="btn-teal mt-4 px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ပထမဆုံး BMI မှတ်တမ်း ထည့်သွင်းမည်
              </button>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">ရက်စွဲ</th>
                    {isPooledView && <th className="py-3 px-4 font-semibold">ပိုင်ရှင်</th>}
                    <th className="py-3 px-4 font-semibold">အရပ် (Height)</th>
                    <th className="py-3 px-4 font-semibold">ကိုယ်အလေးချိန် (Weight)</th>
                    <th className="py-3 px-4 font-semibold">BMI တန်ဖိုး</th>
                    <th className="py-3 px-4 font-semibold">အဆင့်ခွဲခြားချက်</th>
                    <th className="py-3 px-4 font-semibold">ခါးအတိုင်းအတာ</th>
                    <th className="py-3 px-4 font-semibold">မှတ်ချက်</th>
                    <th className="py-3 px-4 font-semibold text-right">လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayBMI.map((r) => {
                    const evalB = calculateBMI(r.weightKg, r.heightCm);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          {recordDateTime(r)}
                        </td>
                        {isPooledView && (
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {r.userName || r.patientName || '—'}
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {r.heightCm} cm
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {r.weightKg} kg <span className="font-normal text-slate-400 text-[11px]">({kgToLb(r.weightKg)} lb)</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {r.bmi}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {evalB ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                              {evalB.labelMm}
                            </span>
                          ) : (
                            r.category
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {r.waistCm ? `${r.waistCm} cm` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                          {r.notes || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => startEdit(r)}
                            className="p-2 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                            title="ပြင်ဆင်မည်"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(r.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="ဖျက်မည်"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {searchedBMI.length > 20 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {showAllHistory ? 'အနည်းငယ်သာ ပြမည်' : `အားလုံး ကြည့်မည် (${searchedBMI.length} ခု)`}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Modal 1: Add BMI Record */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingId ? 'BMI မှတ်တမ်း ပြင်ဆင်မည်' : 'BMI နှင့် ကိုယ်အလေးချိန် မှတ်တမ်းအသစ်'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile?.displayName)} အတွက်
                  </span>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="mt-4 space-y-4">
              {/* Height input with unit switch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-teal-600" />
                    အရပ်အမောင်း (Height)
                  </label>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => switchHeightUnit('cm')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      cm (စင်တီ)
                    </button>
                    <button
                      type="button"
                      onClick={() => switchHeightUnit('ft')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      ft / in (ပေ/လက်မ)
                    </button>
                  </div>
                </div>

                {heightUnit === 'cm' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={heightCmInput}
                      onChange={(e) => setHeightCmInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 168"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="7"
                        required
                        value={heightFeetInput}
                        onChange={(e) => setHeightFeetInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        placeholder="ပေ"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">feet (ပေ)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        required
                        value={heightInchesInput}
                        onChange={(e) => setHeightInchesInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        placeholder="လက်မ"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">inches (လက်မ)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight input with unit switch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    ကိုယ်အလေးချိန် (Weight)
                  </label>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => switchWeightUnit('kg')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      kg (ကီလို)
                    </button>
                    <button
                      type="button"
                      onClick={() => switchWeightUnit('lb')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'lb' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      lb (ပေါင်)
                    </button>
                  </div>
                </div>

                {weightUnit === 'kg' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required
                      value={weightKgInput}
                      onChange={(e) => setWeightKgInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 65"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={weightLbInput}
                      onChange={(e) => setWeightLbInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 143"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">lb (ပေါင်)</span>
                  </div>
                )}
              </div>

              {/* Waist & Date in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ခါးအတိုင်းအတာ (Waist - cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    placeholder="e.g. 82 cm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ရက်စွဲ (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Live BMI Calculation Box */}
              {liveModalBMI && (
                <div className={`p-4 rounded-2xl border text-xs ${liveModalBMI.bgColor} ${liveModalBMI.borderColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      တွက်ချက်ရရှိသော BMI:
                    </span>
                    <span className={`text-base font-extrabold ${liveModalBMI.color}`}>
                      {liveModalBMI.bmi} kg/m²
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    အဆင့်: {liveModalBMI.labelMm}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    သင့်တော်သော ကိုယ်အလေးချိန်: {liveModalBMI.idealWeightRangeKg.min} kg ~ {liveModalBMI.idealWeightRangeKg.max} kg
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  မှတ်ချက် (Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  placeholder="e.g. နံနက်စာမစားမီ ချိန်တွယ်ခြင်း"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-teal px-5 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : editingId ? 'ပြင်ဆင်မှုကို သိမ်းဆည်းမည်' : 'မှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Profile / Date of Birth / Age */}
      {isOpenEditProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    မွေးသက္ကရာဇ် နှင့် အသက် ပြင်ဆင်ခြင်း
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    အသက်ကို မွေးနေ့မှ အလိုအလျောက် တိကျစွာ တွက်ချက်ပေးပါသည်
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpenEditProfile(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  မွေးသက္ကရာဇ် (Date of Birth)
                </label>
                <input
                  type="date"
                  required
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Calculated preview */}
              {editDob && (
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
                  <span className="font-semibold text-teal-800 dark:text-teal-300 block">
                    တွက်ချက်ရရှိသော အသက်:
                  </span>
                  <div className="text-lg font-extrabold text-teal-900 dark:text-teal-200 mt-0.5">
                    {calculateAge(editDob)?.formattedMm || 'မွေးနေ့မှားယွင်းနေပါသည်'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ကျား/မ (Gender)
                  </label>
                  <select
                    value={editGender}
                    onChange={(e: any) => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="male">အမျိုးသား (Male)</option>
                    <option value="female">အမျိုးသမီး (Female)</option>
                    <option value="other">အခြား (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    သွေးအုပ်စု (Blood Type)
                  </label>
                  <select
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenEditProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="btn-teal px-5 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  အချက်အလက် အတည်ပြုမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirmation (v2.4.16) */}
      <Modal isOpen={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)} title="မှတ်တမ်း ဖျက်မည်" size="sm">
        <p className="text-sm text-slate-700 leading-relaxed">ဤ BMI မှတ်တမ်းကို ဖျက်မှာ သေချာပါသလား? ဖျက်လိုက်ရင် ပြန်မရတော့ပါ။</p>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setDeleteTargetId(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">မဖျက်သေးပါ</button>
          <button onClick={() => { const id = deleteTargetId; setDeleteTargetId(null); if (id) deleteBMIRecord(id); }} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm cursor-pointer">ဖျက်မည်</button>
        </div>
      </Modal>
    </div>
  );
};
