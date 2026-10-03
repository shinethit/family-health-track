import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Lock, 
  X, 
  ShieldAlert, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  GoogleAuthProvider, 
  reauthenticateWithPopup, 
  deleteUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { USER_DATA_COLLECTIONS, COLLECTION_NAMES_MM } from '../../constants/collections';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();

  const [step, setStep] = useState<'warn' | 'reauth' | 'deleting' | 'done'>('warn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState('');

  if (!isOpen || !currentUser) return null;

  const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');

  const handleStartReauth = () => {
    setError(null);
    setStep('reauth');
  };

  const handleExecuteDeletion = async () => {
    setError(null);
    setStep('deleting');
    setProgressText('အကောင့်နှင့် စကားဝှက် စစ်ဆေးအတည်ပြုနေပါသည်...');

    try {
      // 1. Re-authenticate
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
      } else {
        if (!password) {
          throw new Error('ကျေးဇူးပြု၍ စကားဝှက် ရိုက်ထည့်ပါ');
        }
        const credential = EmailAuthProvider.credential(currentUser.email!, password);
        await reauthenticateWithCredential(currentUser, credential);
      }

      // 2. Cascade delete all documents owned by this user
      const collectionsToClean = USER_DATA_COLLECTIONS;

      const failedCollections: string[] = [];

      for (const colName of collectionsToClean) {
        const mmName = COLLECTION_NAMES_MM[colName] || colName;
        setProgressText(`${mmName} ဖျက်သိမ်းနေပါသည်...`);
        try {
          const q = query(collection(db, colName), where('userId', '==', currentUser.uid));
          const snap = await getDocs(q);
          const deletes = snap.docs.map(d => deleteDoc(doc(db, colName, d.id)));
          await Promise.all(deletes);
        } catch (e: any) {
          console.error(`Error deleting ${colName}:`, e);
          failedCollections.push(mmName);
        }
      }

      // Stop and abort if any collection failed to delete completely
      if (failedCollections.length > 0) {
        throw new Error(
          `${failedCollections.join('၊ ')} ကို ဖျက်ပစ်ရာတွင် ခွင့်ပြုချက်မရှိပါ (သို့မဟုတ်) ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်။ သင်၏ ဒေတာများ မကျန်စေရန်အတွက် Auth အကောင့်ဖျက်ခြင်းကို ရပ်ဆိုင်းထားပါသည်။ ကျေးဇူးပြု၍ စနစ်စီမံခန့်ခွဲသူ (Admin) ထံ ဆက်သွယ်ပါ`
        );
      }

      // 3. Delete user document in users collection
      setProgressText('အသုံးပြုသူ ပရိုဖိုင် ဖျက်သိမ်းနေပါသည်...');
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid));
      } catch (e: any) {
        console.error('Error deleting user profile:', e);
        throw new Error('အသုံးပြုသူ ပရိုဖိုင် ဖျက်သိမ်းခြင်း မအောင်မြင်ပါ။ Auth အကောင့်ဖျက်ခြင်းကို ရပ်ဆိုင်းထားပါသည်။');
      }

      // 4. Delete Firebase Auth User only after all data is safely erased
      setProgressText('Firebase အကောင့် အပြီးတိုင် ဖျက်သိမ်းနေပါသည်...');
      await deleteUser(currentUser);

      // 5. Clear all localStorage
      localStorage.clear();

      setStep('done');
      setTimeout(async () => {
        await logout();
        onClose();
        window.location.reload();
      }, 2500);

    } catch (err: any) {
      console.error('Account deletion error:', err);
      setStep('reauth');
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('လျှို့ဝှက်နံပါတ် (Password) မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပါ။');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('လုံခြုံရေးအရ အကောင့်ထွက်ပြီး ပြန်လည်ဝင်ရောက်ပြီးမှသာ ဖျက်ပစ်နိုင်ပါမည်။');
      } else {
        setError(err.message || 'အကောင့်ဖျက်သိမ်းခြင်း မအောင်မြင်ပါ။');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnEscape={step !== 'deleting'}
      closeOnBackdrop={step !== 'deleting'}
      showHeader={false}
      className="border border-rose-200"
    >
      <div className="p-6 relative">
        {/* Close Button */}
        {step !== 'deleting' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="ပိတ်မည်"
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Step 1: Warning */}
        {step === 'warn' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 id="delete-account-title" className="text-lg font-extrabold text-slate-900">
                အကောင့်နှင့် ဒေတာအားလုံး ဖျက်ပစ်မည်
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                ⚠️ ဤလုပ်ဆောင်ချက်သည် ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">အောက်ပါ အချက်အလက်များ အားလုံး အပြီးတိုင် ပျက်ပြယ်သွားပါမည် -</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>သွေးပေါင်ချိန်၊ သွေးချို၊ BMI နှင့် ဓာတ်ခွဲခန်း မှတ်တမ်းများအားလုံး</li>
                <li>ဆေးဝါးမှတ်တမ်းများနှင့် မိသားစုဝင်များ စာရင်း</li>
                <li>ကာကွယ်ဆေး ထိုးနှံမှု မှတ်တမ်းများအားလုံး</li>
                <li>ဆရာဝန် မေးမြန်းထားသော မေးခွန်းများနှင့် အကြံပြုချက်များ</li>
                <li>Firebase Authentication အကောင့်နှင့် ပရိုဖိုင်ဒေတာအားလုံး</li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                type="button"
                onClick={handleStartReauth}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all"
              >
                ဆက်လက်လုပ်ဆောင်မည်
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Re-Authentication */}
        {step === 'reauth' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">အကောင့်ပိုင်ရှင် အတည်ပြုခြင်း</h3>
                <p className="text-xs text-slate-500">လုံခြုံရေးအတွက် သင်၏ စကားဝှက်ကို ထည့်သွင်းပါ</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isGoogleUser ? (
              <div className="space-y-3 py-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  သင်သည် Google အကောင့်ဖြင့် ဝင်ရောက်ထားသောကြောင့် Google အကောင့် စစ်ဆေးအတည်ပြုခြင်း ပြုလုပ်ရန် လိုအပ်ပါသည်။
                </p>
                <button
                  onClick={handleExecuteDeletion}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google ဖြင့် အတည်ပြု၍ အကောင့်ဖျက်မည်</span>
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleExecuteDeletion(); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    လက်ရှိ စကားဝှက် (Current Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('warn')}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    နောက်သို့
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                  >
                    အတည်ပြု၍ ဖျက်ပစ်မည်
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Deleting in progress */}
        {step === 'deleting' && (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">ဒေတာများ ဖျက်သိမ်းနေပါသည်...</h3>
              <p className="text-xs text-slate-500 mt-1">{progressText}</p>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">အကောင့်ကို အပြီးတိုင် ဖျက်သိမ်းပြီးပါပြီ</h3>
              <p className="text-xs text-slate-500 mt-1">အသုံးပြုခဲ့သည့်အတွက် ကျေးဇူးတင်ရှိပါသည်။</p>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
