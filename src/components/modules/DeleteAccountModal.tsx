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
import { isLegacyLocalKey } from '../../lib/perUserStorage';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Remove only the deleting user's own localStorage keys (v2.4.11 8-L).
// Per-user keys are suffixed _<uid>. Legacy un-suffixed phone-only keys
// are migrated to the current user's suffixed keys when the owning module
// first loads after v2.4.11, so by delete time they should normally be
// gone — but any leftovers (e.g. physio dates from days the module was
// never opened since the update) are removed here too, via
// isLegacyLocalKey. Everything else — the app version marker, other users'
// suffixed keys — stays.
const removeOwnLocalKeys = (uid: string) => {
  const legacyKeys = [
    'family_health_profile',
  ];
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    keys.forEach(k => {
      // Own suffixed keys, the cached profile (it holds this user's
      // profile), and any leftover legacy un-suffixed phone-only keys
      // (including dated physio_completed_<date> keys).
      if (k.endsWith(`_${uid}`) || legacyKeys.includes(k) || isLegacyLocalKey(k)) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    console.warn('Could not clean up local keys:', e);
  }
};

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();

  const [step, setStep] = useState<'warn' | 'reauth' | 'deleting' | 'done'>('warn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState('');
  // A-M10: collections whose cleanup failed. The account deletion still
  // proceeds (below) and this list is shown honestly on the done screen,
  // so the user can ask an admin to remove the leftovers.
  const [failedNames, setFailedNames] = useState<string[]>([]);

  if (!isOpen || !currentUser) return null;

  // Google sign-in was removed in v2.4.12. A user who signed up with
  // Google before that has no password provider — they must set a
  // password first (log out, "forgot password", then log back in) before
  // they can re-authenticate here.
  const hasPasswordProvider = currentUser.providerData.some(p => p.providerId === 'password');

  const handleStartReauth = () => {
    setError(null);
    setStep('reauth');
  };

  const handleExecuteDeletion = async () => {
    setError(null);
    setStep('deleting');
    setProgressText('အကောင့်နှင့် စကားဝှက် စစ်ဆေးအတည်ပြုနေပါသည်...');

    try {
      // 1. Re-authenticate with the account password
      if (!password) {
        throw new Error('ကျေးဇူးပြု၍ စကားဝှက် ရိုက်ထည့်ပါ');
      }
      const credential = EmailAuthProvider.credential(currentUser.email!, password);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Cascade delete all documents owned by this user
      const collectionsToClean = USER_DATA_COLLECTIONS;

      const failedCollections: string[] = [];

      for (const colName of collectionsToClean) {
        const mmName = COLLECTION_NAMES_MM[colName] || colName;
        setProgressText(`${mmName} ဖျက်သိမ်းနေပါသည်...`);
        try {
          // Delete by userId AND by patientEmail (v2.4.11 8-I): records
          // filed under a family member's doc id carry the owner's email
          // as patientEmail, not the owner's uid — the old userId-only
          // query left all of them behind. Dedupe by doc id: a record can
          // match both queries.
          const idsToDelete = new Set<string>();
          const qByUid = query(collection(db, colName), where('userId', '==', currentUser.uid));
          const snapByUid = await getDocs(qByUid);
          snapByUid.docs.forEach(d => idsToDelete.add(d.id));
          if (currentUser.email) {
            const qByEmail = query(collection(db, colName), where('patientEmail', '==', currentUser.email));
            const snapByEmail = await getDocs(qByEmail);
            snapByEmail.docs.forEach(d => idsToDelete.add(d.id));
          }
          const deletes = [...idsToDelete].map(id => deleteDoc(doc(db, colName, id)));
          await Promise.all(deletes);
        } catch (e: any) {
          console.error(`Error deleting ${colName}:`, e);
          failedCollections.push(mmName);
        }
      }

      // 2b. Cross-user notifications addressed to this user (the
      // 'notifications' collection from v2.4.10, e.g. Q&A answers) — by
      // uid and by email, same dual-key reason as above.
      setProgressText('သတိပေးချက် မှတ်တမ်းများ ဖျက်သိမ်းနေပါသည်...');
      try {
        const notiIds = new Set<string>();
        const qNotiUid = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
        (await getDocs(qNotiUid)).docs.forEach(d => notiIds.add(d.id));
        if (currentUser.email) {
          const qNotiEmail = query(collection(db, 'notifications'), where('recipientEmail', '==', currentUser.email));
          (await getDocs(qNotiEmail)).docs.forEach(d => notiIds.add(d.id));
        }
        await Promise.all([...notiIds].map(id => deleteDoc(doc(db, 'notifications', id))));
      } catch (e: any) {
        console.error('Error deleting notifications:', e);
        failedCollections.push('သတိပေးချက် မှတ်တမ်းများ');
      }

      // 2c. The /admins/{uid} doc, if this user is an admin (v2.4.11 8-I).
      // Best-effort only: the Firestore rules forbid deleting your OWN
      // admin doc (isAdmin() && uid != adminId), so this will usually be
      // denied — that must NOT abort the account deletion. The leftover
      // doc is harmless (it only grants admin rights to a deleted uid)
      // and another admin can remove it from the Admin panel.
      setProgressText('Admin အခန်းကဏ္ဍ ဖျက်သိမ်းနေပါသည်...');
      try {
        await deleteDoc(doc(db, 'admins', currentUser.uid));
      } catch (e: any) {
        console.warn('Could not delete own admins doc (rules forbid self-delete):', e);
      }

      // A-M10: NEVER abort the account deletion because part of the
      // cleanup failed. The old code threw here after some collections
      // were already deleted — leaving a half-deleted account: data gone,
      // account alive, and the user told to "contact admin" with no record
      // of what actually failed. Now every failure is collected in
      // failedCollections, the Auth deletion proceeds, and the done screen
      // names exactly what is left behind.
      // (No throw here — see the done step.)

      // 3. Delete user document in users collection — a failure here is
      // also non-fatal (it joins failedCollections and is reported).
      setProgressText('အသုံးပြုသူ ပရိုဖိုင် ဖျက်သိမ်းနေပါသည်...');
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid));
      } catch (e: any) {
        console.error('Error deleting user profile:', e);
        failedCollections.push('အသုံးပြုသူ ပရိုဖိုင်');
      }

      // 3b. Free the username (v2.4.12): delete every `usernames` doc
      // pointing at this uid, so the name can be used again. Best-effort
      // only — this runs while still signed in (the rules allow the owner
      // to delete their own entry), and a failure here must not abort the
      // account deletion itself.
      setProgressText('အသုံးပြုသူအမည် ဖျက်သိမ်းနေပါသည်...');
      try {
        const qNames = query(collection(db, 'usernames'), where('uid', '==', currentUser.uid));
        const nameSnap = await getDocs(qNames);
        await Promise.all(nameSnap.docs.map(d => deleteDoc(doc(db, 'usernames', d.id))));
      } catch (e: any) {
        console.warn('Could not free username mapping (it may stay reserved):', e);
      }

      // 4. Delete Firebase Auth User only after all data is safely erased
      setProgressText('Firebase အကောင့် အပြီးတိုင် ဖျက်သိမ်းနေပါသည်...');
      await deleteUser(currentUser);

      // 5. Remove ONLY this user's own local data (v2.4.11 8-L). The old
      // localStorage.clear() wiped EVERYONE's data on a shared phone,
      // because the phone-only keys were device-global. Keys are now
      // per-user (suffixed _<uid>), so this removes exactly the deleting
      // user's keys: anything ending _<uid>, the cached profile (it holds
      // this user's profile), and any leftover legacy un-suffixed keys
      // (modules migrate those to the current user's suffixed keys on
      // first load after v2.4.11; leftovers are e.g. physio dates from
      // days the module was never opened since the update).
      // The version marker and any other user's keys are left untouched.
      // Broadcast tickers are admin-shared content, not this user's data,
      // so they are deliberately NOT deleted here.
      removeOwnLocalKeys(currentUser.uid);

      setFailedNames(failedCollections);
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
      <div className="p-4 relative">
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
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ဒေတာအချို့ ဖျက်မရခဲ့လျှင်လည်း အကောင့်ကို ဆက်လက် ဖျက်သိမ်းမည်ဖြစ်ပြီး၊ ကျန်နေသော ဒေတာများကို ပြီးဆုံးသည့် စာမျက်နှာတွင် ဖော်ပြပေးပါမည်။
              </p>
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

            {!hasPasswordProvider ? (
              <div className="space-y-3 py-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  သင်သည် Google ဖြင့် ဖွင့်ထားသော အကောင့်ဖြစ်ပြီး စကားဝှက် မသတ်မှတ်ရသေးပါ။ အကောင့်ဖျက်ရန် အရင် အကောင့်ထွက်၍ "စကားဝှက်မေ့နေပါသလား?" ဖြင့် စကားဝှက် အသစ် သတ်မှတ်ပါ၊ ပြီးမှ ပြန်ဝင်ပြီး ဖျက်ပါ။
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  ပိတ်မည်
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
            {failedNames.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>အောက်ပါ ဒေတာများ ဖျက်မရခဲ့ပါ</span>
                </p>
                <p className="leading-relaxed">
                  သင့်အကောင့်ကို ဖျက်သိမ်းပြီးပါပြီ၊ သို့သော် ဤအချက်အလက်များ ဖျက်ရာတွင် ချို့ယွင်းချက် ဖြစ်ခဲ့ပါသည်: <strong>{failedNames.join('၊ ')}</strong>။ ကျန်နေသော ဒေတာများ ဖျက်ရန် စနစ်စီမံခန့်ခွဲသူ (Admin) ထံ ဆက်သွယ်ပေးပါ။
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};
