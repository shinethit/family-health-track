import React, { useEffect, useRef, useState } from 'react';
import { User, Check, Calendar, Ruler, Scale, AlertCircle, AtSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { UserProfile } from '../../types/health';
import { ftInToCm, cmToFtIn, lbToKg, kgToLb } from '../../lib/medicalCalculations';
import {
  SAVE_CONFIRM_TIMEOUT_MS,
  SAVE_UNCONFIRMED_MESSAGE,
  withSaveTimeout,
} from '../../lib/saveConfirmation';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Called when the user actually saves (not on skip / X / backdrop).
  // App uses it to stop reminding: a saved profile needs no more prompts.
  onSaved?: () => void;
}

const CHRONIC_CONDITIONS = ['သွေးတိုး', 'ဆီးချို', 'အသည်းအဆီဖုံး', 'နှလုံး', 'ကျောက်ကပ်', 'ယူရစ်အက်စစ်'];

// v2.4.12 — height/weight unit preference + username live on the profile.
// The UserProfile type gains those fields in the same batch (AuthContext
// work); read/write them through this narrow cast so this file compiles
// either way. Canonical storage stays heightCm / weightKg.
type HeightUnit = 'cm' | 'm' | 'ft';
type WeightUnit = 'kg' | 'lb';
type ProfileUnitPrefs = { heightUnit?: HeightUnit; weightUnit?: WeightUnit; username?: string };
const profilePrefs = (p: UserProfile | null | undefined): ProfileUnitPrefs =>
  (p ?? {}) as ProfileUnitPrefs;

// Username rules: lowercase letters / numbers / _ / . , 3-20 chars.
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, onSaved }) => {
  const auth = useAuth();
  const { updateProfile, profile, setUsername, restoreUsername, clearUsername } = auth;
  // Tracks which profile the form was prefilled from, so a profile that
  // finishes loading AFTER the modal opened still prefills it (v2.4.16,
  // A-L10) — the old effect ran only when isOpen changed, so a slow profile
  // left the form blank and a save could wipe stored values.
  const prefilledProfileId = useRef<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsernameInput] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'' | 'male' | 'female' | 'other'>('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [heightCmInput, setHeightCmInput] = useState<number | string>('');
  const [heightMInput, setHeightMInput] = useState<number | string>('');
  const [heightFeetInput, setHeightFeetInput] = useState<number | string>('');
  const [heightInchesInput, setHeightInchesInput] = useState<number | string>('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weightKgInput, setWeightKgInput] = useState<number | string>('');
  const [weightLbInput, setWeightLbInput] = useState<number | string>('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from the current profile every time the modal opens, so the
  // same modal works both for first-time setup and for later editing.
  // Height/weight show in the user's saved unit (v2.4.12); the stored
  // canonical values are heightCm / weightKg.
  useEffect(() => {
    if (!isOpen) {
      prefilledProfileId.current = null;
      return;
    }
    if (!profile) return;
    // Only prefill once per profile — re-running on every profile change
    // would wipe the user's in-progress edits after a save.
    if (prefilledProfileId.current === profile.id) return;
    prefilledProfileId.current = profile.id;
    const prefs = profilePrefs(profile);
    setDisplayName(profile?.displayName || '');
    setUsernameInput(prefs.username || '');
    setDob(profile?.dateOfBirth || '');
    setGender(profile?.gender || '');
    const hUnit: HeightUnit = prefs.heightUnit ?? 'cm';
    setHeightUnit(hUnit);
    const hCm = profile?.heightCm;
    setHeightCmInput(hUnit === 'cm' ? (hCm ?? '') : '');
    setHeightMInput(hUnit === 'm' && hCm ? String(Math.round((hCm / 100) * 100) / 100) : '');
    if (hUnit === 'ft' && hCm) {
      const ft = cmToFtIn(hCm);
      setHeightFeetInput(String(ft.feet));
      setHeightInchesInput(String(ft.inches));
    } else {
      setHeightFeetInput('');
      setHeightInchesInput('');
    }
    const wUnit: WeightUnit = prefs.weightUnit ?? 'kg';
    setWeightUnit(wUnit);
    const wKg = profile?.weightKg;
    setWeightKgInput(wUnit === 'kg' ? (wKg ?? '') : '');
    setWeightLbInput(wUnit === 'lb' && wKg ? String(kgToLb(wKg)) : '');
    setChronicConditions(profile?.chronicConditions || []);
    setError(null);
    setSuccess(false);
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(chronicConditions.filter(c => c !== cond));
    } else {
      setChronicConditions([...chronicConditions, cond]);
    }
  };

  // Canonical values for saving: height in cm, weight in kg.
  // Math (shared with BMIModule via lib/medicalCalculations):
  //   m -> cm: m x 100 | ft-in -> cm: (ft x 12 + in) x 2.54 | lb -> kg: lb x 0.45359237

  // True when the user deliberately emptied the height / weight inputs
  // (v2.4.16, A-L2) — distinct from an invalid value, which resolves to 0
  // but must NOT clear the stored measurement.
  const heightInputsEmpty = (): boolean =>
    heightUnit === 'cm'
      ? heightCmInput === ''
      : heightUnit === 'm'
        ? heightMInput === ''
        : heightFeetInput === '' && heightInchesInput === '';
  const weightInputsEmpty = (): boolean =>
    weightUnit === 'kg' ? weightKgInput === '' : weightLbInput === '';
  const resolveHeightCm = (): number => {
    if (heightUnit === 'cm') return Number(heightCmInput) || 0;
    if (heightUnit === 'm') return Math.round((Number(heightMInput) || 0) * 100 * 10) / 10;
    return ftInToCm(Number(heightFeetInput) || 0, Number(heightInchesInput) || 0);
  };
  const resolveWeightKg = (): number =>
    weightUnit === 'kg' ? Number(weightKgInput) || 0 : lbToKg(Number(weightLbInput) || 0);

  // Switching units converts the entered value — never discards it.
  const switchHeightUnit = (unit: HeightUnit) => {
    if (unit === heightUnit) return;
    const cm = resolveHeightCm();
    if (cm > 0) {
      if (unit === 'cm') setHeightCmInput(String(Math.round(cm * 10) / 10));
      if (unit === 'm') setHeightMInput(String(Math.round((cm / 100) * 100) / 100));
      if (unit === 'ft') {
        const ft = cmToFtIn(cm);
        setHeightFeetInput(String(ft.feet));
        setHeightInchesInput(String(ft.inches));
      }
    }
    setHeightUnit(unit);
  };
  const switchWeightUnit = (unit: WeightUnit) => {
    if (unit === weightUnit) return;
    if (unit === 'lb') {
      const kg = Number(weightKgInput);
      if (kg > 0) setWeightLbInput(String(kgToLb(kg)));
    } else {
      const lb = Number(weightLbInput);
      if (lb > 0) setWeightKgInput(String(lbToKg(lb)));
    }
    setWeightUnit(unit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!displayName.trim()) {
      setError('ကျေးဇူးပြု၍ အမည် ဖြည့်သွင်းပါ');
      return;
    }

    const newUsername = username.trim().toLowerCase();
    const currentUsername = profilePrefs(profile).username || '';
    const usernameChanged = !!newUsername && newUsername !== currentUsername;
    // v2.4.16 (A-L3): the username box was emptied — the name is being removed.
    const usernameCleared = !newUsername && !!currentUsername;
    if (usernameChanged && !USERNAME_RE.test(newUsername)) {
      setError('အသုံးပြုသူအမည် (username) သည် အင်္ဂလိပ်အက္ခရာအသေး၊ ဂဏန်း၊ _ သို့မဟုတ် . သာ ပါရပြီး ၃ လုံးမှ ၂၀ လုံးအထိ ဖြစ်ရပါမည်');
      return;
    }

    // v2.4.16 (A-M8): range validation — a typo must not store a 300 cm
    // height, a 5 kg adult weight, or a birth date in the future.
    if (dob) {
      const dobDate = new Date(`${dob}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(dobDate.getTime()) || dobDate.getTime() > today.getTime()) {
        setError('မွေးနေ့သည် အနာဂတ် ရက်စွဲ ဖြစ်နေပါသည်။ မှန်ကန်သော မွေးနေ့ ထည့်ပါ');
        return;
      }
    }
    const heightCm = resolveHeightCm();
    const weightKg = resolveWeightKg();
    if (heightCm > 0 && (heightCm < 50 || heightCm > 250)) {
      setError('အရပ် (cm) သည် ၅၀ မှ ၂၅၀ အတွင်း ဖြစ်ရပါမည်။ မှန်ကန်ကြောင်း စစ်ဆေးပါ');
      return;
    }
    if (weightKg > 0 && (weightKg < 2 || weightKg > 300)) {
      setError('ကိုယ်အလေးချိန် (kg) သည် ၂ မှ ၃၀၀ အတွင်း ဖြစ်ရပါမည်။ မှန်ကန်ကြောင်း စစ်ဆေးပါ');
      return;
    }

    // Only include fields the user actually entered — an empty field keeps
    // whatever value the profile already had, EXCEPT a field the user
    // deliberately emptied after a value was stored (v2.4.16, A-L2):
    // passing explicit undefined clears it (see updateProfile).
    const data: Partial<UserProfile> = { displayName: displayName.trim() };
    if (dob) data.dateOfBirth = dob;
    if (gender) data.gender = gender;
    if (heightCm > 0) data.heightCm = Math.round(heightCm * 10) / 10;
    else if (profile?.heightCm != null && heightInputsEmpty()) data.heightCm = undefined;
    if (weightKg > 0) data.weightKg = Math.round(weightKg * 10) / 10;
    else if (profile?.weightKg != null && weightInputsEmpty()) data.weightKg = undefined;
    // v2.4.16 (A-L4): keep conditions that are NOT among the 6 toggles —
    // they were added elsewhere (e.g. Emergency ID) and this form must not
    // silently drop them. Only the 6 toggles come from this form's state.
    const customConditions = (profile?.chronicConditions || []).filter(c => !CHRONIC_CONDITIONS.includes(c));
    const toggledConditions = chronicConditions.filter(c => CHRONIC_CONDITIONS.includes(c));
    data.chronicConditions = [...customConditions, ...toggledConditions];
    // Save the unit preference so every form shows the user's units next time.
    const prefsToSave = { heightUnit, weightUnit } as Partial<UserProfile>;

    setLoading(true);
    try {
      // Username first: a taken name must stop the save and keep the modal
      // open with the error shown inline — never silently swallowed.
      if (usernameChanged && setUsername) {
        await setUsername(newUsername);
      }
      if (usernameCleared && clearUsername) {
        await clearUsername();
      }
      try {
        // v2.4.22 (Bug A): a stalled profile write must not hang this
        // modal forever. The merge is idempotent, so a retry is safe;
        // on timeout the outcome cannot be confirmed, so say so honestly
        // (the outer catch shows err.message inline).
        await withSaveTimeout(
          updateProfile({ ...data, ...prefsToSave }),
          SAVE_CONFIRM_TIMEOUT_MS,
          SAVE_UNCONFIRMED_MESSAGE,
        );
      } catch (e) {
        // v2.4.16 (A-M5): the profile save failed AFTER the username was
        // reserved — roll the reservation back so the two never diverge.
        if (usernameChanged && restoreUsername) {
          await restoreUsername(currentUsername, newUsername);
        }
        throw e;
      }
      setSuccess(true);
      onSaved?.();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'သိမ်းဆည်းခြင်း မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ');
    } finally {
      setLoading(false);
    }
  };

  const titleHeader = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <User className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          ကိုယ်ရေးအချက်အလက် ဖြည့်စွက်ခြင်း
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          အချက်အလက်များကို နောက်မှ ပြန်ပြင်လို့ရပါသည်
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={titleHeader}
    >
      <div className="p-5 sm:p-6 space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>သိမ်းဆည်းပြီးပါပြီ!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အမည် *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="ဥပမာ- ဦးအောင်ကျော်"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အသုံးပြုသူအမည် (Username)
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="ဥပမာ- aungkyaw123"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              အင်္ဂလိပ်အက္ခရာအသေး၊ ဂဏန်း၊ _ သို့မဟုတ် . သာ — ၃ လုံးမှ ၂၀ လုံးအထိ။ Email အစား ဒီ username နဲ့ ဝင်လို့ရပါမယ်။
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                မွေးသက္ကရာဇ်
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ကျား / မ
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as '' | 'male' | 'female' | 'other')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">မရွေးပါ</option>
                <option value="male">ကျား (Male)</option>
                <option value="female">မ (Female)</option>
                <option value="other">အခြား (Other)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  အရပ်
                </label>
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => switchHeightUnit('cm')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => switchHeightUnit('m')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'm' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    m
                  </button>
                  <button
                    type="button"
                    onClick={() => switchHeightUnit('ft')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    ft/in
                  </button>
                </div>
              </div>
              {heightUnit === 'cm' ? (
                <div className="relative">
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="168"
                    value={heightCmInput}
                    onChange={(e) => setHeightCmInput(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              ) : heightUnit === 'm' ? (
                <div className="relative">
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.5"
                    placeholder="1.68"
                    value={heightMInput}
                    onChange={(e) => setHeightMInput(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="2"
                    max="7"
                    placeholder="ပေ"
                    value={heightFeetInput}
                    onChange={(e) => setHeightFeetInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    step="0.5"
                    placeholder="လက်မ"
                    value={heightInchesInput}
                    onChange={(e) => setHeightInchesInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  ကိုယ်အလေးချိန်
                </label>
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => switchWeightUnit('kg')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => switchWeightUnit('lb')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'lb' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    lb
                  </button>
                </div>
              </div>
              {weightUnit === 'kg' ? (
                <div className="relative">
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="65"
                    value={weightKgInput}
                    onChange={(e) => setWeightKgInput(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="143"
                    value={weightLbInput}
                    onChange={(e) => setWeightLbInput(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ရောဂါအခံများ (ရှိပါက ရွေးချယ်ပါ)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CHRONIC_CONDITIONS.map((cond) => {
                const isSelected = chronicConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
            >
              နောက်မှ ဖြည့်မယ်
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>သိမ်းဆည်းမည်</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProfileSetupModal;
