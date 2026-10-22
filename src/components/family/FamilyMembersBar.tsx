import React, { useState } from 'react';
import { Users, UserPlus, Heart, Activity, Check, Trash2, X, Plus } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember } from '../../types/health';

export const FamilyMembersBar: React.FC = () => {
  const { 
    familyMembers, 
    selectedFamilyMemberId, 
    setSelectedFamilyMemberId, 
    selectedFamilyMember,
    addFamilyMember,
    deleteFamilyMember,
    bpRecords,
    glucoseRecords,
    medications
  } = useHealthData();
  const { isAdmin } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('အမေ (Mother)');
  const [age, setAge] = useState<number>(50);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodType, setBloodType] = useState('O+');
  const [conditions, setConditions] = useState<string[]>(['သွေးတိုး (Hypertension)']);
  const [notes, setNotes] = useState('');

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFamilyMember({
      name,
      relationship,
      age,
      gender,
      bloodType,
      chronicConditions: conditions,
      notes,
    });

    setIsOpenAdd(false);
    setName('');
    setNotes('');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-indigo-900/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-4 sm:p-5 mb-6">
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
          onClick={() => setIsOpenAdd(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          မိသားစုဝင် အသစ်ထည့်မည်
        </button>
      </div>

      {/* Member Cards or Empty State */}
      {familyMembers.length === 0 ? (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 text-center mt-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            မိသားစုဝင် မှတ်တမ်း မရှိသေးပါ (No Family Members Added)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            မိမိ၏ မိခင်၊ ဖခင်၊ ဇနီး၊ ခင်ပွန်း သို့မဟုတ် သားသမီးများ၏ သွေးတိုး၊ ဆီးချိုနှင့် ကျန်းမာရေးမှတ်တမ်းများကို စနစ်တကျ စောင့်ရှောက်နိုင်ရန် မိသားစုဝင်ကို စတင်ထည့်သွင်းပါ
          </p>
          <button
            onClick={() => setIsOpenAdd(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            မိသားစုဝင် စတင်ထည့်သွင်းမည်
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {familyMembers.map((member) => {
            const isSelected = (selectedFamilyMember?.id || familyMembers[0]?.id) === member.id;
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
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          {member.relationship}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{member.age} နှစ်</span>
                    <span>•</span>
                    <span>{member.gender === 'female' ? 'အမျိုးသမီး' : 'အမျိုးသား'}</span>
                    <span>•</span>
                    <span>{member.bloodType || 'B+'}</span>
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
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>✓ လက်ရှိရွေးချယ်ထားသည်</span>
                    {familyMembers.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFamilyMember(member.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="မိသားစုဝင် ဖျက်မည်"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Family Member Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                မိသားစုဝင် အသစ်ထည့်သွင်းခြင်း
              </h3>
              <button
                onClick={() => setIsOpenAdd(false)}
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
                    အသက် (Age)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကျား / မ (Gender)
                  </label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
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
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  မိသားစုဝင် ထည့်သွင်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
