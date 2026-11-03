import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Heart, 
  AlertTriangle, 
  Printer, 
  User, 
  Building2, 
  Stethoscope, 
  Edit, 
  Check, 
  Info,
  Droplet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { EmergencyProfile, UserProfile } from '../../types/health';

// Build the card ONLY from real saved data: first the previously saved
// emergencyProfile, else the profile's own blood type / allergies /
// conditions. Anything not yet entered stays empty — never invent a name,
// phone, hospital, doctor, blood type, allergy or condition. Fabricated
// emergency data can kill in a real emergency.
const buildEmergencyData = (patient: UserProfile | null | undefined): EmergencyProfile => {
  const ep = patient?.emergencyProfile;
  return {
    id: ep?.id || `emg-${patient?.id || 'default'}`,
    userId: patient?.id || '',
    patientName: ep?.patientName || patient?.displayName || '',
    dateOfBirth: ep?.dateOfBirth || patient?.dateOfBirth || '',
    bloodType: ep?.bloodType || patient?.bloodType || '',
    allergies: ep?.allergies || patient?.allergies || [],
    chronicConditions: ep?.chronicConditions || patient?.chronicConditions || [],
    primaryContactName: ep?.primaryContactName || '',
    primaryContactPhone: ep?.primaryContactPhone || '',
    primaryContactRelation: ep?.primaryContactRelation || '',
    secondaryContactName: ep?.secondaryContactName || '',
    secondaryContactPhone: ep?.secondaryContactPhone || '',
    attendingDoctorName: ep?.attendingDoctorName || '',
    attendingDoctorPhone: ep?.attendingDoctorPhone || '',
    preferredHospital: ep?.preferredHospital || '',
    organDonor: ep?.organDonor ?? false,
    specialInstructions: ep?.specialInstructions || '',
  };
};

// Format a stored DOB (ISO date) for the printed card; never invent one.
const formatDobForCard = (dob?: string): string => {
  if (!dob) return 'မထည့်ရသေးပါ';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString('my-MM', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const EmergencyIDModule: React.FC = () => {
  const { currentUser, profile, updateProfile } = useAuth();
  const { selectedPatient, updatePatient } = useHealthData();
  const currentPatient = selectedPatient || profile;

  // Same chronic-condition chips as the sign-up / profile-setup form, so
  // the emergency card uses the same words everywhere.
  const CHRONIC_CONDITIONS = ['သွေးတိုး', 'ဆီးချို', 'အသည်းအဆီဖုံး', 'နှလုံး', 'ကျောက်ကပ်', 'ယူရစ်အက်စစ်'];
  const toggleCondition = (cond: string) => {
    const current = emergencyData.chronicConditions || [];
    setEmergencyData({
      ...emergencyData,
      chronicConditions: current.includes(cond)
        ? current.filter(c => c !== cond)
        : [...current, cond],
    });
  };
  const [customCondition, setCustomCondition] = useState('');
  const addCustomCondition = () => {
    const value = customCondition.trim();
    if (!value) return;
    const current = emergencyData.chronicConditions || [];
    if (!current.includes(value)) {
      setEmergencyData({ ...emergencyData, chronicConditions: [...current, value] });
    }
    setCustomCondition('');
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [emergencyData, setEmergencyData] = useState<EmergencyProfile>(() => buildEmergencyData(currentPatient));

  // Reload the form when the viewed patient changes (sign-in finishing,
  // switching patients). Only the patient id is watched on purpose: the
  // profile snapshot can lag behind a just-completed save, and reloading
  // from it would wipe the freshly saved card from the screen.
  const viewedPatientId = currentPatient?.id;
  useEffect(() => {
    if (viewedPatientId) setEmergencyData(buildEmergencyData(currentPatient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedPatientId]);

  const handleCancelEdit = () => {
    setEmergencyData(buildEmergencyData(currentPatient));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedPatient?.id || profile?.id || currentUser?.uid || '';
    if (!targetId) {
      setSaveError('အသုံးပြုသူမှတ်တမ်း မတွေ့ပါ — အကောင့်ပြန်ဝင်ပြီး ထပ်စမ်းကြည့်ပါ။');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const toSave: EmergencyProfile = {
        ...emergencyData,
        id: emergencyData.id || `emg-${targetId}`,
        userId: targetId,
        patientName: emergencyData.patientName.trim() || currentPatient?.displayName || '',
        allergies: emergencyData.allergies.map(a => a.trim()).filter(Boolean),
        chronicConditions: emergencyData.chronicConditions.map(c => c.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      };
      // updatePatient() already shows a success/error toast itself.
      await updatePatient(targetId, { emergencyProfile: toSave });
      // updatePatient() writes Firestore + the admin-only patientsList, but
      // never the signed-in user's own AuthContext profile — without this,
      // the card goes blank/old on remount until the next login. Refresh the
      // profile too when the target is the signed-in user themself.
      // Both writes are merge setDocs of the same emergencyProfile value.
      if (targetId === currentUser?.uid) {
        await updateProfile({ emergencyProfile: toSave }, { silent: true });
      }
      setEmergencyData(toSave);
      setIsEditing(false);
    } catch (err) {
      setSaveError('သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ထပ်စမ်းကြည့်ပါ။');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-emergency-card, #printable-emergency-card * {
            visibility: visible;
          }
          #printable-emergency-card {
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translate(-50%, -20%);
            width: 400px;
            padding: 0;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0">
            <ShieldAlert className="w-8 h-8 text-rose-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">အရေးပေါ် ကျန်းမာရေးကတ် (Emergency Medical ID)</h2>
            <p className="text-xs text-rose-100 mt-1">
              အရေးပေါ် အခြေအနေများတွင် ရှေးဦးသူနာပြုများနှင့် ဆရာဝန်များ ချက်ချင်း ကြည့်ရှုနိုင်ရန် တိုက်ရိုက် ဆက်သွယ်ရန်နှင့် သွေးအမျိုးအစား မှတ်တမ်း
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            className="px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'မလုပ်တော့ပါ' : 'ပြင်ဆင်မည်'}</span>
          </button>

          <button
            onClick={handlePrintCard}
            className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-700" />
            <span>ကတ်ပြား Print ထုတ်မည်</span>
          </button>
        </div>
      </div>

      {/* Edit Form or Visual Pocket Card View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            အရေးပေါ် ကျန်းမာရေး အချက်အလက်များ ပြင်ဆင်ရန်
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">အသုံးပြုသူအမည်</label>
              <input
                type="text"
                value={emergencyData.patientName}
                onChange={(e) => setEmergencyData({ ...emergencyData, patientName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">သွေးအမျိုးအစား (Blood Group)</label>
              <input
                type="text"
                value={emergencyData.bloodType}
                onChange={(e) => setEmergencyData({ ...emergencyData, bloodType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">မွေးသက္ကရာဇ်</label>
              <input
                type="date"
                value={emergencyData.dateOfBirth || ''}
                onChange={(e) => setEmergencyData({ ...emergencyData, dateOfBirth: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">အဓိက အရေးပေါ် ဆက်သွယ်ရန် (အမည်နှင့် တော်စပ်ပုံ)</label>
              <input
                type="text"
                value={emergencyData.primaryContactName}
                onChange={(e) => setEmergencyData({ ...emergencyData, primaryContactName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">အဓိက ဆက်သွယ်သူနှင့် တော်စပ်ပုံ (ဥပမာ- ဇနီး/ခင်ပွန်း၊ သား/သမီး၊ မိဘ)</label>
              <input
                type="text"
                value={emergencyData.primaryContactRelation || ''}
                onChange={(e) => setEmergencyData({ ...emergencyData, primaryContactRelation: e.target.value })}
                placeholder="ဥပမာ- ဇနီး"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">အဓိက ဆက်သွယ်ရန် ဖုန်းနံပါတ်</label>
              <input
                type="text"
                value={emergencyData.primaryContactPhone}
                onChange={(e) => setEmergencyData({ ...emergencyData, primaryContactPhone: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ပြသနေသော ဆရာဝန် (အမည်)</label>
              <input
                type="text"
                value={emergencyData.attendingDoctorName}
                onChange={(e) => setEmergencyData({ ...emergencyData, attendingDoctorName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဆရာဝန် ဖုန်းနံပါတ်</label>
              <input
                type="text"
                value={emergencyData.attendingDoctorPhone}
                onChange={(e) => setEmergencyData({ ...emergencyData, attendingDoctorPhone: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဦးစားပေး ဆေးရုံ (Preferred Hospital)</label>
              <input
                type="text"
                value={emergencyData.preferredHospital}
                onChange={(e) => setEmergencyData({ ...emergencyData, preferredHospital: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဓာတ်မတည့်သော ဆေး/အစားအစာများ (ကော်မာခြားရန်)</label>
              <input
                type="text"
                value={emergencyData.allergies.join(', ')}
                onChange={(e) => setEmergencyData({ ...emergencyData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none text-rose-700 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဒုတိယ အရေးပေါ် ဆက်သွယ်ရန် (အမည်)</label>
              <input
                type="text"
                value={emergencyData.secondaryContactName || ''}
                onChange={(e) => setEmergencyData({ ...emergencyData, secondaryContactName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဒုတိယ ဆက်သွယ်ရန် ဖုန်းနံပါတ်</label>
              <input
                type="text"
                value={emergencyData.secondaryContactPhone || ''}
                onChange={(e) => setEmergencyData({ ...emergencyData, secondaryContactPhone: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-2">နာတာရှည် ရောဂါများ (ရှိပါက ရွေးချယ်ပါ)</label>
              <div className="flex flex-wrap gap-1.5">
                {CHRONIC_CONDITIONS.map((cond) => {
                  const isSelected = (emergencyData.chronicConditions || []).includes(cond);
                  return (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cond}
                    </button>
                  );
                })}
                {/* Conditions not in the list above (e.g. from the profile)
                    stay editable: shown as removable chips, never silently
                    kept or dropped. */}
                {(emergencyData.chronicConditions || [])
                  .filter(c => !CHRONIC_CONDITIONS.includes(c))
                  .map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      title="ဖယ်ရှားမည်"
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer bg-rose-600 text-white shadow-xs"
                    >
                      ✓ {cond} ✕
                    </button>
                  ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomCondition();
                    }
                  }}
                  placeholder="အခြား ရောဂါအမည် ရိုက်ထည့်ပါ (ဥပမာ- ပန်းနာရင်ကျပ်)"
                  className="flex-1 p-2 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                >
                  ထည့်မည်
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">အထူး အရေးပေါ် မှာကြားချက်</label>
            <textarea
              rows={2}
              value={emergencyData.specialInstructions || ''}
              onChange={(e) => setEmergencyData({ ...emergencyData, specialInstructions: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyData.organDonor ?? false}
              onChange={(e) => setEmergencyData({ ...emergencyData, organDonor: e.target.checked })}
              className="w-4 h-4 accent-rose-700"
            />
            <span className="font-semibold">ကိုယ်အင်္ဂါ လှူဒါန်းသူ (Organ Donor)</span>
          </label>

          {saveError && (
            <p className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100"
            >
              မလုပ်တော့ပါ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-rose-700 text-white font-bold rounded-xl hover:bg-rose-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'သိမ်းဆည်းနေသည်...' : 'သိမ်းဆည်းမည်'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Print Pocket Wallet Card (Visual Preview) */}
          <div className="lg:col-span-1" id="printable-emergency-card">
            <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white rounded-3xl p-6 shadow-xl border-2 border-rose-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
              
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-yellow-300 animate-pulse" />
                  <span className="font-extrabold text-sm tracking-wider uppercase">EMERGENCY MEDICAL ID</span>
                </div>
                <div className="px-2.5 py-1 bg-white text-rose-900 rounded-full font-black text-xs shadow-xs flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                  <span>{emergencyData.bloodType || 'မထည့်ရသေးပါ'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[11px] text-rose-200 uppercase font-bold tracking-wider">အသုံးပြုသူအမည်</p>
                  <p className="text-lg font-black text-white">{emergencyData.patientName || 'မထည့်ရသေးပါ'}</p>
                </div>

                <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2.5 border border-white/20">
                  <p className="text-[11px] text-yellow-200 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ALLERGIES (ဓာတ်မတည့်ပါ)</span>
                  </p>
                  <p className="font-bold text-white mt-0.5">
                    {emergencyData.allergies.length > 0 ? emergencyData.allergies.join(', ') : 'မထည့်ရသေးပါ'}
                  </p>
                </div>

                {emergencyData.organDonor && (
                  <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2.5 border border-white/20">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200" />
                      <span>ကိုယ်အင်္ဂါ လှူဒါန်းသူ (Organ Donor)</span>
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] text-rose-200 uppercase font-bold tracking-wider">အရေးပေါ် တိုက်ရိုက်ဆက်သွယ်ရန်</p>
                  {emergencyData.primaryContactPhone ? (
                    <a 
                      href={`tel:${emergencyData.primaryContactPhone}`}
                      className="inline-flex items-center gap-2 mt-0.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-xl font-black text-sm hover:bg-yellow-300 transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{emergencyData.primaryContactPhone} ({emergencyData.primaryContactName || 'မထည့်ရသေးပါ'}{emergencyData.primaryContactRelation ? ` — ${emergencyData.primaryContactRelation}` : ''})</span>
                    </a>
                  ) : (
                    <p className="font-bold text-white mt-0.5">မထည့်ရသေးပါ</p>
                  )}
                </div>

                {/* Extra fields that must also reach paper, not just the screen */}
                <div className="pt-2 border-t border-white/20 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-rose-200 font-bold shrink-0">မွေးသက္ကရာဇ်:</span>
                    <span className="font-bold text-white text-right">{formatDobForCard(emergencyData.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-rose-200 font-bold shrink-0">နာတာရှည် ရောဂါများ:</span>
                    <span className="font-bold text-white text-right">{emergencyData.chronicConditions.length > 0 ? emergencyData.chronicConditions.join(', ') : 'မထည့်ရသေးပါ'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-rose-200 font-bold shrink-0">ပြသနေသော ဆရာဝန်:</span>
                    <span className="font-bold text-white text-right">
                      {emergencyData.attendingDoctorName || 'မထည့်ရသေးပါ'}
                      {emergencyData.attendingDoctorPhone ? ` (${emergencyData.attendingDoctorPhone})` : ''}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-rose-200 font-bold shrink-0">ဒုတိယ ဆက်သွယ်ရန်:</span>
                    <span className="font-bold text-white text-right">
                      {emergencyData.secondaryContactName || 'မထည့်ရသေးပါ'}
                      {emergencyData.secondaryContactPhone ? ` (${emergencyData.secondaryContactPhone})` : ''}
                    </span>
                  </div>
                  {emergencyData.specialInstructions && (
                    <div>
                      <span className="text-[11px] text-rose-200 font-bold">အထူး ညွှန်ကြားချက်:</span>
                      <p className="font-bold text-white leading-snug">"{emergencyData.specialInstructions}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-rose-100">
                  <span>ဆေးရုံ: {emergencyData.preferredHospital || 'မထည့်ရသေးပါ'}</span>
                  <span className="font-bold">Family Health Track</span>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
              * ဤကတ်ပြားကို Print ထုတ်၍ ပိုက်ဆံအိတ် သို့မဟုတ် ဖုန်းကာဗာတွင် ထည့်သွင်းထားနိုင်ပါသည်။
            </p>
          </div>

          {/* Detailed Emergency Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Primary Contacts */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>အရေးပေါ် ဆက်သွယ်ရန် ဖုန်းနံပါတ်များ (Direct Emergency Contacts)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-rose-800">အဓိက အရေးပေါ် ဆက်သွယ်ရန်</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{emergencyData.primaryContactName || 'မထည့်ရသေးပါ'}</p>
                    {emergencyData.primaryContactRelation && (
                      <p className="text-[11px] text-slate-500">{emergencyData.primaryContactRelation}</p>
                    )}
                    <p className="text-rose-700 font-bold mt-1">{emergencyData.primaryContactPhone || 'မထည့်ရသေးပါ'}</p>
                  </div>
                  {emergencyData.primaryContactPhone && (
                    <a
                      href={`tel:${emergencyData.primaryContactPhone}`}
                      className="p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
                      title="တိုက်ရိုက် ဖုန်းခေါ်မည်"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-600">ဒုတိယ အရေးပေါ် ဆက်သွယ်ရန်</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{emergencyData.secondaryContactName || 'မထည့်ရသေးပါ'}</p>
                    <p className="text-slate-800 font-bold mt-1">{emergencyData.secondaryContactPhone || 'မထည့်ရသေးပါ'}</p>
                  </div>
                  {emergencyData.secondaryContactPhone && (
                    <a
                      href={`tel:${emergencyData.secondaryContactPhone}`}
                      className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                      title="တိုက်ရိုက် ဖုန်းခေါ်မည်"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor & Preferred Hospital */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>ပြသနေသော ဆရာဝန်နှင့် ဆေးရုံ (Physician & Hospital)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <p className="text-[11px] font-bold text-indigo-800">ပြသနေသော ဆရာဝန်</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">{emergencyData.attendingDoctorName || 'မထည့်ရသေးပါ'}</p>
                  <p className="text-indigo-700 font-bold mt-1">{emergencyData.attendingDoctorPhone || 'မထည့်ရသေးပါ'}</p>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-[11px] font-bold text-emerald-800">ဦးစားပေး ဆေးရုံကြီး</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">{emergencyData.preferredHospital || 'မထည့်ရသေးပါ'}</p>
                  {emergencyData.preferredHospital && (
                    <p className="text-emerald-700 font-medium mt-1">အရေးပေါ်ဌာန ဖွင့်လှစ်ထားပါသည်</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions & Organ Donation */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 text-xs text-amber-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-700" />
                <span>အရေးပေါ် လမ်းညွှန်ချက် (Special Medical Instructions)</span>
              </p>
              <p className="leading-relaxed bg-white/80 p-3 rounded-2xl border border-amber-200 font-medium">
                {emergencyData.specialInstructions ? `"${emergencyData.specialInstructions}"` : 'မထည့်ရသေးပါ'}
              </p>
              {emergencyData.organDonor && (
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>ကိုယ်အင်္ဂါ လှူဒါန်းသူ (Organ Donor) ဖြစ်ပါသည်။</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
