import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, X, Mail, Lock, Calendar, Ruler, Scale } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState<string>('');
  const [heightCm, setHeightCm] = useState<number | string>('');
  const [weightKg, setWeightKg] = useState<number | string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(chronicConditions.filter(c => c !== cond));
    } else {
      setChronicConditions([...chronicConditions, cond]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('ကျေးဇူးပြု၍ အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ');
        }
        await login(email, password);
      } else {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('ကျေးဇူးပြု၍ အမည်၊ အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ');
        }
        if (password.length < 6) {
          throw new Error('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
        }
        await register(
          email, 
          password, 
          name, 
          dob || undefined, 
          gender, 
          heightCm ? Number(heightCm) : undefined, 
          weightKg ? Number(weightKg) : undefined, 
          chronicConditions
        );
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ Login ဝင်ပါ။');
      } else if (err.code === 'auth/weak-password') {
        setError('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
      } else {
        setError(err.message || 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ။');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-0.5 border border-amber-400/60 flex items-center justify-center overflow-hidden shadow-md shrink-0">
              <img src="/icon.svg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-myanmar">
                {mode === 'login' ? 'အကောင့်ဝင်ရောက်ရန် (Sign In)' : 'အကောင့်အသစ်ဖွင့်ရန် (Sign Up)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-myanmar">
                Family Health Track ကျန်းမာရေးစောင့်ရှောက်မှု စနစ်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            အကောင့်ဝင်ရန် (Log In)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            အကောင့်ဖွင့်ရန် (Sign Up)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အမည် (Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဦးမောင်မောင်"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    မွေးသက္ကရာဇ် (DOB)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကျား / မ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="male">ကျား (Male)</option>
                    <option value="female">မ (Female)</option>
                    <option value="other">အခြား</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အရပ် (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="168"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကိုယ်အလေးချိန် (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="65"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အီးမေးလ် (Email) *
            </label>
            <input
              type="email"
              required
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              လျှို့ဝှက်နံပါတ် (Password) *
            </label>
            <input
              type="password"
              required
              placeholder="အနည်းဆုံး ၆ လုံး"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading
                ? 'လုပ်ဆောင်နေသည်...'
                : mode === 'login'
                ? 'အကောင့်ဝင်ရောက်မည်'
                : 'အကောင့်အသစ် ဖွင့်မည်'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
