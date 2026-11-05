import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Heart, 
  AlertTriangle, 
  Printer, 
  FileDown,
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
import { useToast } from '../../context/ToastContext';
import { EmergencyProfile, FamilyMember, UserProfile } from '../../types/health';
import { formatDateLabel } from '../../lib/medicalCalculations';
import {
  SAVE_UNCONFIRMED_MESSAGE,
  isSaveTimeoutError,
  withSaveTimeout,
} from '../../lib/saveConfirmation';
import {
  buildPdfFilename,
  exportElementToPdf,
  isStandalonePwa,
} from '../../lib/pdfExport';

// The fields an emergency card is built from — a signed-in user / patient
// profile, or a family member (name instead of displayName, no DOB /
// allergies of their own; those come only from their emergencyProfile).
type EmergencySource = {
  id?: string;
  displayName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyProfile?: EmergencyProfile;
} | null | undefined;

const toEmergencySource = (person: UserProfile | FamilyMember | null | undefined): EmergencySource => {
  if (!person) return null;
  if ('displayName' in person) return person;
  return {
    id: person.id,
    displayName: person.name,
    bloodType: person.bloodType,
    chronicConditions: person.chronicConditions,
    emergencyProfile: person.emergencyProfile,
  };
};

// Build the card ONLY from real saved data: first the previously saved
// emergencyProfile, else the profile's own blood type / allergies /
// conditions. Anything not yet entered stays empty — never invent a name,
// phone, hospital, doctor, blood type, allergy or condition. Fabricated
// emergency data can kill in a real emergency.
const buildEmergencyData = (person: EmergencySource): EmergencyProfile => {
  const ep = person?.emergencyProfile;
  return {
    id: ep?.id || `emg-${person?.id || 'default'}`,
    userId: person?.id || '',
    patientName: ep?.patientName || person?.displayName || '',
    dateOfBirth: ep?.dateOfBirth || person?.dateOfBirth || '',
    bloodType: ep?.bloodType || person?.bloodType || '',
    allergies: ep?.allergies || person?.allergies || [],
    chronicConditions: ep?.chronicConditions || person?.chronicConditions || [],
    primaryContactName: ep?.primaryContactName || '',
    primaryContactPhone: ep?.primaryContactPhone || '',
    primaryContactRelation: ep?.primaryContactRelation || '',
    secondaryContactName: ep?.secondaryContactName || '',
    secondaryContactPhone: ep?.secondaryContactPhone || '',
    // G-L4: the secondary-contact relation was dropped here even though
    // the type carries it — a saved relation vanished on reload.
    secondaryContactRelation: ep?.secondaryContactRelation || '',
    attendingDoctorName: ep?.attendingDoctorName || '',
    attendingDoctorPhone: ep?.attendingDoctorPhone || '',
    preferredHospital: ep?.preferredHospital || '',
    organDonor: ep?.organDonor ?? false,
    specialInstructions: ep?.specialInstructions || '',
  };
};

// G-L5: the only blood types a card may carry. Anything else is rejected
// on save with a clear message — a typo here can kill in an emergency.
const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Format a stored DOB (ISO date) for the printed card; never invent one.
// D-M4: hardcoded helper, never toLocaleDateString('my-MM').
const formatDobForCard = (dob?: string): string => {
  if (!dob) return 'မထည့်ရသေးပါ';
  return formatDateLabel(dob).date || dob;
};

export const EmergencyIDModule: React.FC = () => {
  const { currentUser, profile, updateProfile, isAdmin } = useAuth();
  const { selectedPatient, selectedFamilyMember, updatePatient, updateFamilyMember } = useHealthData();
  // D-M5: when a family member is selected, this module shows/saves THAT
  // member's card (their FamilyMember.emergencyProfile) — the old code
  // always showed the owner's card. Admins keep viewing the selected
  // patient's card.
  const isMemberView = !isAdmin && !!selectedFamilyMember;
  const viewedPerson = isMemberView
    ? toEmergencySource(selectedFamilyMember)
    : toEmergencySource(selectedPatient || profile);

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

  const [emergencyData, setEmergencyData] = useState<EmergencyProfile>(() => buildEmergencyData(viewedPerson));

  // G-M7: dirty tracking + stale reload. The form must never silently
  // overwrite the user's in-progress edits when the saved card changes
  // underneath (e.g. an admin saved the same card from another device).
  // lastLoadedRef holds the card as last loaded/saved; isDirty is true
  // while the form differs from it.
  const lastLoadedRef = useRef<string>(JSON.stringify(buildEmergencyData(viewedPerson)));
  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const [staleNotice, setStaleNotice] = useState(false);
  const prevPersonIdRef = useRef<string | undefined>(viewedPerson?.id);

  useEffect(() => {
    const dirty = JSON.stringify(emergencyData) !== lastLoadedRef.current;
    isDirtyRef.current = dirty;
    setIsDirty(dirty);
  }, [emergencyData]);

  // Reload the form when the viewed person changes (sign-in finishing,
  // switching patients/members) or when the SAVED card changes. Only the
  // person id is watched for the switch on purpose: the profile snapshot
  // can lag behind a just-completed save, and reloading from it would wipe
  // the freshly saved card from the screen.
  const viewedPersonId = viewedPerson?.id;
  useEffect(() => {
    const fresh = buildEmergencyData(viewedPerson);
    const freshJson = JSON.stringify(fresh);
    const personChanged = prevPersonIdRef.current !== viewedPersonId;
    prevPersonIdRef.current = viewedPersonId;
    if (personChanged) {
      // An explicit switch to another person's card always loads that
      // person's card (unsaved edits to the previous card are discarded —
      // the banner above names whose card is shown).
      setEmergencyData(fresh);
      lastLoadedRef.current = freshJson;
      setStaleNotice(false);
      return;
    }
    if (freshJson === lastLoadedRef.current) return;
    if (isDirtyRef.current) {
      // G-M7: the saved card changed while the form is dirty — do NOT
      // overwrite the user's edits. Show the notice and let them choose.
      setStaleNotice(true);
      return;
    }
    setEmergencyData(fresh);
    lastLoadedRef.current = freshJson;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedPersonId, selectedFamilyMember, selectedPatient, profile]);

  const loadFreshCard = () => {
    const fresh = buildEmergencyData(viewedPerson);
    setEmergencyData(fresh);
    lastLoadedRef.current = JSON.stringify(fresh);
    setStaleNotice(false);
  };

  const handleCancelEdit = () => {
    const fresh = buildEmergencyData(viewedPerson);
    setEmergencyData(fresh);
    lastLoadedRef.current = JSON.stringify(fresh);
    setStaleNotice(false);
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // G-L5: reject any blood type outside the known set — a typo here is
    // dangerous. Empty is allowed (means "not entered yet").
    const bloodType = emergencyData.bloodType.trim().toUpperCase();
    if (bloodType && !VALID_BLOOD_TYPES.includes(bloodType)) {
      setSaveError('သွေးအမျိုးအစား မမှန်ပါ — A+, A-, B+, B-, O+, O-, AB+, AB- တို့ထဲက တစ်ခုသာ ရိုက်ထည့်ပါ။');
      return;
    }
    const targetId = isMemberView
      ? (selectedFamilyMember?.id || '')
      : (selectedPatient?.id || profile?.id || currentUser?.uid || '');
    if (!targetId) {
      setSaveError('အသုံးပြုသူမှတ်တမ်း မတွေ့ပါ — အကောင့်ပြန်ဝင်ပြီး ထပ်စမ်းကြည့်ပါ။');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const toSave: EmergencyProfile = {
        ...emergencyData,
        bloodType,
        id: emergencyData.id || `emg-${targetId}`,
        userId: targetId,
        patientName: emergencyData.patientName.trim() || viewedPerson?.displayName || '',
        allergies: emergencyData.allergies.map(a => a.trim()).filter(Boolean),
        chronicConditions: emergencyData.chronicConditions.map(c => c.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      };
      if (isMemberView) {
        // D-M5: a member's card lives on the member doc, not the owner's
        // profile — updateFamilyMember toasts success/failure itself.
        await updateFamilyMember(targetId, { emergencyProfile: toSave });
      } else {
        // updatePatient() already shows a success/error toast itself.
        await updatePatient(targetId, { emergencyProfile: toSave });
        // updatePatient() writes Firestore + the admin-only patientsList, but
        // never the signed-in user's own AuthContext profile — without this,
        // the card goes blank/old on remount until the next login. Refresh the
        // profile too when the target is the signed-in user themself.
        // Both writes are merge setDocs of the same emergencyProfile value.
        if (targetId === currentUser?.uid) {
          // v2.4.22 (Bug A): the card itself is already saved by
          // updatePatient above — this local profile refresh is best
          // effort only, so a stalled refresh must never hang the save
          // or report a failure that did not happen.
          try {
            await withSaveTimeout(updateProfile({ emergencyProfile: toSave }, { silent: true }));
          } catch (refreshErr) {
            console.warn('Emergency ID profile refresh failed (card itself is saved):', refreshErr);
          }
        }
      }
      setEmergencyData(toSave);
      lastLoadedRef.current = JSON.stringify(toSave);
      setStaleNotice(false);
      setIsEditing(false);
    } catch (err) {
      // v2.4.22 (Bug A): on timeout the context already checked the list;
      // for an edit the outcome cannot be confirmed, so say so honestly.
      // (SAVE_TIMEOUT_MESSAGE is the add-path text; edits use the
      // unconfirmed text — both flow through err.message here.)
      setSaveError(isSaveTimeoutError(err) ? SAVE_UNCONFIRMED_MESSAGE : 'သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ထပ်စမ်းကြည့်ပါ။');
    } finally {
      setIsSaving(false);
    }
  };

  // v2.4.18: PDF is the PRIMARY output — window.print() silently does
  // nothing in an installed PWA, which is how most users run this app.
  // Desktop Print is hidden in standalone mode, where it cannot work.
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isStandalone] = useState(() => isStandalonePwa());
  const { showToast } = useToast();

  // Desktop-only Print. Never called from the phone PWA (button hidden).
  const handlePrintCard = () => {
    window.print();
  };

  // v2.4.18: capture #printable-emergency-card (the whole card — name,
  // blood type, allergies, contacts, doctor, hospital) as a single-page
  // A4 PDF, then share (mobile share sheet) or download it. Honest
  // toasts only; a dismissed share sheet is not an error.
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    const element = document.getElementById('printable-emergency-card');
    if (!element) {
      showToast('PDF ထုတ်ရန် ကတ်ပြား မတွေ့ပါ — ပြန်ကြိုးစားပါ။', 'error');
      return;
    }
    const filename = buildPdfFilename(
      'emergency-id',
      emergencyData.patientName || viewedPerson?.displayName || '',
    );
    setIsGeneratingPdf(true);
    element.classList.add('pdf-capture');
    try {
      const result = await exportElementToPdf(element, { filename });
      if (result.outcome === 'cancelled') return;
      showToast(
        result.outcome === 'shared'
          ? `PDF ဖိုင် (${result.filename}) ထုတ်ပြီးပါပြီ — မျှဝေရန် ရွေးချယ်နိုင်ပါသည်။`
          : `PDF ဖိုင် (${result.filename}) ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။`,
        'success',
      );
    } catch {
      showToast('PDF ထုတ်ယူခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။', 'error');
    } finally {
      element.classList.remove('pdf-capture');
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
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
            /* G-M6: a fixed 400px card is cut off on narrow phone print.
               The card now shrinks to the paper instead. */
            width: min(400px, calc(100vw - 32px));
            max-width: 100%;
            padding: 0;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-4 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0">
            <ShieldAlert className="w-8 h-8 text-rose-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">အရေးပေါ် ကျန်းမာရေးကတ်</h2>
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
            <span>{isEditing ? 'ပိတ်မည်' : 'ပြင်ဆင်မည်'}</span>
          </button>

          {/* v2.4.18: PDF is the PRIMARY button on every device — it
              produces a real file, which window.print() cannot do in a
              phone PWA. Desktop Print stays only where it can work. */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-4 h-4 text-rose-700" />
            <span>{isGeneratingPdf ? 'PDF ထုတ်နေသည်…' : 'PDF ထုတ်မည်'}</span>
          </button>

          {!isStandalone && (
            <button
              onClick={handlePrintCard}
              title="ကွန်ပျူတာပေါ်တွင် Print ထုတ်ရန်"
              className="px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print (ကွန်ပျူတာ)</span>
            </button>
          )}
        </div>
      </div>

      {/* D-M5 / G-L6: whose card is this? The old module silently showed
          the owner's card while a family member was selected, and an admin
          had no label for whose patient card they were editing. */}
      {(isMemberView || (isAdmin && selectedPatient)) && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {isMemberView
              ? `ဤသည်မှာ မိသားစုဝင် “${viewedPerson?.displayName || 'အမည် မသိရှိပါ'}” ၏ အရေးပေါ် ကျန်းမာရေးကတ် ဖြစ်ပါသည် — ပြင်ဆင်မှုများသည် ${viewedPerson?.displayName || 'ထိုမိသားစုဝင်'} ၏ ကတ်တွင်သာ သိမ်းဆည်းမည်။`
              : `Admin အနေဖြင့် အသုံးပြုသူ “${selectedPatient?.displayName || ''}” ၏ အရေးပေါ် ကျန်းမာရေးကတ်ကို ကြည့်နေ/ပြင်နေပါသည်။`}
          </span>
        </div>
      )}

      {/* G-M7: the saved card changed while this form has unsaved edits —
          the edits are kept; the user chooses what happens next. */}
      {staleNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>ဤကတ်၏ သိမ်းထားသော အချက်အလက် အသစ် ရောက်လာပါပြီ</span>
          </p>
          <p className="leading-relaxed">
            သင် ပြင်ဆင်နေဆဲ (မသိမ်းရသေးသော) အချက်များ ရှိနေသဖြင့် အသစ်ရောက်လာသော အချက်များဖြင့် အလိုအလျောက် အစားမထိုးပါ။ အသစ်ကို ဖတ်လိုက်လျှင် သင် ပြင်ထားသည်များ ပျက်သွားမည်။
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadFreshCard}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
            >
              အသစ်ကို ဖတ်မည် (ပြင်ထားတာ ပျက်မည်)
            </button>
            <button
              type="button"
              onClick={() => setStaleNotice(false)}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-bold hover:bg-amber-100 cursor-pointer"
            >
              ပြင်ထားတာကို ဆက်ထားမည်
            </button>
          </div>
        </div>
      )}

      {/* Edit Form or Visual Pocket Card View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            အရေးပေါ် ကျန်းမာရေး အချက်အလက်များ ပြင်ဆင်ရန်
            {isDirty && <span className="ml-2 text-[11px] font-semibold text-amber-700">(မသိမ်းရသေးသော ပြင်ဆင်မှုများ ရှိသည်)</span>}
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
                placeholder="ဥပမာ- O+"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">A+, A-, B+, B-, O+, O-, AB+, AB- တို့ထဲက တစ်ခုသာ ရိုက်ထည့်ပါ။</p>
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

            {/* G-L4: secondary-contact relation — the type has carried this
                field all along, but there was no input for it. */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ဒုတိယ ဆက်သွယ်သူနှင့် တော်စပ်ပုံ (ဥပမာ- သား/သမီး၊ မိဘ)</label>
              <input
                type="text"
                value={emergencyData.secondaryContactRelation || ''}
                onChange={(e) => setEmergencyData({ ...emergencyData, secondaryContactRelation: e.target.value })}
                placeholder="ဥပမာ- သား"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
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
              ပိတ်မည်
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
            <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white rounded-3xl p-4 shadow-xl border-2 border-rose-400 relative overflow-hidden">
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
                      {emergencyData.secondaryContactRelation ? ` (${emergencyData.secondaryContactRelation})` : ''}
                      {emergencyData.secondaryContactPhone ? ` — ${emergencyData.secondaryContactPhone}` : ''}
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
                    {emergencyData.secondaryContactRelation && (
                      <p className="text-[11px] text-slate-500">{emergencyData.secondaryContactRelation}</p>
                    )}
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
