import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  UserCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Check, 
  Plus, 
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types/health';
import { calculateBMI, calculateAge } from '../../lib/medicalCalculations';

interface EditPatientModalProps {
  isOpen: boolean;
  patient: UserProfile | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<UserProfile>) => Promise<void>;
}

const COMMON_CONDITIONS = [
  'သွေးတိုးရောဂါ (Hypertension)',
  'ဆီးချိုရောဂါ (Diabetes)',
  'နှလုံးသွေးကြောရောဂါ (Heart Disease)',
  'သွေးတွင်းအဆီဓာတ်များခြင်း (High Cholesterol)',
  'ကျောက်ကပ်ရောဂါ (Kidney Disease)',
  'အသည်းအဆီဖုံး (Fatty Liver)',
  'လေဖြတ်ဖူးခြင်း (Stroke history)',
  'ပန်းနာရင်ကျပ် (Asthma)',
  'ဂေါက် / ယူရစ်အက်စစ် (Gout)',
  'သိုင်းရွိုက်ရောဂါ (Thyroid)'
];

const BLOOD_TYPES = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onSave,
}) => {
  if (!isOpen || !patient) return null;

  const [displayName, setDisplayName] = useState(patient.displayName || '');
  const [email, setEmail] = useState(patient.email || '');
  const [phone, setPhone] = useState(patient.phone || '');
  const [age, setAge] = useState<number | string>(patient.age || '');
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(patient.gender || 'male');
  const [heightCm, setHeightCm] = useState<number | string>(patient.heightCm || '');
  const [weightKg, setWeightKg] = useState<number | string>(patient.weightKg || '');
  const [waistCm, setWaistCm] = useState<number | string>(patient.waistCm || '');
  const [bloodType, setBloodType] = useState(patient.bloodType || 'O+');
  const [chronicConditions, setChronicConditions] = useState<string[]>(patient.chronicConditions || []);
  const [customCondition, setCustomCondition] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(patient.emergencyContact || '');
  const [allergiesText, setAllergiesText] = useState((patient.allergies || []).join(', '));
  const [notes, setNotes] = useState(patient.notes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever the selected patient changes
  useEffect(() => {
    if (patient) {
      setDisplayName(patient.displayName || '');
      setEmail(patient.email || '');
      setPhone(patient.phone || '');
      setAge(patient.age || '');
      setDateOfBirth(patient.dateOfBirth || '');
      setGender(patient.gender || 'male');
      setHeightCm(patient.heightCm || '');
      setWeightKg(patient.weightKg || '');
      setWaistCm(patient.waistCm || '');
      setBloodType(patient.bloodType || 'O+');
      setChronicConditions(patient.chronicConditions || []);
      setEmergencyContact(patient.emergencyContact || '');
      setAllergiesText((patient.allergies || []).join(', '));
      setNotes(patient.notes || '');
      setErrorMsg(null);
    }
  }, [patient]);

  // Live BMI calculation
  const parsedWeight = Number(weightKg);
  const parsedHeight = Number(heightCm);
  const liveBMI = (parsedWeight > 0 && parsedHeight > 0)
    ? calculateBMI(parsedWeight, parsedHeight)
    : null;

  const toggleCondition = (cond: string) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(chronicConditions.filter(c => c !== cond));
    } else {
      setChronicConditions([...chronicConditions, cond]);
    }
  };

  const handleAddCustomCondition = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCondition.trim();
    if (!trimmed) return;
    if (!chronicConditions.includes(trimmed)) {
      setChronicConditions([...chronicConditions, trimmed]);
    }
    setCustomCondition('');
  };

  const removeCondition = (cond: string) => {
    setChronicConditions(chronicConditions.filter(c => c !== cond));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('လူနာအမည် ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const parsedAge = age ? Number(age) : undefined;
    const allergiesList = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      await onSave(patient.id, {
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        age: parsedAge,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        heightCm: parsedHeight > 0 ? parsedHeight : undefined,
        weightKg: parsedWeight > 0 ? parsedWeight : undefined,
        waistCm: waistCm ? Number(waistCm) : undefined,
        bmi: liveBMI ? liveBMI.bmi : undefined,
        bloodType: bloodType || undefined,
        chronicConditions,
        emergencyContact: emergencyContact.trim() || undefined,
        allergies: allergiesList,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'အချက်အလက် ပြင်ဆင်ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                လူနာမှတ်တမ်း ပြင်ဆင်ခြင်း (Edit Patient Record)
              </h3>
              <p className="text-xs text-slate-500">
                လူနာ ID: <span className="font-mono text-indigo-600 dark:text-indigo-400">{patient.id}</span> • Cloud Firestore နှင့် အချိန်နှင့်တပြေးညီ ချိတ်ဆက်ပြင်ဆင်မည်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Basic Identifiers */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <span>၁။ အခြေခံ အချက်အလက်များ (Basic Info)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  လူနာအမည် <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ဥပမာ- ဦးဘမောင်"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ဖုန်းနံပါတ် (Phone Number)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09-123456789"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အီးမေးလ်လိပ်စာ (Email)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အရေးပေါ် ဆက်သွယ်ရန် ဖုန်း
                </label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="09-987654321 (သား/သမီး)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အသက် (နှစ်)
                </label>
                <input
                  type="number"
                  min="0"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="ဥပမာ- 52"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  မွေးသက္ကရာဇ် (ရွေးချယ်ရန်)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ကျား / မ
                </label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="male">ကျား (Male)</option>
                  <option value="female">မ (Female)</option>
                  <option value="other">အခြား (Other)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Physical Vitals & BMI */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                <span>၂။ ခန္ဓာကိုယ် တိုင်းတာချက်များနှင့် သွေးအုပ်စု</span>
              </h4>

              {liveBMI && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${liveBMI.bgColor} ${liveBMI.color} ${liveBMI.borderColor}`}>
                  BMI: {liveBMI.bmi} ({liveBMI.labelMm})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အရပ် (cm)
                </label>
                <input
                  type="number"
                  placeholder="165"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ကိုယ်အလေးချိန် (kg)
                </label>
                <input
                  type="number"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ခါးအတိုင်း (cm)
                </label>
                <input
                  type="number"
                  placeholder="80"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  သွေးအုပ်စု
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-bold"
                >
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Chronic Conditions (ရောဂါအခံများ) */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>၃။ ရောဂါအခံများ သတ်မှတ်ခြင်း (Chronic Conditions)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                ရွေးချယ်ထားသော ရောဂါအခံ ({chronicConditions.length}) ခု
              </span>
            </div>

            {/* Quick toggle chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = chronicConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom condition adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="အခြားရောဂါအခံ ထည့်သွင်းရန်..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomCondition}
                disabled={!customCondition.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 disabled:opacity-40 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ထည့်မည်</span>
              </button>
            </div>
          </div>

          {/* Section 4: Allergies & Clinical Notes */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>၄။ မတည့်သောဆေးဝါးနှင့် မှတ်ချက်များ (Allergies & Clinical Notes)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  မတည့်သော ဆေး/အစားအစာ (ကော်မာဖြင့် ခွဲရေးပါ)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="ဥပမာ- Penicillin, ပုစွန်"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ဆရာဝန်မှတ်ချက် / နေရပ်လိပ်စာ
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ဥပမာ- ရန်ကုန်၊ လှိုင်မြို့နယ် / အထူးဂရုစိုက်ရန်"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
            >
              မလုပ်တော့ပါ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'သိမ်းဆည်းနေပါသည်...' : 'ပြင်ဆင်ချက်များ သိမ်းဆည်းမည်'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
