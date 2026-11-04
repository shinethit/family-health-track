import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useHealthData } from '../../../context/HealthDataContext';

// Hardcoded Myanmar month names — never toLocaleDateString('my-MM'): the
// user's phone may lack the 'my-MM' locale and fall back to English (D-M4).
const MM_MONTHS = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
const formatMmDate = (value?: string): string => {
  if (!value) return 'ရက်စွဲ မရှိပါ';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'ရက်စွဲ မရှိပါ';
  return `${d.getFullYear()} ခုနှစ် ${MM_MONTHS[d.getMonth()]} ${d.getDate()} ရက်`;
};

// v2.4.16 (C-M4): a promotable user must be a real login user — fabricated
// aggregate emails ('*@patient.local', '*@familyhealth.local') and users
// with no email at all can never sign in as admin, so they are phantoms
// for this list, not promotable people.
const isFabricatedEmail = (email?: string): boolean =>
  !email || /@(patient\.local|familyhealth\.local)$/i.test(email.trim());

interface AdminEntry {
  id: string;
  email: string;
  displayName: string;
  grantedAt?: string;
  grantedBy?: string;
}

export const AdminRoleManager: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { patientsList, promoteToAdmin, revokeAdmin } = useHealthData();

  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const list: AdminEntry[] = [];
      snap.forEach((d) => {
        const data = d.data() as Partial<AdminEntry>;
        list.push({
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || '',
          grantedAt: data.grantedAt,
          grantedBy: data.grantedBy,
        });
      });
      list.sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email));
      setAdmins(list);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Admin စာရင်း ရယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  const adminIds = new Set(admins.map((a) => a.id));
  const promotableUsers = patientsList.filter((p) => !adminIds.has(p.id) && !isFabricatedEmail(p.email));
  const hiddenPhantomCount = patientsList.filter((p) => !adminIds.has(p.id) && isFabricatedEmail(p.email)).length;
  const onlyOneAdminLeft = admins.length <= 1;

  const handlePromote = async () => {
    if (!selectedUserId) return;
    setIsPromoting(true);
    setMessage(null);
    try {
      await promoteToAdmin(selectedUserId);
      setMessage({ type: 'success', text: 'Admin အဖြစ် ရာထူးတင်ပြီးပါပြီ။ ရာထူးတင်ပြီးသူ အကောင့်ပြန်ဝင်မှ Admin အဖြစ် သုံးလို့ရမယ်။' });
      setSelectedUserId('');
      await loadAdmins();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'ရာထူးတင်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။' });
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRevoke = async (adminId: string) => {
    if (confirmRevokeId !== adminId) {
      setConfirmRevokeId(adminId);
      return;
    }
    setConfirmRevokeId(null);
    setRevokingId(adminId);
    setMessage(null);
    try {
      await revokeAdmin(adminId);
      setMessage({ type: 'success', text: 'Admin ရာထူး ဖြုတ်ပြီးပါပြီ။' });
      await loadAdmins();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'ရာထူးဖြုတ်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။' });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Admin ရာထူး စီမံခန့်ခွဲမှု
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            အသုံးပြုသူ တစ်ယောက်ကို Admin အဖြစ် ရာထူးတင်နိုင်သလို၊ Admin တစ်ယောက်ရဲ့ ရာထူးကိုလည်း ဖြုတ်နိုင်ပါတယ်။ ပထမဆုံး Admin ကိုတော့ Firebase Console မှာ ဖန်တီးရပါမယ်။
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-slate-700 mb-2">
          လက်ရှိ Admin များ ({admins.length} ယောက်)
        </div>
        {isLoading ? (
          <p className="text-xs text-slate-400 py-2">ဆွဲယူနေသည်...</p>
        ) : admins.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">Admin မရှိသေးပါ</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((a) => {
              const isSelf = a.id === currentUser?.uid;
              const isConfirming = confirmRevokeId === a.id;
              return (
                <li key={a.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {a.displayName || a.email || a.id}
                      {isSelf && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">ကိုယ်တိုင်</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{a.email}</div>
                    {a.grantedAt && (
                      <div className="text-[11px] text-slate-400">
                        ရာထူးတင်သည့်နေ့: {formatMmDate(a.grantedAt)}
                      </div>
                    )}
                  </div>
                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(a.id)}
                      disabled={onlyOneAdminLeft || revokingId === a.id}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 ${isConfirming ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'}`}
                      title={onlyOneAdminLeft ? 'Admin တစ်ယောက်တည်း ကျန်တော့လို့ ဖြုတ်လို့ မရပါ' : 'Admin ရာထူး ဖြုတ်မည်'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {revokingId === a.id
                          ? 'ဖြုတ်နေသည်...'
                          : isConfirming
                            ? 'သေချာပါသလား? ဖြုတ်မည်'
                            : 'ရာထူးဖြုတ်မည်'}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {onlyOneAdminLeft && admins.length > 0 && (
          <p className="text-[11px] text-amber-700 mt-2">
            Admin တစ်ယောက်တည်း ကျန်နေလို့ ရာထူး ဖြုတ်လို့ မရပါ — အရင် နောက်တစ်ယောက်ကို Admin တင်ပြီးမှ ဖြုတ်ပါ။
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <label htmlFor="admin-role-user-select" className="block text-xs font-bold text-slate-700">
          Admin အဖြစ် ရာထူးတင်မည့် အသုံးပြုသူ
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="admin-role-user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">ရွေးပါ</option>
            {promotableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.email || u.id}{u.email ? ` (${u.email})` : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePromote}
            disabled={!selectedUserId || isPromoting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isPromoting ? 'တင်နေသည်...' : 'Admin အဖြစ် ရာထူးတင်မည်'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          ရာထူးတင်ပြီးသူ အကောင့်ပြန်ဝင်မှ Admin အဖြစ် သုံးလို့ရမယ်။
        </p>
        {hiddenPhantomCount > 0 && (
          <p className="text-[11px] text-slate-400">
            အီးမေးလ်အတု / အီးမေးလ်မရှိသော မှတ်တမ်း {hiddenPhantomCount} ခုကို ရာထူးတင်စာရင်းမှ ဖယ်ထားပါသည် — ထိုသူများသည် အကောင့်ဝင်လို့ မရသော မှတ်တမ်းသက်သက်သာ ဖြစ်ပါသည်။
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={loadAdmins}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>စာရင်း ပြန်ဆွဲမည်</span>
        </button>
      </div>
    </div>
  );
};

export default AdminRoleManager;
