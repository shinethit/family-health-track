import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  Volume2, 
  Pill, 
  Activity, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { CustomReminder } from '../../types/health';

export const RemindersModule: React.FC = () => {
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
    playNotificationSound,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'reminders' | 'notifications'>('reminders');
  const [showAddModal, setShowAddReminderModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState<CustomReminder['category']>('medication');
  const [notes, setNotes] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCustomReminder({
      title: title.trim(),
      category,
      time,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setShowAddReminderModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Pure White High Contrast */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-2">
              <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>ကျန်းမာရေး သတိပေးချက်နှင့် Reminder စနစ်</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              သတိပေးချက်များ & Reminders (Health Alerts Center)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              နေ့စဉ် ဆေးသောက်ချိန်၊ သွေးပေါင်ချိန်/သကြားဓာတ် တိုင်းတာချိန်၊ ဆရာဝန်ပြသရန် ရက်ချိန်းနှင့် ရေသောက်ရန် သတိပေးချက်များကို စနစ်တကျ ပြုလုပ်နိုင်ပါသည်
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={playNotificationSound}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
              title="သတိပေးသံ စမ်းသပ်ရန်"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">အသံ စမ်းသပ်မည်</span>
            </button>

            <button
              onClick={() => setShowAddReminderModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Reminder အသစ် ပြုလုပ်မည်</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>သတ်မှတ်ထားသော Reminders ({customReminders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'notifications'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>ကျန်းမာရေး သတိပေးချက်များ ({notifications.length})</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      {!permissionGranted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">ဖုန်း/ကွန်ပျူတာ Screen ပေါ်တွင် သတိပေးစာ တက်စေလိုပါသလား?</p>
              <p className="text-[11px] text-amber-800">Browser Notification Permission ကို ခွင့်ပြုပေးခြင်းဖြင့် ဆေးသောက်ချိန်ရောက်တိုင်း အလိုအလျောက် သတိပေးစာတက်လာမည် ဖြစ်ပါသည်</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Notification Permission ဖွင့်မည်
          </button>
        </div>
      )}

      {/* Tab 1: Reminders List */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customReminders.map((rem) => {
              const getIcon = () => {
                switch (rem.category) {
                  case 'medication': return <Pill className="w-5 h-5 text-sky-600" />;
                  case 'bp': return <Activity className="w-5 h-5 text-rose-600" />;
                  case 'glucose': return <Droplets className="w-5 h-5 text-emerald-600" />;
                  case 'water': return <Droplets className="w-5 h-5 text-blue-600" />;
                  case 'doctor': return <Calendar className="w-5 h-5 text-indigo-600" />;
                  default: return <Clock className="w-5 h-5 text-amber-600" />;
                }
              };

              return (
                <div
                  key={rem.id}
                  className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 shadow-xs ${
                    rem.isActive
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 opacity-60 text-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                      {getIcon()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          {rem.time}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {rem.category === 'medication' ? 'ဆေးသောက်ရန်' :
                           rem.category === 'bp' ? 'သွေးပေါင်ချိန်' :
                           rem.category === 'glucose' ? 'ဆီးချိုစစ်ရန်' :
                           rem.category === 'water' ? 'ရေသောက်ရန်' : 'အထွေထွေ'}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-2">
                        {rem.title}
                      </h3>
                      {rem.notes && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {rem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => toggleReminderActive(rem.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        rem.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          rem.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => deleteCustomReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Notifications History */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">
              ကျန်းမာရေး သတိပေးချက် မှတ်တမ်းများ ({notifications.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                အကုန် ဖတ်ပြီးအဖြစ် မှတ်သားမည်
              </button>
              <span>•</span>
              <button
                onClick={clearAllNotifications}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                အကုန် ဖျက်မည်
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-slate-700 space-y-2">
              <Bell className="w-12 h-12 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-900">သတိပေးချက် မရှိသေးပါ</p>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                သွေးပေါင်ချိန်/သကြားဓာတ် လွန်ကဲခြင်းများနှင့် ဆေးသောက်ချိန်များ ရောက်သည့်အခါ သတိပေးချက်များ ဤနေရာတွင် တက်လာမည် ဖြစ်ပါသည်
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 shadow-xs ${
                    n.read
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-emerald-50/60 border-emerald-200 text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 mt-0.5">
                      {n.type === 'abnormal_alert' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      ) : n.type === 'medication' ? (
                        <Pill className="w-5 h-5 text-sky-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-amber-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        {new Date(n.timestamp).toLocaleString('my-MM')}
                      </span>

                      {n.type === 'medication' && n.data?.medicationName && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => markMedicationTaken(n.id, n.data!.medicationName!)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ဆေး သောက်ပြီးပါပြီ</span>
                          </button>

                          <button
                            onClick={() => snoozeReminder(n.id, 15)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-200"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>၁၅ မိနစ် ရွှေ့မည်</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        title="ဖတ်ပြီးအဖြစ် မှတ်သားမည်"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-600" />
                <span>Reminder အသစ် ဖန်တီးမည်</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  သတိပေးချက် ခေါင်းစဉ် *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- ညနေ ၇ နာရီ သွေးတိုးကျဆေး သောက်ရန်"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    အမျိုးအစား
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="medication">💊 ဆေးဝါး သောက်ရန်</option>
                    <option value="bp">🩺 သွေးပေါင်ချိန် တိုင်းရန်</option>
                    <option value="glucose">🩸 သွေးချို စစ်ဆေးရန်</option>
                    <option value="water">💧 ရေသောက်ရန်</option>
                    <option value="doctor">🏥 ဆရာဝန်ပြသရန်</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    သတိပေးမည့် အချိန် *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  မှတ်ချက် (အပိုဆောင်း လမ်းညွှန်)
                </label>
                <textarea
                  rows={2}
                  placeholder="ဥပမာ- အစာစားပြီးမှ သောက်ပါ"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
