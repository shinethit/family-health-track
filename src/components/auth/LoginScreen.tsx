import React, { useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Droplets, 
  FlaskConical, 
  Pill, 
  LogIn, 
  UserPlus, 
  AlertCircle,
  Lock,
  Mail,
  User,
  Sparkles,
  Calendar,
  Scale,
  Ruler,
  Newspaper,
  MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
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
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        setError('အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။ စကားဝှက် မှန်ကန်စွာ ရိုက်ထည့်ပါ (အကောင့်မရှိသေးပါက "အကောင့်သစ်ဖွင့်ရန်" တွင် ဖွင့်နိုင်ပါသည်)');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ "အကောင့်ဝင်ရန် (Log In)" Tab သို့ သွားပြီး Login ဝင်ပါ');
      } else if (err.code === 'auth/weak-password') {
        setError('လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
      } else if (err.code === 'auth/invalid-email') {
        setError('အီးမေးလ် ပုံစံ မမှန်ကန်ပါ။ (ဥပမာ- user@example.com)');
      } else {
        setError(err.message || 'အကောင့်စစ်ဆေးမှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Family Health Track
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ကျန်းမာရေးစောင့်ရှောက်မှု
              </span>
            </div>
            <p className="text-xs text-slate-400">
              သွေးတိုး၊ ဆီးချို၊ BMI၊ ဓာတ်ခွဲခန်းစစ်ဆေးချက်များနှင့် ဆရာဝန်မေးမြန်းမှု စနစ်
            </p>
          </div>
        </div>
      </header>

      {/* Center Main Hero & Auth Box */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: App Intro & Highlights */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>ကျန်းမာရေးမှတ်တမ်းများကို လုံခြုံစွာ သိမ်းဆည်းပါ</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white !leading-[1.6]">
              မိသားစု ကျန်းမာရေးကို
            </h1>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent !leading-[1.6]">
              စနစ်တကျ စောင့်ကြည့် ထိန်းသိမ်းပါ
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl !leading-[1.9]">
              နေ့စဉ် သွေးပေါင်ချိန် (BP)၊ သွေးတွင်းသကြားဓာတ် (Glucose)၊ ခန္ဓာကိုယ်အချိုးအစား (BMI) နှင့် ဓာတ်ခွဲခန်း ဆေးစစ်ချက်များကို တစ်နေရာတည်းတွင် အချိန်နှင့်တပြေးညီ မှတ်တမ်းတင် တွက်ချက်နိုင်ပါသည်။
            </p>
          </div>

          {/* Highlights grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Activity className="w-5 h-5 text-rose-400 mb-2" />
              <div className="font-bold text-xs text-white">သွေးပေါင်ချိန် (BP)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">AHA Guidelines သတ်မှတ်ချက်</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Droplets className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-bold text-xs text-white">သွေးချို/HbA1c</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ADA စံနှုန်း သကြားဓာတ်</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <FlaskConical className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="font-bold text-xs text-white">အသည်း & ကျောက်ကပ်</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ဓာတ်ခွဲခန်း Lab Tests</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Pill className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-bold text-xs text-white">ဆေးသောက် Reminder</div>
              <div className="text-[11px] text-slate-400 mt-0.5">အချိန်မှန် သတိပေးချက်</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Newspaper className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="font-bold text-xs text-white">ကျန်းမာရေး သတင်း</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ဆောင်းပါး ဗဟုသုတများ</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <MessageSquareHeart className="w-5 h-5 text-pink-400 mb-2" />
              <div className="font-bold text-xs text-white">ဆရာဝန် မေးမြန်းရန်</div>
              <div className="text-[11px] text-slate-400 mt-0.5">အွန်လိုင်း ကျန်းမာရေး Q&A</div>
            </div>
          </div>
        </div>

        {/* Right Side: Secure Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
            
            {/* Switch Tabs (Login / Register) */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
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
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                အကောင့်သစ်ဖွင့်ရန် (Sign Up)
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Register Mode Extra Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      အမည် (Full Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="ဥပမာ- ဦးအောင်ကျော်"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        မွေးသက္ကရာဇ် (DOB)
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pl-10 pr-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ကျား / မ (Gender)
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        <option value="male">ကျား (Male)</option>
                        <option value="female">မ (Female)</option>
                        <option value="other">အခြား (Other)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        အရပ် (cm)
                      </label>
                      <div className="relative">
                        <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          placeholder="168"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="w-full pl-10 pr-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                          className="w-full pl-10 pr-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chronic condition chips */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      ရောဂါအခံများ (ရှိပါက ရွေးချယ်ပါ)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['သွေးတိုး', 'ဆီးချို', 'အသည်းအဆီဖုံး', 'နှလုံး', 'ကျောက်ကပ်', 'ယူရစ်အက်စစ်'].map((cond) => {
                        const isSelected = chronicConditions.includes(cond);
                        return (
                          <button
                            type="button"
                            key={cond}
                            onClick={() => toggleCondition(cond)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  အီးမေးလ် (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  လျှို့ဝှက်နံပါတ် (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-[10px] text-slate-400 mt-1">အနည်းဆုံး ၆ လုံး ထည့်သွင်းပါ</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>အကောင့်ဝင်မည် (Log In)</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>အကောင့်အသစ်ဖွင့်မည် (Sign Up)</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              လုံခြုံစိတ်ချရသော Firebase Authentication ကျန်းမာရေးစနစ်
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
        Family Health Track • Firebase Authentication & Firestore Persistent Database
      </footer>
    </div>
  );
};
