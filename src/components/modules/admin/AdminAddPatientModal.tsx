import React, { useState, useRef } from 'react';
import { UserPlus, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { useHealthData } from '../../../context/HealthDataContext';
import { ftInToCm, cmToFtIn, lbToKg, kgToLb } from '../../../lib/medicalCalculations';
import {
  SAVE_TIMEOUT_MESSAGE,
  isSamePatient,
  isSaveTimeoutError,
} from '../../../lib/saveConfirmation';

// v2.4.12 — height/weight unit options (kg/lb, cm/m/ft-in). Values are
// converted to the canonical heightCm / weightKg before onSave, so the
// patient record and BMI keep working unchanged.
type HeightUnit = 'cm' | 'm' | 'ft';
type WeightUnit = 'kg' | 'lb';

interface AdminAddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: {
    displayName: string;
    email?: string;
    phone?: string;
    age?: number;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    chronicConditions: string[];
    heightCm?: number;
    weightKg?: number;
    bloodType?: string;
  }) => Promise<void>;
}

export const AdminAddPatientModal: React.FC<AdminAddPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { patientsList } = useHealthData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | string>('');
  // v2.4.16 (C-L10): the add form had no date of birth — only an age box.
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [height, setHeight] = useState<number | string>('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [heightM, setHeightM] = useState<number | string>('');
  const [heightFeet, setHeightFeet] = useState<number | string>('');
  const [heightInches, setHeightInches] = useState<number | string>('');
  const [weight, setWeight] = useState<number | string>('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weightLb, setWeightLb] = useState<number | string>('');
  const [bloodType, setBloodType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // v2.4.22 (Bug A): set when a save times out — the next submit checks
  // the list first so a landed-but-unacked first attempt is never added
  // twice. (The check lives here, not in the context: the save crosses
  // the onSave prop into the portal, which cannot carry the flag.)
  const saveTimedOutRef = useRef(false);

  if (!isOpen) return null;

  // Canonical values for saving: height in cm, weight in kg.
  // m -> cm: m x 100 | ft-in -> cm: (ft x 12 + in) x 2.54 | lb -> kg: lb x 0.45359237
  const resolveHeightCm = (): number => {
    if (heightUnit === 'cm') return Number(height) || 0;
    if (heightUnit === 'm') return Math.round((Number(heightM) || 0) * 100 * 10) / 10;
    return ftInToCm(Number(heightFeet) || 0, Number(heightInches) || 0);
  };
  const resolveWeightKg = (): number =>
    weightUnit === 'kg' ? Number(weight) || 0 : lbToKg(Number(weightLb) || 0);

  // Switching units converts the entered value — never discards it.
  const switchHeightUnit = (unit: HeightUnit) => {
    if (unit === heightUnit) return;
    const cm = resolveHeightCm();
    if (cm > 0) {
      if (unit === 'cm') setHeight(String(Math.round(cm * 10) / 10));
      if (unit === 'm') setHeightM(String(Math.round((cm / 100) * 100) / 100));
      if (unit === 'ft') {
        const ft = cmToFtIn(cm);
        setHeightFeet(String(ft.feet));
        setHeightInches(String(ft.inches));
      }
    }
    setHeightUnit(unit);
  };
  const switchWeightUnit = (unit: WeightUnit) => {
    if (unit === weightUnit) return;
    if (unit === 'lb') {
      const kg = Number(weight);
      if (kg > 0) setWeightLb(String(kgToLb(kg)));
    } else {
      const lb = Number(weightLb);
      if (lb > 0) setWeight(String(lbToKg(lb)));
    }
    setWeightUnit(unit);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAge('');
    setDateOfBirth('');
    setGender('');
    setConditions([]);
    setHeight('');
    setHeightUnit('cm');
    setHeightM('');
    setHeightFeet('');
    setHeightInches('');
    setWeight('');
    setWeightUnit('kg');
    setWeightLb('');
    setBloodType('');
    setSaveError(null);
  };

  const toggleCondition = (cond: string) => {
    setConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // v2.4.16 (C-H6): refuse an email that already belongs to another user.
    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      const clash = patientsList.find(
        (p) => (p.email || '').trim().toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (clash) {
        setSaveError(
          `ဤအီးမေးလ် (${trimmedEmail}) ကို အခြားအသုံးပြုသူ "${clash.displayName || clash.email}" က သုံးထားပြီးဖြစ်ပါသည် — အခြားအီးမေးလ် သုံးပါ။`
        );
        return;
      }
    }
    setIsSubmitting(true);
    setSaveError(null);
    // v2.4.22 (Bug A): retry after a timeout? If the patient is already
    // in the list, the first attempt landed and only its ack was lost —
    // close with success instead of writing a second copy.
    if (saveTimedOutRef.current) {
      const duplicate = patientsList.find((p) =>
        isSamePatient(p, {
          displayName: name.trim(),
          email: trimmedEmail || undefined,
          phone: phone.trim() || undefined,
          age: age === '' ? undefined : Number(age),
          dateOfBirth: dateOfBirth || undefined,
        }),
      );
      if (duplicate) {
        setIsSubmitting(false);
        resetForm();
        onClose();
        return;
      }
    }
    saveTimedOutRef.current = false;
    try {
      // Wait for the real save result: only close (and clear the form)
      // after onSave actually succeeds. On failure the modal stays open
      // with the entered values intact so the admin can retry.
      const heightCm = resolveHeightCm();
      const weightKg = resolveWeightKg();
      await onSave({
        displayName: name.trim(),
        email: trimmedEmail || undefined,
        phone: phone.trim() || undefined,
        age: age === '' ? undefined : Number(age),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        chronicConditions: conditions,
        heightCm: heightCm > 0 ? Math.round(heightCm * 10) / 10 : undefined,
        weightKg: weightKg > 0 ? Math.round(weightKg * 10) / 10 : undefined,
        bloodType: bloodType || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      // The save failed: do NOT close, do NOT clear the form. The error
      // toast is shown by the caller; this inline message makes the
      // failure unmissable inside the modal itself.
      // v2.4.22 (Bug A): on timeout the context already checked the list;
      // absent means it really did not save — say so, and mark this as a
      // retry next time so a landed-but-unacked attempt is not doubled.
      if (isSaveTimeoutError(err)) {
        saveTimedOutRef.current = true;
        setSaveError(SAVE_TIMEOUT_MESSAGE);
      } else {
        setSaveError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
        <UserPlus className="w-4 h-4" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
        အသုံးပြုသူအသစ် ထည့်သွင်းခြင်း
      </h3>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={modalTitle}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
          ဤအသုံးပြုသူအတွက် အကောင့်ဖွင့်ပေးခြင်း မဟုတ်ပါ — မှတ်တမ်းသာ ထည့်ပေးခြင်းဖြစ်ပြီး၊ သူကိုယ်တိုင် App ထဲ ဝင်လို့မရပါ။ App သုံးချင်ရင် သူကိုယ်တိုင် Sign Up လုပ်ရပါမယ်။
        </div>
        <div>
          <label htmlFor="add-patient-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            အသုံးပြုသူ အမည် *
          </label>
          <input
            id="add-patient-name"
            type="text"
            required
            placeholder="ဥပမာ- ဦးကျော်မြင့်"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-patient-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အီးမေးလ် (ရွေးချယ်ရန်)
            </label>
            <input
              id="add-patient-email"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="add-patient-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ဖုန်းနံပါတ် (ရွေးချယ်ရန်)
            </label>
            <input
              id="add-patient-phone"
              type="tel"
              placeholder="09XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="add-patient-age" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အသက် (နှစ်)
            </label>
            <input
              id="add-patient-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="add-patient-dob" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              မွေးသက္ကရာဇ် (ရွေးချယ်ရန်)
            </label>
            <input
              id="add-patient-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="add-patient-gender" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ကျား/မ
            </label>
            <select
              id="add-patient-gender"
              value={gender}
              onChange={(e: any) => setGender(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            >
              <option value="">မရွေးပါ</option>
              <option value="male">ကျား (Male)</option>
              <option value="female">မ (Female)</option>
              <option value="other">အခြား (Other)</option>
            </select>
          </div>

          <div>
            <label htmlFor="add-patient-blood-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              သွေးအုပ်စု
            </label>
            <select
              id="add-patient-blood-type"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            >
              <option value="">မသိပါ / မထည့်ပါ</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="add-patient-height" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              <input
                id="add-patient-height"
                type="number"
                step="0.5"
                min="1"
                placeholder="168"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
              />
            ) : heightUnit === 'm' ? (
              <input
                id="add-patient-height"
                type="number"
                step="0.01"
                min="0.5"
                max="2.5"
                placeholder="1.68"
                value={heightM}
                onChange={(e) => setHeightM(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="2"
                  max="7"
                  placeholder="ပေ"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
                />
                <input
                  type="number"
                  min="0"
                  max="11"
                  step="0.5"
                  placeholder="လက်မ"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="add-patient-weight" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              <input
                id="add-patient-weight"
                type="number"
                step="0.5"
                min="1"
                placeholder="65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
              />
            ) : (
              <input
                id="add-patient-weight"
                type="number"
                step="0.5"
                min="1"
                placeholder="143"
                value={weightLb}
                onChange={(e) => setWeightLb(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ရောဂါအခံများ (Chronic Conditions)
          </label>
          <div className="flex flex-wrap gap-2">
            {['သွေးတိုး', 'ဆီးချို', 'နှလုံး', 'ကျောက်ကပ်', 'အသည်းအဆီဖုံး'].map((cond) => {
              const isSelected = conditions.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{saveError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            ပိတ်မည်
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'အသုံးပြုသူသိမ်းဆည်းမည်'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
