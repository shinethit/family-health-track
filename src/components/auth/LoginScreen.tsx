import React, { useState, useEffect } from 'react';
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
  Newspaper,
  MessageSquareHeart,
  X,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth, validateUsername } from '../../context/AuthContext';

interface LoginScreenProps {
  // Called when the password-reset flow finishes or is abandoned, so the
  // app can return to the main screen (v2.4.16, A-M7) — a reset link opened
  // while already logged in must not strand the user on the login form.
  onResetFinished?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onResetFinished }) => {
  const { login, register, resetPassword, verifyResetCode, confirmResetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [resendNote, setResendNote] = useState(false);

  // In-app password reset (user clicked the reset link in their email):
  // the link returns to this app with ?mode=resetPassword&oobCode=...
  // (ActionCodeSettings, handleCodeInApp) instead of Firebase's English
  // hosted page, so the new password is set here, in Burmese.
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeState, setResetCodeState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'resetPassword' && params.get('oobCode')) {
        const code = params.get('oobCode') as string;
        setResetOobCode(code);
        verifyResetCode(code)
          .then((accountEmail) => {
            setResetEmail(accountEmail);
            setResetCodeState('valid');
          })
          .catch(() => setResetCodeState('invalid'));
      }
    } catch {}
    // Run once on mount — the link is only followed once, on a fresh load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearResetParams = () => {
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
    setResetOobCode(null);
    setResetDone(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError(null);
    // v2.4.16 (A-M7): if this reset was opened while logged in, return to
    // the main app instead of stranding the user on the login form.
    onResetFinished?.();
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetOobCode) return;
    if (newPassword.length < 6) {
      setResetError('လျှို့ဝှက်နံပါတ် အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('စကားဝှက် အသစ် နှစ်ခု မတူညီပါ။ ပြန်ရိုက်ထည့်ပါ');
      return;
    }
    setResetLoading(true);
    try {
      await confirmResetPassword(resetOobCode, newPassword);
      setResetDone(true);
    } catch (err: any) {
      setResetError(err.message || 'စကားဝှက် ပြန်သတ်မှတ်ခြင်း မအောင်မြင်ပါ။ လင့်ခ် သက်တမ်းကုန်သွားနိုင်ပါသည်။');
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('ကျေးဇူးပြု၍ အီးမေးလ်/အသုံးပြုသူအမည်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ');
        }
        await login(email, password);
      } else {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('ကျေးဇူးပြု၍ အမည်၊ အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ');
        }
        // v2.4.16 (A-H5): the username is OPTIONAL at sign-up — a user can
        // sign up with just name + email + password and set a username
        // later in their profile. Only validate when one was typed.
        const usernameError = username.trim() ? validateUsername(username) : null;
        if (usernameError) {
          throw new Error(usernameError);
        }
        if (password.length < 6) {
          throw new Error('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
        }
        await register(email, password, name, undefined, undefined, undefined, undefined, undefined, username.trim() ? username : undefined);
      }
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        setError('အီးမေးလ်/အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။ စကားဝှက် မှန်ကန်စွာ ရိုက်ထည့်ပါ (အကောင့်မရှိသေးပါက "အကောင့်သစ်ဖွင့်ရန်" တွင် ဖွင့်နိုင်ပါသည်)');
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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      console.error(err);
      // Never show the raw Firebase error text (English) to the user.
      // v2.4.16 (A-M2): a user-not-found here must show the SAME success
      // copy as a real send — saying "no account with this email" would let
      // anyone check whether an email is registered.
      if (err.code === 'auth/user-not-found') {
        setForgotSuccess(true);
      } else if (err.code === 'auth/invalid-email') {
        setForgotError('အီးမေးလ် ပုံစံ မမှန်ကန်ပါ။ (ဥပမာ- user@example.com)');
      } else if (err.code === 'auth/too-many-requests') {
        setForgotError('တောင်းဆိုမှု များလွန်းနေပါသည်။ ခဏနေ၍ ပြန်ကြိုးစားပါ။');
      } else {
        setForgotError('စကားဝှက်အသစ်တောင်းဆိုခြင်း မအောင်မြင်ပါ။ အီးမေးလ်မှန်ကန်ကြောင်း စစ်ဆေးပါ။');
      }
    } finally {
      setForgotLoading(false);
    }
  };


  // Password-reset link followed from email: show the in-app reset form
  // instead of the login screen.
  if (resetOobCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">စကားဝှက် အသစ် သတ်မှတ်ရန်</h3>
              {resetEmail && (
                <p className="text-xs text-slate-400">အကောင့်: {resetEmail}</p>
              )}
            </div>
          </div>

          {resetCodeState === 'checking' && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">လင့်ခ် စစ်ဆေးနေပါသည်...</p>
            </div>
          )}

          {resetCodeState === 'invalid' && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">ဤလင့်ခ် အသုံးမပြုနိုင်တော့ပါ</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                လင့်ခ် သက်တမ်းကုန်သွားပြီ သို့မဟုတ် အသုံးပြုပြီးသား ဖြစ်နေပါသည်။ စကားဝှက် ပြန်လည်ရယူရန် တောင်းဆိုမှုကို ထပ်မံ ပြုလုပ်ပါ။
              </p>
              <button
                onClick={() => {
                  // v2.4.23: do NOT clearResetParams() here — it calls
                  // onResetFinished(), which unmounts this screen and the
                  // forgot-password modal below never opens. Open the
                  // modal in place; the expired link stays behind it.
                  setForgotEmail(resetEmail);
                  setShowForgotPassword(true);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                လင့်ခ် အသစ် တောင်းမည်
              </button>
            </div>
          )}

          {resetCodeState === 'valid' && resetDone && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">စကားဝှက် အသစ် သတ်မှတ်ပြီးပါပြီ!</p>
              <p className="text-xs text-slate-300">စကားဝှက် အသစ်ဖြင့် အကောင့်ဝင်နိုင်ပါပြီ။</p>
              <button
                onClick={clearResetParams}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                အကောင့်ဝင်မည်
              </button>
            </div>
          )}

          {resetCodeState === 'valid' && !resetDone && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              {resetError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">စကားဝှက် အသစ် *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="အနည်းဆုံး ၆ လုံး"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    aria-label={showNewPassword ? 'စကားဝှက် ဖျောက်မည်' : 'စကားဝှက် ပြကြည့်မည်'}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">စကားဝှက် အသစ် (ထပ်မံ အတည်ပြုပါ) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="စကားဝှက် အသစ် ထပ်ရိုက်ပါ"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resetLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>စကားဝှက် အသစ် သတ်မှတ်မည်</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

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
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Right Side: Secure Auth Card */}
        <div className="lg:col-span-5 order-first lg:order-first">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
            
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
                    <label className="block text-xs font-bold text-white mb-1.5">
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
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      အသုံးပြုသူအမည် (Username) — မဖြစ်မနေ မဟုတ်ပါ
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        autoComplete="username"
                        placeholder="ဥပမာ- aungkyaw123 (မထည့်လည်း ရပါသည်)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">အင်္ဂလိပ် စာလုံး၊ ဂဏန်း၊ _ နှင့် . သာ — အနည်းဆုံး ၃ လုံး။ အကောင့်ဝင်ရာတွင် အီးမေးလ်အစား သုံးနိုင်ပါသည်။ နောက်မှ ပရိုဖိုင်တွင် သတ်မှတ်နိုင်ပါသည်။</p>
                  </div>
                </>
              )}

              {/* Email / Username Field */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  {mode === 'login' ? 'အီးမေးလ် သို့မဟုတ် အသုံးပြုသူအမည် *' : 'အီးမေးလ် (Email) *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={mode === 'login' ? 'text' : 'email'}
                    required
                    autoComplete={mode === 'login' ? 'username' : 'email'}
                    placeholder={mode === 'login' ? 'name@example.com သို့မဟုတ် aungkyaw123' : 'name@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-white">
                    လျှို့ဝှက်နံပါတ် (Password) *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        // v2.4.16 (A-L6): only prefill a real email — a
                        // username in this box would fail validation.
                        setForgotEmail(email.includes('@') ? email : '');
                        setForgotSuccess(false);
                        setForgotError(null);
                        setResendNote(false);
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline cursor-pointer"
                    >
                      စကားဝှက်မေ့နေပါသလား?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'စကားဝှက် ဖျောက်မည်' : 'စကားဝှက် ပြကြည့်မည်'}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-[11px] text-slate-400 mt-1">အနည်းဆုံး ၆ လုံး ထည့်သွင်းပါ</p>
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

              {/* Google sign-in was removed in v2.4.12 (it needed a VPN and kept
                  failing). Anyone who previously signed in with Google should
                  set a password via "forgot password" and then log in with
                  their email. */}
              {mode === 'login' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  Google ဖြင့် ဝင်ရောက်ခြင်း ဖယ်ရှားလိုက်ပါပြီ။ အရင် Google ဖြင့် ဝင်ခဲ့သူများ
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(email.includes('@') ? email : '');
                      setForgotSuccess(false);
                      setForgotError(null);
                      setResendNote(false);
                    }}
                    className="font-semibold text-emerald-400 hover:underline cursor-pointer"
                  >
                    {' '}စကားဝှက်မေ့နေပါသလား?{' '}
                  </button>
                  ကို နှိပ်ပြီး စကားဝှက် အသစ် သတ်မှတ်ပြီးမှ အီးမေးလ်ဖြင့် ဝင်ပါ။
                </div>
              )}
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              လုံခြုံစိတ်ချရသော Firebase Authentication ကျန်းမာရေးစနစ်
            </div>
          </div>
        </div>

        {/* Left Side: App Intro & Highlights */}
        <div className="lg:col-span-7 order-last lg:order-last space-y-6 text-left">
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
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
        Family Health Track • Firebase Authentication & Firestore Persistent Database
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">စကားဝှက် ပြန်လည်ရယူရန်</h3>
                <p className="text-xs text-slate-400">သင်၏အကောင့် အီးမေးလ်သို့ Password Reset လင့်ခ် ပို့ပေးပါမည်</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">တောင်းဆိုမှု လက်ခံရရှိပါပြီ</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  အကောင့်ရှိပါက စကားဝှက် ပြန်သတ်မှတ်ရန် လင့်ခ် အီးမေးလ် (<strong>{forgotEmail}</strong>) သို့ ပို့ပေးပါမည်။ အီးမေးလ် ရောက်မလာပါက Spam ကို စစ်ပါ။
                </p>
                {resendNote && (
                  <p className="text-[11px] text-emerald-400 font-semibold">လင့်ခ် ထပ်မံ ပို့ပေးပြီးပါပြီ — Inbox နှင့် Spam ကို စစ်ဆေးပါ။</p>
                )}
                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={async () => {
                    setForgotLoading(true);
                    try {
                      await resetPassword(forgotEmail);
                      setResendNote(true);
                    } catch (err: any) {
                      setForgotError(err.message || 'လင့်ခ် ပြန်ပို့ခြင်း မအောင်မြင်ပါ။ ပြန်ကြိုးစားပါ။');
                      setForgotSuccess(false);
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? 'ပို့နေပါသည်...' : 'လင့်ခ် ပြန်ပို့မည်'}
                </button>
                <button
                  onClick={() => { setShowForgotPassword(false); setResendNote(false); }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  အဆင်ပြေပါပြီ
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    အီးမေးလ် လိပ်စာ (Email Address) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    ပိတ်မည်
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>လင့်ခ် ပို့မည်</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
