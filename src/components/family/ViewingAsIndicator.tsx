import React, { useState } from 'react';
import { Users, Check } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface ViewingAsIndicatorProps {
  // Opens the separate family tab (the full FamilyMembersBar page).
  onOpenFamily: () => void;
}

// v2.4.18 (Track B): the big FamilyMembersBar no longer sits on top of
// every record tab. Record tabs keep only this one subtle line saying
// WHOSE records are being viewed, with a small switcher to change it.
// It renders NOTHING for admins (they have the full user directory) and
// NOTHING when the user has no family members yet — a new user must see
// no family UI at all on record tabs. Selection semantics are unchanged:
// it only reads / writes selectedFamilyMemberId ('self' / 'all' / member
// doc id) from HealthDataContext, exactly like FamilyMembersBar did.
export const ViewingAsIndicator: React.FC<ViewingAsIndicatorProps> = ({ onOpenFamily }) => {
  const {
    familyMembers,
    selectedFamilyMemberId,
    setSelectedFamilyMemberId,
    selectedFamilyMember,
  } = useHealthData();
  const { isAdmin, profile } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Admins never see family UI here, and a user with no members yet
  // sees nothing at all — the indicator only exists once there is
  // someone to switch between.
  if (isAdmin || familyMembers.length === 0) {
    return null;
  }

  const isAll = selectedFamilyMemberId === 'all';
  // 'self' (or null, the default) -> ကိုယ်တိုင်; 'all' -> pooled view;
  // a member id -> that member's name + relationship.
  const viewingLabel = isAll
    ? `အားလုံး (ကိုယ်တိုင် + ${familyMembers.length} ဦး)`
    : selectedFamilyMember
      ? `${selectedFamilyMember.name}${selectedFamilyMember.relationship ? ` (${selectedFamilyMember.relationship})` : ''}`
      : 'ကိုယ်တိုင်';

  const isCurrent = (id: string): boolean => (selectedFamilyMemberId ?? 'self') === id;

  const pick = (id: string) => {
    setSelectedFamilyMemberId(id);
    setIsSwitcherOpen(false);
  };

  return (
    <>
      {/* One subtle line — small text, wraps safely at 390px (flex-wrap +
          min-w-0 + break-words so a long member name never overflows or
          gets cut off; the button stays shrink-0 on its own line if
          needed). Not a card: no border, no background, no big header. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 px-1">
        <p className="min-w-0 flex-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span className="break-words">
            ကြည့်နေသည်: <span className="font-bold text-slate-700 dark:text-slate-200">{viewingLabel}</span>
          </span>
        </p>
        <button
          onClick={() => setIsSwitcherOpen(true)}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer"
        >
          ပြောင်းမည်
        </button>
      </div>

      {/* Switcher — same three choices as the old bar's cards, as plain
          tappable rows. Tap selects and closes; the last button navigates
          to the separate family tab to add / edit / delete members. */}
      <Modal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        title="ကြည့်ရှုမည့် သူ ရွေးချယ်ပါ"
        size="sm"
      >
        <div className="space-y-1.5">
          <button
            onClick={() => pick('self')}
            className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
              isCurrent('self')
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile?.displayName || 'ကိုယ်တိုင်'}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">ကိုယ်တိုင် (မိမိ) — မိမိ၏ မှတ်တမ်းများသာ</span>
            </span>
            {isCurrent('self') && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          </button>

          <button
            onClick={() => pick('all')}
            className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
              isCurrent('all')
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">အားလုံး</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">ကိုယ်တိုင် + မိသားစုဝင် {familyMembers.length} ဦး</span>
            </span>
            {isCurrent('all') && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          </button>

          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => pick(member.id)}
              className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                isCurrent(member.id)
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {member.relationship || 'မိသားစုဝင်'} • {member.age} နှစ်
                </span>
              </span>
              {isCurrent(member.id) && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setIsSwitcherOpen(false);
            onOpenFamily();
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
        >
          <Users className="w-4 h-4" />
          မိသားစုဝင်များ စီမံမည်
        </button>
      </Modal>
    </>
  );
};
