import React, { useEffect, useState } from 'react';
import { User, Check, Calendar, Ruler, Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { UserProfile } from '../../types/health';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Called when the user actually saves (not on skip / X / backdrop).
  // App uses it to stop reminding: a saved profile needs no more prompts.
  onSaved?: () => void;
}

const CHRONIC_CONDITIONS = ['သွေးတိုး', 'ဆီးချို', 'အသည်းအဆီဖုံး', 'နှလုံး', 'ကျောက်ကပ်', 'ယူရစ်အက်စစ်'];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { updateProfile, profile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'' | 'male' | 'female' | 'other'>('');
  const [heightCm, setHeightCm] = useState<number | string>('');
  const [weightKg, setWeightKg] = useState<number | string>('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from the current profile every time the modal opens, so the
  // same modal works both for first-time setup and for later editing.
  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(profile?.displayName || '');
    setDob(profile?.dateOfBirth || '');
    setGender(profile?.gender || '');
    setHeightCm(profile?.heightCm ?? '');
    setWeightKg(profile?.weightKg ?? '');
    setChronicConditions(profile?.chronicConditions || []);
    setError(null);
    setSuccess(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(chronicConditions.filter(c => c !== cond));
    } else {
      setChronicConditions([...chronicConditions, cond]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!displayName.trim()) {
      setError('ကျေးဇူးပြု၍ အမည် ဖြည့်သွင်းပါ');
      return;
    }

    // Only include fields the user actually entered — an empty field keeps
    // whatever value the profile already had.
    const data: Partial<UserProfile> = { displayName: displayName.trim() };
    if (dob) data.dateOfBirth = dob;
    if (gender) data.gender = gender;
    if (heightCm !== '' && !Number.isNaN(Number(heightCm))) data.heightCm = Number(heightCm);
    if (weightKg !== '' && !Number.isNaN(Number(weightKg))) data.weightKg = Number(weightKg);
    data.chronicConditions = chronicConditions;

    setLoading(true);
    try {
      await updateProfile(data);
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                အရပ် (cm)
              </label>
              <div className="relative">
                <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  placeholder="168"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ကိုယ်အလေးချိန် (kg)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.5"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full pl-10 pr-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
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
