import React, { useState, useRef } from 'react';
import { Users, UserPlus, Heart, Activity, Check, Trash2, X, Plus, Pencil } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  SAVE_LATE_CONFIRM_MESSAGE,
  SAVE_TIMEOUT_MESSAGE,
  isSaveTimeoutError,
} from '../../lib/saveConfirmation';
import { Modal } from '../common/Modal';
import { FamilyMember } from '../../types/health';

export const FamilyMembersBar: React.FC = () => {
  const { 
    familyMembers, 
    selectedFamilyMemberId, 
    setSelectedFamilyMemberId, 
    selectedFamilyMember,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    bpRecords,
    glucoseRecords,
    medications
  } = useHealthData();
  const { isAdmin, profile } = useAuth();
  const { showToast } = useToast();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // v2.4.22 (Bug A): set when a save times out — the next submit is a
  // retry and the context checks the list first so the same member is
  // never added twice.
  const saveTimedOutRef = useRef(false);
  // D-M1: the member being edited (null = adding a new one). The same
  // form is reused, prefilled from the member — previously the only way
  // to fix a wrong age / relationship / blood type was delete + re-add,
  // which orphaned all of their records under the old doc id.
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  // D-M7: delete confirmation state (generic Modal, never window.confirm)
  // and the member awaiting deletion.
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // No prefilled fake person (v2.4.11 F19): the old form opened with a
  // made-up mother — relationship 'အမေ', age 50, O+, hypertension — so
  // saving without touching anything filed a person who does not exist.
  // Everything starts empty; age and gender are required, so the admin
  // must enter real values instead of the form inventing them.
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [bloodType, setBloodType] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const resetAddForm = () => {
    setName('');
    setRelationship('');
    setAge('');
    setGender('');
    setBloodType('');
    setConditions([]);
    setNotes('');
  };

  const openAddForm = () => {
    setEditingMember(null);
    resetAddForm();
    setIsOpenAdd(true);
  };

  const openEditForm = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setRelationship(member.relationship);
    setAge(member.age);
    setGender(member.gender);
    setBloodType(member.bloodType || '');
    setConditions(member.chronicConditions || []);
    setNotes(member.notes || '');
    setIsOpenAdd(true);
  };

  const closeForm = () => {
    setIsOpenAdd(false);
    setEditingMember(null);
  };

  if (isAdmin) {
    return null; // Admin has the full patient directory
  }

  const toggleCondition = (cond: string) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter(c => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  // v2.4.11 F18: the save was fire-and-forget — a failed save looked
  // successful and the member silently never appeared. Now the save is
  // awaited: success toasts and clears the WHOLE form (F19 — the old code
  // cleared only name/notes, so the fake defaults leaked into the next
  // add); failure toasts, keeps the entered values, and leaves the modal
  // open so the admin can retry. D-M1: the same handler edits — the form
  // is prefilled from the member and updateFamilyMember keeps the doc id,
  // so the member's records stay attached.
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || age === '' || !gender) return;
    setIsSubmitting(true);
    // v2.4.22 (Bug A): retry after a timeout? Pass it through so the
    // context checks the list first and never writes a second copy.
    const isRetry = saveTimedOutRef.current;
    saveTimedOutRef.current = false;
    try {
      if (editingMember) {
        await updateFamilyMember(editingMember.id, {
          name: name.trim(),
          relationship: relationship.trim(),
          age,
          gender,
          bloodType: bloodType || undefined,
          chronicConditions: conditions,
          notes: notes.trim() || undefined,
        });
        // updateFamilyMember toasts success/failure itself.
        resetAddForm();
        setEditingMember(null);
        setIsOpenAdd(false);
      } else {
        const saveResult = await addFamilyMember({
          name: name.trim(),
          relationship: relationship.trim(),
          age,
          gender,
          bloodType: bloodType || undefined,
          chronicConditions: conditions,
          notes: notes.trim() || undefined,
        }, { isRetry });
        showToast(saveResult.confirmedLate ? SAVE_LATE_CONFIRM_MESSAGE : 'မိသားစုဝင်အသစ် ထည့်သွင်းပြီးပါပြီ', 'success');
        resetAddForm();
        setIsOpenAdd(false);
      }
    } catch (err) {
      console.warn('Error saving family member:', err);
      // v2.4.22 (Bug A): on timeout the context already checked the list;
      // in edit mode it already toasted too, so no second toast there.
      if (isSaveTimeoutError(err)) {
        saveTimedOutRef.current = true;
        if (!editingMember) {
          showToast(SAVE_TIMEOUT_MESSAGE, 'error');
        }
      } else {
        showToast(
          editingMember
            ? 'မိသားစုဝင် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။'
            : 'မိသားစုဝင် ထည့်သွင်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // v2.4.11 F22: deleting a family member was one tap with no confirmation.
  // D-M7: the delete is now awaited and reported honestly — the old code
  // called deleteFamilyMember without awaiting it, so a failed delete
  // (and its cascade) looked successful. deleteFamilyMember itself toasts
  // on failure, so only success is toasted here.
  const handleDeleteMember = (member: FamilyMember) => {
    setDeleteTarget(member);
  };

  const confirmDeleteMember = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFamilyMember(deleteTarget.id);
      showToast(`'${deleteTarget.name}' ကို ဖျက်သိမ်းပြီးပါပြီ`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      // Failure was already toasted by deleteFamilyMember; the member
      // stays in the list (the context rolls the optimistic removal back).
      console.warn('Error deleting family member:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-indigo-900/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              မိသားစုဝင်များ (Family Members)
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300">
                {familyMembers.length} ဦး
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              စောင့်ရှောက်လိုသော မိသားစုဝင်ကို ရွေးချယ်၍ သွေးတိုး၊ ဆီးချိုနှင့် ဆေးမှတ်တမ်းများ ကြည့်ရှုမှတ်သားပါ
            </p>
          </div>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          မိသားစုဝင် အသစ်ထည့်မည်
        </button>
      </div>

      {/* Member Cards or Empty State */}
      {familyMembers.length === 0 ? (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 text-center mt-3 shadow-xs">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            မိသားစုဝင် မှတ်တမ်း မရှိသေးပါ (No Family Members Added)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            မိမိ၏ မိခင်၊ ဖခင်၊ ဇနီး၊ ခင်ပွန်း သို့မဟုတ် သားသမီးများ၏ သွေးတိုး၊ ဆီးချိုနှင့် ကျန်းမာရေးမှတ်တမ်းများကို စနစ်တကျ စောင့်ရှောက်နိုင်ရန် မိသားစုဝင်ကို စတင်ထည့်သွင်းပါ
          </p>
          <button
            onClick={openAddForm}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            မိသားစုဝင် စတင်ထည့်သွင်းမည်
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {/* ကိုယ်တိုင် — view only the signed-in user's own records */}
          <div
            onClick={() => setSelectedFamilyMemberId('self')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              (selectedFamilyMemberId ?? 'self') === 'self'
                ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-teal-600">
                    {profile?.displayName?.charAt(0) || 'က'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {profile?.displayName || 'ကိုယ်တိုင်'}
                    </h4>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      ကိုယ်တိုင် (မိမိ)
                    </span>
                  </div>
                </div>
                {(selectedFamilyMemberId ?? 'self') === 'self' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>မိမိ၏ မှတ်တမ်းများသာ</span>
              </div>
            </div>
            {(selectedFamilyMemberId ?? 'self') === 'self' && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>✓ လက်ရှိရွေးချယ်ထားသည်</span>
              </div>
            )}
          </div>

          {/* အားလုံး — pooled view: self + every family member */}
          <div
            onClick={() => setSelectedFamilyMemberId('all')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedFamilyMemberId === 'all'
                ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-indigo-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      အားလုံး
                    </h4>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      အားလုံး ကြည့်မည်
                    </span>
                  </div>
                </div>
                {selectedFamilyMemberId === 'all' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>ကိုယ်တိုင် + မိသားစုဝင် {familyMembers.length} ဦး</span>
              </div>
            </div>
            {selectedFamilyMemberId === 'all' && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>✓ လက်ရှိရွေးချယ်ထားသည်</span>
              </div>
            )}
          </div>

          {familyMembers.map((member) => {
            const isSelected = selectedFamilyMember?.id === member.id;
            return (
              <div
                key={member.id}
                onClick={() => setSelectedFamilyMemberId(member.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                        member.avatarColor || 'bg-emerald-600'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {member.name}
                        </h4>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          {member.relationship}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{member.age} နှစ်</span>
                    <span>•</span>
                    <span>{member.gender === 'female' ? 'အမျိုးသမီး' : member.gender === 'male' ? 'အမျိုးသား' : member.gender === 'other' ? 'အခြား' : ''}</span>
                    <span>•</span>
                    <span>{member.bloodType || '—'}</span>
                  </div>

                  {/* Chronic conditions tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.chronicConditions?.slice(0, 2).map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                        {c.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>✓ လက်ရှိရွေးချယ်ထားသည်</span>
                    {familyMembers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(member);
                          }}
                          className="text-slate-400 hover:text-emerald-600 p-0.5"
                          title="မိသားစုဝင် ပြင်ဆင်မည်"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(member);
                          }}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                          title="မိသားစုဝင် ဖျက်မည်"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Family Member Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingMember ? <Pencil className="w-5 h-5 text-emerald-600" /> : <UserPlus className="w-5 h-5 text-emerald-600" />}
                {editingMember ? `မိသားစုဝင် ပြင်ဆင်ခြင်း — ${editingMember.name}` : 'မိသားစုဝင် အသစ်ထည့်သွင်းခြင်း'}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  အမည် (Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- ဒေါ်လှကြည်၊ မောင်ကောင်းစံ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    တော်စပ်ပုံ (Relationship) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ- အမေ၊ ဇနီး၊ သား"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သွေးအုပ်စု (Blood Group)
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="">မရွေးပါ</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="O-">O-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အသက် (Age) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="ဥပမာ- ၅၀"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကျား / မ (Gender) *
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="">ရွေးပါ</option>
                    <option value="female">အမျိုးသမီး (Female)</option>
                    <option value="male">အမျိုးသား (Male)</option>
                    <option value="other">အခြား</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ရောဂါအခံများ (Chronic Conditions)
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    'သွေးတိုး (Hypertension)',
                    'ဆီးချို အမျိုးအစား ၂',
                    'အသည်းအဆီဖုံး',
                    'ဂေါက် / ယူရစ်အက်စစ်',
                  ].map((cond) => {
                    const isSelected = conditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`py-1 px-2 rounded-lg text-[11px] text-left border flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="truncate">{cond}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  သတိပြုရန် မှတ်ချက် (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- အငန်ရှောင်ရန်၊ နေ့လယ်စာစားပြီး ဆေးသောက်ရန်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
                >
                  ပိတ်မည်
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? (editingMember ? 'ပြင်ဆင်နေသည်...' : 'ထည့်သွင်းနေသည်...')
                    : (editingMember ? 'ပြင်ဆင်ပြီး သိမ်းမည်' : 'မိသားစုဝင် ထည့်သွင်းမည်')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D-M7: delete confirmation — generic Modal, never window.confirm.
          The delete (member doc + cascade of their records) is awaited;
          success/failure is toasted honestly. */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        size="sm"
        showHeader={false}
      >
        <div className="p-4 space-y-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">မိသားစုဝင် ဖျက်မည်</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              '{deleteTarget?.name}' ကို မိသားစုဝင်စာရင်းမှ ဖျက်မလား? သူတို့၏ ကျန်းမာရေးမှတ်တမ်းများ (သွေးပေါင်၊ သွေးချို၊ ဆေး၊ ဓာတ်ခွဲ) လည်း အတူတူ ပျက်သွားမည်။ ဤလုပ်ဆောင်ချက်သည် ပြန်ပြင်၍ မရပါ။
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              မဖျက်တော့ပါ
            </button>
            <button
              type="button"
              onClick={confirmDeleteMember}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'ဖျက်နေသည်...' : 'ဖျက်သိမ်းမည်'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
