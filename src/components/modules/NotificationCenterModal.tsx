import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Pill, 
  Activity, 
  AlertTriangle, 
  Plus, 
  X, 
  Volume2, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ShieldAlert,
  Droplets,
  Pencil
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { CustomReminder } from '../../types/health';
import { Modal } from '../common/Modal';

// Myanmar weekday names (JS getDay(): 0 = Sunday). Day picker (v2.4.11 10-F).
const WEEKDAYS_MM = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const WEEKDAYS_SHORT_MM = ['နွေ', 'လာ', 'ဂါ', 'ဟူး', 'ကြာ', 'သေ', 'နေ'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const formatDaysMm = (days?: number[]): string => {
  if (!days || days.length === 0 || days.length === 7) return 'နေ့တိုင်း';
  return [...days].sort((a, b) => a - b).map(d => WEEKDAYS_MM[d]).join('၊ ');
};

// v2.4.16 (D-M4): hardcoded Myanmar month names — the phone may lack the
// Intl 'my-MM' locale, in which case toLocaleDateString('my-MM') silently
// falls back to English. Never use 'my-MM' in this file.
const MONTHS_MM = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
const formatDateTimeMm = (timestamp: string): string => {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS_MM[d.getMonth()]} • ${hh}:${mm}`;
};

// v2.4.16 (F-L2): snooze choices offered on medication notifications.
const SNOOZE_OPTIONS_MIN = [5, 15, 30, 60];

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // v2.4.16 (F-M4): tapping a doctor Q&A notification opens the Q&A view.
  // App.tsx must pass () => setActiveTab('doctor_qa'); without it the row
  // is not tappable — this modal cannot reach App's tab state on its own.
  onOpenDoctorQA?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose, onOpenDoctorQA }) => {
  const { profile, isAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    customReminders,
    permissionGranted,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addCustomReminder,
    updateCustomReminder,
    deleteCustomReminder,
    toggleReminderActive,
    markMedicationTaken,
    snoozeReminder,
    playNotificationSound,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'meds' | 'alerts' | 'reminders'>('all');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  // v2.4.16 (F-H1): the reminder being edited, if any — null means the
  // panel creates a new reminder. The same panel serves add + edit.
  const [editingReminder, setEditingReminder] = useState<CustomReminder | null>(null);
  // v2.4.16 (F-H1): a failed save keeps the panel open with this error.
  const [formError, setFormError] = useState<string | null>(null);
  // v2.4.16 (F-H2): delete / clear-all go through a confirm Modal first.
  const [pendingDeleteReminder, setPendingDeleteReminder] = useState<CustomReminder | null>(null);
  const [pendingClearAll, setPendingClearAll] = useState(false);

  // New Reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newCategory, setNewCategory] = useState<CustomReminder['category']>('medication');
  const [newNotes, setNewNotes] = useState('');
  // Days of the week this reminder fires on (v2.4.11 10-F). Default = every day.
  const [newDays, setNewDays] = useState<number[]>(ALL_DAYS);

  const toggleNewDay = (day: number) => {
    setNewDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  if (!isOpen) return null;

  const openAddReminder = () => {
    setNewTitle('');
    setNewNotes('');
    setNewCategory('medication');
    setNewTime('08:00');
    setNewDays(ALL_DAYS);
    setEditingReminder(null);
    setFormError(null);
    setShowAddReminderModal(true);
  };

  // v2.4.16 (F-H1): prefill the panel with the reminder's current values.
  const openEditReminder = (rem: CustomReminder) => {
    setNewTitle(rem.title);
    setNewCategory(rem.category);
    setNewTime(rem.time);
    setNewNotes(rem.notes || '');
    setNewDays(rem.daysOfWeek && rem.daysOfWeek.length > 0 ? rem.daysOfWeek : ALL_DAYS);
    setEditingReminder(rem);
    setFormError(null);
    setShowAddReminderModal(true);
  };

  const closeReminderPanel = () => {
    setShowAddReminderModal(false);
    setEditingReminder(null);
    setFormError(null);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('ခေါင်းစဉ် ဖြည့်ပေးပါ။');
      return;
    }

    const data = {
      title: newTitle.trim(),
      category: newCategory,
      time: newTime,
      // Nothing selected means "every day" (F-L4) — the ticker treats an
      // empty daysOfWeek as all days, but storing all 7 explicitly keeps
      // the stored data honest about what will happen.
      daysOfWeek: newDays.length > 0 ? newDays : ALL_DAYS,
      isActive: editingReminder ? editingReminder.isActive : true,
      notes: newNotes.trim() || undefined,
    };

    if (editingReminder) {
      // v2.4.16 (F-H1): update in place. On failure the panel stays open
      // with an honest error — the user's edits are not thrown away.
      try {
        updateCustomReminder(editingReminder.id, data);
      } catch (err) {
        console.error('Failed to update reminder:', err);
        setFormError('ပြင်ဆင်ခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်နှိပ်ပါ။');
        return;
      }
    } else {
      addCustomReminder(data);
    }

    setNewTitle('');
    setNewNotes('');
    setNewDays(ALL_DAYS);
    closeReminderPanel();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'meds') return n.type === 'medication';
    if (activeTab === 'alerts') return n.type === 'abnormal_alert';
    if (activeTab === 'reminders') return n.type === 'custom_reminder' || n.type === 'vital_check';
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showHeader={false}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  သတိပေးချက် & Reminder စင်တာ
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                    {unreadCount} အသစ်
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ဆေးသောက်ချိန်၊ သွေးပေါင်/သကြားဓာတ် တိုင်းချိန်နှင့် အရေးပေါ် သတိပေးချက်များ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playNotificationSound}
              title="အသံစမ်းသပ်မည်"
              aria-label="အသံစမ်းသပ်မည်"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="ပိတ်မည်"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Permission Banner (if not granted) */}
        {!permissionGranted && (
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
              <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>ဖုန်း/ကွန်ပျူတာ Screen ပေါ်တွင် အချိန်မှန် Noti တက်စေရန် Browser Permission ဖွင့်ပါ</span>
            </div>
            <button
              onClick={requestPermission}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Noti ဖွင့်မည်
            </button>
          </div>
        )}

        {/* Admin Mode Clarification Banner */}
        {isAdmin && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              <strong>အက်မင် (Admin) မုဒ်:</strong> ဆေးသောက်ရန် Reminder များကို သက်ဆိုင်ရာ အသုံးပြုသူများ၏ အကောင့်များသို့သာ တိုက်ရိုက် သတိပေးထားပြီး Admin စက်တွင် မလိုအပ်ဘဲ အချက်ပေးသံ/သတိပေးစာ မတက်စေရန် သီးသန့် ကာကွယ်ထားပါသည်
            </span>
          </div>
        )}

        {/* Tabs & Action Bar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              အားလုံး ({notifications.length})
            </button>
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('meds')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'meds'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                💊 ဆေးသောက်ရန်
              </button>
            )}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ⚠️ သတိပေးချက်များ
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ⏰ သတ်မှတ်ထားသော Reminders ({customReminders.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={openAddReminder}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reminder အသစ်</span>
            </button>
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="အားလုံး ဖတ်ပြီးအဖြစ် သတ်မှတ်မည်"
                  aria-label="အားလုံး ဖတ်ပြီးအဖြစ် သတ်မှတ်မည်"
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 text-xs transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingClearAll(true)}
                  title="အားလုံး ရှင်းလင်းမည်"
                  aria-label="အားလုံး ရှင်းလင်းမည်"
                  className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* If in Reminders Tab, show custom scheduled reminders */}
          {activeTab === 'reminders' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>နေ့စဉ် ပုံမှန် အချိန်ဇယားများ</span>
                <span>{customReminders.filter(r => r.isActive).length} ခု ဖွင့်ထားပါသည်</span>
              </div>

              {/* v2.4.16 (F-M9): empty state — a clear message, not a blank list. */}
              {customReminders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700 stroke-1" />
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-300">Reminder မသတ်မှတ်ရသေးပါ</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ဆေးသောက်ချိန်၊ သွေးပေါင်ချိန်/သကြားဓာတ် တိုင်းချိန်များကို အချိန်မှန် သတိပေးဖို့ Reminder တစ်ခု ဖန်တီးလိုက်ပါ
                  </p>
                  <button
                    onClick={openAddReminder}
                    className="mt-4 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    + Reminder အသစ် ဖန်တီးမည်
                  </button>
                </div>
              ) : (
              customReminders.map(rem => (
                <div 
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    rem.isActive 
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' 
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      rem.category === 'medication' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600' :
                      rem.category === 'bp' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' :
                      rem.category === 'glucose' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' :
                      rem.category === 'water' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600' :
                      'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                    }`}>
                      {rem.category === 'medication' ? <Pill className="w-5 h-5" /> :
                       rem.category === 'bp' ? <Activity className="w-5 h-5" /> :
                       rem.category === 'water' ? <Droplets className="w-5 h-5" /> :
                       rem.category === 'doctor' ? <Calendar className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 break-words min-w-0">{rem.title}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                          {rem.time}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          📅 {formatDaysMm(rem.daysOfWeek)}
                        </span>
                      </div>
                      {rem.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">{rem.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleReminderActive(rem.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        rem.isActive 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rem.isActive ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည်'}
                    </button>
                    {/* v2.4.16 (F-H1): edit in place instead of delete + re-add. */}
                    <button
                      onClick={() => openEditReminder(rem)}
                      title="ပြင်ဆင်မည်"
                      aria-label={`"${rem.title}" ပြင်ဆင်မည်`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteReminder(rem)}
                      title="ဖျက်မည်"
                      aria-label={`"${rem.title}" ဖျက်မည်`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          ) : (
            // Notifications List
            filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700 stroke-1" />
                <p className="font-medium text-sm">သတိပေးချက်အသစ် မရှိသေးပါ</p>
                <p className="text-xs text-slate-400 mt-1">
                  ဆေးသောက်ချိန် သို့မဟုတ် ကျန်းမာရေးတိုင်းတာချိန် ရောက်ရှိပါက ဤနေရာတွင် အသိပေးပါမည်
                </p>
                {/* v2.4.16 (F-L1): sound-only test. The old button created a
                    fake notification that looked exactly like a real
                    reminder ("စမ်းသပ် သတိပေးချက်"). Testing the sound must
                    not create any notification — it only plays the chime. */}
                <button
                  onClick={playNotificationSound}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100"
                >
                  🔊 အသံသာ စမ်းသပ်မည် (Noti အတု မဖန်တီးပါ)
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  အသံမြည်ခြင်းကိုသာ စမ်းသပ်တာပါ — သတိပေးချက် မှတ်တမ်းထဲကို ဘာမှ ထည့်မသွားပါဘူး။
                </p>
              </div>
            ) : (
              filteredNotifications.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    item.read 
                      ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 opacity-75' 
                      : 'bg-emerald-50/40 dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-800/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'medication' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' :
                        item.type === 'abnormal_alert' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' :
                        item.type === 'doctor_advice' ? 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400' :
                        'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.type === 'medication' ? <Pill className="w-5 h-5" /> :
                         item.type === 'abnormal_alert' ? <AlertTriangle className="w-5 h-5" /> :
                         item.type === 'doctor_advice' ? <Sparkles className="w-5 h-5" /> :
                         <Bell className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 break-words min-w-0">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>
                            {formatDateTimeMm(item.timestamp)}
                          </span>
                        </div>

                        {/* v2.4.16 (F-M4): a doctor Q&A notification opens the
                            Q&A view. Only shown when App wired onOpenDoctorQA. */}
                        {(item.type === 'doctor_advice' || item.type === 'qa_answered') && onOpenDoctorQA && (
                          <button
                            onClick={() => {
                              markAsRead(item.id);
                              onClose();
                              onOpenDoctorQA();
                            }}
                            className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>ဆရာဝန် Q&A ကြည့်မည်</span>
                            <span aria-hidden="true">→</span>
                          </button>
                        )}

                        {/* Medication Interactive Actions */}
                        {item.type === 'medication' && !item.data?.takenAt && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button
                              onClick={() => markMedicationTaken(item.id, item.data?.medicationName || 'ဆေး')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>သောက်ပြီးပါပြီ ✅</span>
                            </button>
                            {/* v2.4.16 (F-L2): snooze choices instead of a fixed 15 min. */}
                            <span className="text-[11px] text-slate-500 font-bold">ရွှေ့ဆိုင်းမည်:</span>
                            {SNOOZE_OPTIONS_MIN.map((mins) => (
                              <button
                                key={mins}
                                onClick={() => snoozeReminder(item.id, mins)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Clock className="w-3 h-3" />
                                <span>{mins} မိနစ်</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!item.read && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          title="ဖတ်ပြီးအဖြစ် သတ်မှတ်မည်"
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(item.id)}
                        title="ဖျက်မည်"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Add / Edit Reminder Panel (v2.4.16 F-H1: one panel serves both) */}
        {showAddReminderModal && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              {editingReminder ? 'Reminder ပြင်ဆင်ရန်' : 'Reminder အသစ် သတ်မှတ်ရန်'}
            </h4>
            <form onSubmit={handleSaveReminder} className="space-y-3">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    သတိပေးမည့် ခေါင်းစဉ် (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ- သွေးပေါင်တိုင်းရန် / နေ့လယ်စာစားပြီး ဆေးသောက်ရန်"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    သတိပေးမည့် အချိန် (Time) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    အမျိုးအစား (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="medication">💊 ဆေးသောက်ရန် (Medication)</option>
                    <option value="bp">🩸 သွေးပေါင်ချိန် တိုင်းရန် (Blood Pressure)</option>
                    <option value="glucose">🍬 သကြားဓာတ် တိုင်းရန် (Blood Sugar)</option>
                    <option value="water">💧 ရေပုံမှန်သောက်ရန် (Hydration)</option>
                    <option value="exercise">🏃 လေ့ကျင့်ခန်း လုပ်ရန် (Exercise)</option>
                    <option value="doctor">👨‍⚕️ ဆရာဝန်နှင့် ပြသရန် (Doctor Appt)</option>
                    <option value="other">🔔 အခြား သတိပေးချက် (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    မှတ်ချက် / အသေးစိတ် (Notes)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- ရေတစ်ဖန်ခွက်နှင့် သောက်ပါ"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  သတိပေးမည့် ရက်များ (မရွေးရင် နေ့တိုင်း)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map(d => {
                    const on = newDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleNewDay(d)}
                        title={WEEKDAYS_MM[d]}
                        className={`w-9 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          on
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        {WEEKDAYS_SHORT_MM[d]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ရွေးထားသော ရက်: {formatDaysMm(newDays.length > 0 ? newDays : ALL_DAYS)}
                  {newDays.length === 0 && ' — ရက်မရွေးထားပါက နေ့တိုင်း သတိပေးမည်'}
                </p>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                အက်ပ် ဖွင့်ထားချိန်မှသာ သတိပေးမည် — အက်ပ် ပိတ်ထားလျှင် သတိပေးချက် တက်မလာပါ။
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReminderPanel}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingReminder ? 'ပြင်ဆင်ပြီး သိမ်းမည်' : 'သတ်မှတ်မည်'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* v2.4.16 (F-H2): confirm before deleting a custom reminder. */}
        <Modal
          isOpen={pendingDeleteReminder !== null}
          onClose={() => setPendingDeleteReminder(null)}
          title="Reminder ဖျက်မည်"
          size="sm"
        >
          <div className="p-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white break-words">“{pendingDeleteReminder?.title}”</strong>
              {' '}({pendingDeleteReminder ? formatDaysMm(pendingDeleteReminder.daysOfWeek) : ''} {pendingDeleteReminder?.time})
              ကို ဖျက်လိုက်ရင် ဒီ Reminder အတွက် နောက်ထပ် သတိပေးချက် တက်လာတော့မှာ မဟုတ်ပါဘူး။ တကယ် ဖျက်မှာလား?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingDeleteReminder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                onClick={() => {
                  if (pendingDeleteReminder) deleteCustomReminder(pendingDeleteReminder.id);
                  setPendingDeleteReminder(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                ဖျက်မည်
              </button>
            </div>
          </div>
        </Modal>

        {/* v2.4.16 (F-H2): confirm before clearing ALL notifications. */}
        <Modal
          isOpen={pendingClearAll}
          onClose={() => setPendingClearAll(false)}
          title="သတိပေးချက် အကုန် ဖျက်မည်"
          size="sm"
        >
          <div className="p-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <p className="leading-relaxed">
              သတိပေးချက် မှတ်တမ်း <strong className="text-slate-900 dark:text-white">{notifications.length} ခု</strong> လုံးကို ဖျက်လိုက်မှာလား? ဖျက်ပြီးရင် ပြန်ရတော့မှာ မဟုတ်ပါဘူး။
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingClearAll(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                onClick={() => {
                  clearAllNotifications();
                  setPendingClearAll(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                အကုန် ဖျက်မည်
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </Modal>
  );
};
