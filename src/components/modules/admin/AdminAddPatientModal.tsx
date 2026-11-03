import React, { useState } from 'react';
import { UserPlus, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../../common/Modal';

interface AdminAddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: {
    displayName: string;
    email?: string;
    phone?: string;
    age?: number;
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [height, setHeight] = useState<number | string>('');
  const [weight, setWeight] = useState<number | string>('');
  const [bloodType, setBloodType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAge('');
    setGender('');
    setConditions([]);
    setHeight('');
    setWeight('');
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
    setIsSubmitting(true);
    setSaveError(null);
    try {
      // Wait for the real save result: only close (and clear the form)
      // after onSave actually succeeds. On failure the modal stays open
      // with the entered values intact so the admin can retry.
      await onSave({
        displayName: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        age: age === '' ? undefined : Number(age),
        gender: gender || undefined,
        chronicConditions: conditions,
        heightCm: height === '' ? undefined : Number(height),
        weightKg: weight === '' ? undefined : Number(weight),
        bloodType: bloodType || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      // The save failed: do NOT close, do NOT clear the form. The error
      // toast is shown by the caller; this inline message makes the
      // failure unmissable inside the modal itself.
      setSaveError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။');
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
            <label htmlFor="add-patient-height" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အရပ် (cm)
            </label>
            <input
              id="add-patient-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="add-patient-weight" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ကိုယ်အလေးချိန် (kg)
            </label>
            <input
              id="add-patient-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
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
            မလုပ်တော့ပါ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'အသုံးပြုသူသိမ်းဆည်းမည်'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
