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
  Droplets
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { CustomReminder } from '../../types/health';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
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
    deleteCustomReminder,
    toggleReminderActive,
    markMedicationTaken,
    snoozeReminder,
    sendManualNotification,
    playNotificationSound,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'meds' | 'alerts' | 'reminders'>('all');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // New Reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newCategory, setNewCategory] = useState<CustomReminder['category']>('medication');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCustomReminder({
      title: newTitle.trim(),
      category: newCategory,
      time: newTime,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddReminderModal(false);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'meds') return n.type === 'medication';
    if (activeTab === 'alerts') return n.type === 'abnormal_alert';
    if (activeTab === 'reminders') return n.type === 'custom_reminder' || n.type === 'vital_check';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
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
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              onClick={() => setShowAddReminderModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reminder အသစ်</span>
            </button>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  title="အားလုံး ဖတ်ပြီးအဖြစ် သတ်မှတ်မည်"
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 text-xs transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAllNotifications}
                  title="အားလုံး ရှင်းလင်းမည်"
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

              {customReminders.map(rem => (
                <div 
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    rem.isActive 
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' 
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      rem.category === 'medication' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600' :
                      rem.category === 'bp' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' :
                      rem.category === 'glucose' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' :
                      rem.category === 'water' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600' :
                      'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                    }`}>
                      {rem.category === 'medication' ? <Pill className="w-5 h-5" /> :
                       rem.category === 'bp' ? <Activity className="w-5 h-5" /> :
                       rem.category === 'water' ? <Droplets className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{rem.title}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {rem.time}
                        </span>
                      </div>
                      {rem.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rem.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <button
                      onClick={() => deleteCustomReminder(rem.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                <button
                  onClick={() => sendManualNotification('💊 အစမ်းသတိပေးချက်', 'အစာစားပြီး သွေးတိုးဆေး ၁ လုံး သောက်ရန် အချိန်ရောက်ပါပြီ', 'medication', 'high')}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100"
                >
                  🔔 နမူနာ Noti တစ်ခု စမ်းသပ်ကြည့်မည်
                </button>
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
                    <div className="flex items-start gap-3">
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

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(item.timestamp).toLocaleDateString('my-MM', { month: 'short', day: 'numeric' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Medication Interactive Actions */}
                        {item.type === 'medication' && !item.data?.takenAt && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => markMedicationTaken(item.id, item.data?.medicationName || 'ဆေး')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>သောက်ပြီးပါပြီ ✅</span>
                            </button>
                            <button
                              onClick={() => snoozeReminder(item.id, 15)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3 h-3" />
                              <span>၁၅ မိနစ် ရွှေ့ဆိုင်းမည်</span>
                            </button>
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

        {/* Add Reminder Modal Overlay */}
        {showAddReminderModal && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Reminder အသစ် သတ်မှတ်ရန်
            </h4>
            <form onSubmit={handleAddReminder} className="space-y-3">
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

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  သတ်မှတ်မည်
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
