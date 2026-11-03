import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification, CustomReminder, NotificationType } from '../types/health';
import { useAuth } from './AuthContext';
import { useHealthData } from './HealthDataContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  customReminders: CustomReminder[];
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addCustomReminder: (data: Omit<CustomReminder, 'id' | 'createdAt'>) => void;
  deleteCustomReminder: (id: string) => void;
  toggleReminderActive: (id: string) => void;
  markMedicationTaken: (notificationId: string, medName: string) => void;
  snoozeReminder: (notificationId: string, minutes?: number) => void;
  sendManualNotification: (title: string, message: string, type?: NotificationType, priority?: 'low' | 'normal' | 'high' | 'urgent') => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Play a pleasant chime using Web Audio API (no external asset needed)
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio might be blocked until user gesture, ignore safely
  }
};

const DEFAULT_REMINDERS: CustomReminder[] = [
  {
    id: 'rem-bp-morning',
    title: 'နံနက်ခင်း သွေးပေါင်ချိန် တိုင်းရန် သတိပေးချက်',
    category: 'bp',
    time: '08:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    notes: 'မနက်စာမစားမီ ၁၀ မိနစ် ငြိမ်သက်စွာထိုင်ပြီးမှ တိုင်းပါ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-glucose-morning',
    title: 'မနက်စာမစားမီ သွေးတွင်းသကြားဓာတ် (Fasting Glucose) စစ်ရန်',
    category: 'glucose',
    time: '07:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    notes: 'အစာမစားမီ ၈ နာရီ ခြားပြီးမှ စစ်ဆေးပါ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-water-afternoon',
    title: 'ရေပုံမှန်သောက်ရန် (Hydration Reminder)',
    category: 'water',
    time: '14:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    notes: 'ကျောက်ကပ်နှင့် သွေးလည်ပတ်မှုကောင်းစေရန် ရေတစ်ဖန်ခွက် သောက်ပါ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-bp-evening',
    title: 'ညနေခင်း သွေးပေါင်ချိန် တိုင်းရန် သတိပေးချက်',
    category: 'bp',
    time: '19:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    notes: 'ညစာစားပြီး အနားယူချိန်တွင် တိုင်းပါ',
    createdAt: new Date().toISOString(),
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAdmin } = useAuth();
  const { medications, bpRecords, glucoseRecords, doctorAdvices, doctorQuestions, toggleMedicationDoseTaken } = useHealthData();
  const { showToast } = useToast();

  const [permissionGranted, setPermissionGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);

  // Due-reminder ticker (v2.4.8 A1): which custom reminders already fired, as
  // { reminderId: 'YYYY-MM-DD' }. Persisted per user so a reload inside the
  // same minute does not re-fire. Only today's entries are kept.
  const [firedToday, setFiredToday] = useState<Record<string, string>>({});

  // Snoozed notifications, persisted per user (v2.4.11 6.5): the old snooze
  // was an in-memory setTimeout, lost on reload — a snoozed reminder simply
  // never came back. { notificationId: { until, title, type } } in
  // localStorage; an interval re-fires entries whose time has come.
  const [snoozed, setSnoozed] = useState<Record<string, { until: string; title: string; type: NotificationType }>>({});

  const localDateStr = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // A medication with no daily schedule (taken only when needed) must never
  // get a daily reminder — its frequency text contains 'လိုအပ်သည့်အခါ' / PRN.
  const isPrnMedication = (m: { frequency?: string }): boolean =>
    /လိုအပ်သည့်အခါ|PRN/i.test(m.frequency || '');

  const timingLabelMm = (timing: string): string =>
    timing === 'after_meal' ? 'အစာစားပြီး'
      : timing === 'before_meal' ? 'အစာမစားမီ'
      : timing === 'bedtime' ? 'ညအိပ်ရာဝင်'
      : timing === 'with_meal' ? 'အစာစားနေစဉ်'
      : 'ပုံမှန်အချိန်';

  // Load user-scoped notifications & reminders when user logs in or switches
  useEffect(() => {
    if (!profile?.id) {
      setNotifications([]);
      setCustomReminders(DEFAULT_REMINDERS);
      return;
    }

    const notiKey = `family_health_notifications_${profile.id}`;
    const remKey = `family_health_custom_reminders_${profile.id}`;

    try {
      const savedNotis = localStorage.getItem(notiKey);
      if (savedNotis) {
        const parsed: AppNotification[] = JSON.parse(savedNotis);
        // Admin must never see or receive medication reminders
        setNotifications(isAdmin ? parsed.filter(n => n.type !== 'medication') : parsed);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }

    try {
      const savedRems = localStorage.getItem(remKey);
      if (savedRems) {
        setCustomReminders(JSON.parse(savedRems));
      } else {
        // Default reminders are for patients, not admin
        setCustomReminders(isAdmin ? [] : DEFAULT_REMINDERS);
      }
    } catch {
      setCustomReminders(isAdmin ? [] : DEFAULT_REMINDERS);
    }
  }, [profile?.id, isAdmin]);

  // Save to LocalStorage scoped by user ID
  useEffect(() => {
    if (!profile?.id) return;
    const notiKey = `family_health_notifications_${profile.id}`;
    // Admin does not store medication notifications
    const toSave = isAdmin ? notifications.filter(n => n.type !== 'medication') : notifications;
    localStorage.setItem(notiKey, JSON.stringify(toSave));
  }, [notifications, profile?.id, isAdmin]);

  // Server notifications addressed to this user (v2.4.10, audit 10): an
  // admin answering a doctor question writes a 'qa_answered' doc to the
  // notifications collection — localStorage alone cannot reach another
  // device. Two queries (by uid and by email) because a family member's
  // question carries a family doc id as userId and the owner's email as
  // recipientEmail. Merged by doc id; server ids are tracked so read/delete
  // can sync back to Firestore, and docs that disappear from Firestore
  // (deleted elsewhere) are removed locally too.
  const serverNotiIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!profile?.id) return;
    const byQuery: { byUid: Set<string>; byEmail: Set<string> } = { byUid: new Set(), byEmail: new Set() };
    const mergeSnapshot = (key: 'byUid' | 'byEmail', docs: any[]) => {
      byQuery[key] = new Set(docs.map(d => d.id));
      const union = new Set([...byQuery.byUid, ...byQuery.byEmail]);
      const mapped: AppNotification[] = docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: (data.type || 'qa_answered') as NotificationType,
          title: data.title || 'သတိပေးချက် အသစ်',
          message: data.message || '',
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
          read: !!data.read,
          priority: (data.priority || 'normal') as AppNotification['priority'],
          data: data.data || {},
        };
      });
      setNotifications(prev => {
        const prevServer = serverNotiIds.current;
        // Drop server notifications that no longer exist in Firestore.
        const kept = prev.filter(n => !prevServer.has(n.id) || union.has(n.id));
        const byId = new Map(kept.map(n => [n.id, n]));
        // Once read locally, stay read (the Firestore update catches up).
        mapped.forEach(n => byId.set(n.id, { ...n, read: byId.get(n.id)?.read || n.read }));
        serverNotiIds.current = union;
        return [...byId.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });
    };
    const unsubs: Array<() => void> = [];
    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', profile.id)),
      snap => mergeSnapshot('byUid', snap.docs),
      err => console.warn('Server notifications (uid) listener error:', err),
    ));
    if (profile.email) {
      unsubs.push(onSnapshot(
        query(collection(db, 'notifications'), where('recipientEmail', '==', profile.email)),
        snap => mergeSnapshot('byEmail', snap.docs),
        err => console.warn('Server notifications (email) listener error:', err),
      ));
    }
    return () => unsubs.forEach(u => u());
  }, [profile?.id, profile?.email]);

  useEffect(() => {
    if (!profile?.id) return;
    const remKey = `family_health_custom_reminders_${profile.id}`;
    localStorage.setItem(remKey, JSON.stringify(customReminders));
  }, [customReminders, profile?.id]);

  // Load / save the fired-today map for this user (pruned to today's date)
  useEffect(() => {
    if (!profile?.id) {
      setFiredToday({});
      return;
    }
    try {
      const saved = localStorage.getItem(`family_health_reminders_fired_${profile.id}`);
      if (!saved) {
        setFiredToday({});
        return;
      }
      const parsed: Record<string, string> = JSON.parse(saved);
      const today = localDateStr(new Date());
      const pruned: Record<string, string> = {};
      Object.entries(parsed).forEach(([k, v]) => {
        if (v === today) pruned[k] = v;
      });
      setFiredToday(pruned);
    } catch {
      setFiredToday({});
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    const today = localDateStr(new Date());
    const pruned: Record<string, string> = {};
    Object.entries(firedToday).forEach(([k, v]) => {
      if (v === today) pruned[k] = v;
    });
    localStorage.setItem(`family_health_reminders_fired_${profile.id}`, JSON.stringify(pruned));
  }, [firedToday, profile?.id]);

  // Load / save the snoozed-until map for this user
  useEffect(() => {
    if (!profile?.id) {
      setSnoozed({});
      return;
    }
    try {
      const saved = localStorage.getItem(`family_health_snoozed_${profile.id}`);
      setSnoozed(saved ? JSON.parse(saved) : {});
    } catch {
      setSnoozed({});
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    try {
      localStorage.setItem(`family_health_snoozed_${profile.id}`, JSON.stringify(snoozed));
    } catch { /* private mode etc. — snooze just won't survive a reload */ }
  }, [snoozed, profile?.id]);


  const requestPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        const granted = res === 'granted';
        setPermissionGranted(granted);
        return granted;
      } catch (e) {
        console.warn('Error requesting notification permission:', e);
        return false;
      }
    }
    return false;
  };

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  }, []);

  const sendManualNotification = useCallback((
    title: string, 
    message: string, 
    type: NotificationType = 'custom_reminder', 
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    data?: any
  ) => {
    // Admin does NOT receive medication notifications
    if (isAdmin && type === 'medication') {
      return;
    }

    const newNoti: AppNotification = {
      id: 'noti-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
      data
    };

    setNotifications(prev => [newNoti, ...prev.slice(0, 49)]); // keep last 50
    playChime();
    sendBrowserNotification(title, message);
  }, [sendBrowserNotification, isAdmin]);

  // Re-fire snoozed notifications whose time has come (checked every 30s
  // and on mount, so a reload still brings them back). An entry whose
  // notification was deleted meanwhile is dropped without firing. Entries
  // more than 60 minutes overdue are dropped silently — re-firing a
  // reminder many hours late would be noise, not help.
  useEffect(() => {
    if (!profile?.id) return;
    const fireDue = () => {
      const now = Date.now();
      const due = Object.entries(snoozed).filter(([, s]) => {
        const untilMs = new Date(s.until).getTime();
        return !Number.isNaN(untilMs) && untilMs <= now;
      });
      if (due.length === 0) return;
      due.forEach(([id, s]) => {
        // Only re-fire if less than 60 minutes overdue (see above).
        if (now - new Date(s.until).getTime() <= 60 * 60 * 1000) {
          const target = notifications.find(n => n.id === id);
          if (target) {
            sendManualNotification(
              `⏰ ပြန်လည်သတိပေးချက်: ${s.title}`,
              `ရွှေ့ဆိုင်းထားသော သတိပေးချက် ရောက်ရှိပါပြီ`,
              s.type,
              'high'
            );
          }
        }
      });
      setSnoozed(prev => {
        const next = { ...prev };
        due.forEach(([id]) => delete next[id]);
        return next;
      });
    };
    fireDue();
    const id = setInterval(fireDue, 30 * 1000);
    return () => clearInterval(id);
  }, [profile?.id, snoozed, notifications, sendManualNotification]);

  // Due-reminder check (v2.4.8 A1, extended v2.4.10): fire active custom
  // reminders whose set time (HH:MM) matches the current minute and that
  // have not fired today — plus medication dose-time reminders: an active,
  // scheduled medication with a doseTime fires at that minute, once per day
  // (same fired-today dedup, keyed `med-<id>`). PRN meds, ended courses and
  // admins never get a dose-time reminder.
  const checkDueReminders = useCallback(() => {
    if (!profile?.id) return;
    const now = new Date();
    const todayStr = localDateStr(now);
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = now.getDay();
    const due = customReminders.filter(
      (r) =>
        r.isActive &&
        r.time === hhmm &&
        (!r.daysOfWeek || r.daysOfWeek.includes(day)) &&
        firedToday[r.id] !== todayStr
    );
    due.forEach((rem) => {
      sendManualNotification(
        `🔔 သတိပေးချက် အချိန်ရောက်ပါပြီ: ${rem.title}`,
        rem.notes
          ? `${rem.notes} (အချိန် ${rem.time})`
          : `အချိန် ${rem.time} တွင် သတ်မှတ်ထားသော သတိပေးချက် ရောက်ရှိပါပြီ`,
        'custom_reminder',
        'normal'
      );
    });

    let dueMeds: typeof medications = [];
    if (!isAdmin) {
      dueMeds = medications.filter(
        (m) =>
          m.status === 'active' &&
          !!m.doseTime &&
          m.doseTime === hhmm &&
          !isPrnMedication(m) &&
          (!m.endDate || m.endDate >= todayStr) &&
          firedToday[`med-${m.id}`] !== todayStr
      );
      dueMeds.forEach((med) => {
        sendManualNotification(
          `💊 ဆေးသောက်ရန် အချိန်ရောက်ပါပြီ: ${med.name}`,
          `${med.dosage} (${med.frequency}) - ${timingLabelMm(med.timing)} သောက်ရန်`,
          'medication',
          'high',
          {
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            userId: profile.id,
          }
        );
      });
    }

    if (due.length === 0 && dueMeds.length === 0) return;
    setFiredToday((prev) => {
      const next = { ...prev };
      due.forEach((rem) => {
        next[rem.id] = todayStr;
      });
      dueMeds.forEach((med) => {
        next[`med-${med.id}`] = todayStr;
      });
      return next;
    });
  }, [profile?.id, customReminders, firedToday, sendManualNotification, medications, isAdmin]);

  // Tick every minute while the app is open so custom reminders fire at
  // their set time. Runs once immediately on (re)mount too, so opening the
  // app exactly at a reminder minute still fires. Cleaned up on unmount.
  // NOTE: this can only work while the app is open — real push while closed
  // needs FCM + a server (out of scope). The confirmation copy in
  // addCustomReminder and the Reminders module say so honestly.
  useEffect(() => {
    if (!profile?.id) return;
    checkDueReminders();
    const id = setInterval(checkDueReminders, 60 * 1000);
    return () => clearInterval(id);
  }, [profile?.id, checkDueReminders]);

  // Sync / Generate Active Medication Reminders & Vitals Reminders on mount/update
  // ONLY for respective patients. Admin NEVER receives medication reminders.
  useEffect(() => {
    // If not logged in or if user is Admin, DO NOT generate medication or personal vital reminders!
    if (!profile || isAdmin) {
      return;
    }

    // Only active medications belonging to THIS logged-in patient
    const activeMeds = medications.filter(
      m => m.status === 'active' && (!m.userId || m.userId === profile.id)
    );
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLocal = localDateStr(new Date());

    // Check if we need to generate initial reminders for active medications.
    // Meds WITH a doseTime are handled by the 1-minute ticker at that exact
    // time instead; PRN meds have no daily schedule; ended courses get
    // nothing. Meds WITHOUT a doseTime keep the on-open reminder, but its
    // title must not falsely claim the dose time has arrived (v2.4.10 6.1).
    activeMeds.forEach(med => {
      if (med.doseTime || isPrnMedication(med)) return;
      if (med.endDate && med.endDate < todayLocal) return;
      const existingToday = notifications.some(
        n => n.type === 'medication' &&
             n.data?.medicationId === med.id &&
             n.timestamp.startsWith(todayStr)
      );

      if (!existingToday) {
        const noti: AppNotification = {
          id: `med-reminder-${med.id}-${todayStr}`,
          type: 'medication',
          title: `💊 ဆေးသောက်ရန် သတိပေးချက်: ${med.name}`,
          message: `${med.dosage} (${med.frequency}) - ${timingLabelMm(med.timing)} သောက်ရန်`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          data: {
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            userId: profile.id
          }
        };
        setNotifications(prev => {
          if (prev.some(p => p.id === noti.id)) return prev;
          return [noti, ...prev];
        });
      }
    });

    // Check abnormal Blood Pressure Alert for THIS patient
    if (bpRecords.length > 0) {
      const latestBP = bpRecords[0];
      if (latestBP.userId === profile.id && (latestBP.category === 'stage2' || latestBP.category === 'crisis')) {
        const alertId = `alert-bp-${latestBP.id}`;
        const hasAlert = notifications.some(n => n.id === alertId);
        if (!hasAlert) {
          const bpAlert: AppNotification = {
            id: alertId,
            type: 'abnormal_alert',
            title: `⚠️ သွေးတိုး သတိပေးချက် (${latestBP.systolic}/${latestBP.diastolic} mmHg)`,
            message: `နောက်ဆုံးတိုင်းတာထားသော သွေးပေါင်ချိန်သည် ပုံမှန်ထက် မြင့်တက်နေပါသည် (${latestBP.category === 'crisis' ? 'အရေးပေါ် သွေးတိုးအဆင့်' : 'အဆင့် ၂ သွေးတိုး'})။ ဆေးမှန်မှန်သောက်ပြီး လိုအပ်ပါက ဆရာဝန်နှင့် ပြသပါ`,
            timestamp: latestBP.createdAt || new Date().toISOString(),
            read: false,
            priority: 'urgent',
            data: {
              vitalType: 'bp',
              value: `${latestBP.systolic}/${latestBP.diastolic}`,
              userId: profile.id
            }
          };
          setNotifications(prev => [bpAlert, ...prev]);
        }
      }
    }

    // Check abnormal Glucose Alert for THIS patient
    if (glucoseRecords.length > 0) {
      const latestGlu = glucoseRecords[0];
      if (latestGlu.userId === profile.id) {
        const gluVal = latestGlu.glucoseValue || latestGlu.value || 0;
        if (latestGlu.status === 'diabetic' || latestGlu.status === 'high_danger' || latestGlu.status === 'low') {
          const alertId = `alert-glu-${latestGlu.id}`;
          const hasAlert = notifications.some(n => n.id === alertId);
          if (!hasAlert) {
            const gluAlert: AppNotification = {
              id: alertId,
              type: 'abnormal_alert',
              title: latestGlu.status === 'low' 
                ? `⚠️ သွေးတွင်းသကြားဓာတ် လျော့နည်းနေပါသည် (${gluVal} mg/dL)`
                : `⚠️ သွေးတွင်းသကြားဓာတ် မြင့်မားနေပါသည် (${gluVal} mg/dL)`,
              message: latestGlu.status === 'low'
                ? 'သကြားဓာတ် အလွန်ကျဆင်းခြင်း (Hypoglycemia) ဖြစ်နိုင်သဖြင့် အချိုရည် သို့မဟုတ် သကြားလုံး စားသုံးပါ'
                : 'သွေးတွင်းသကြားဓာတ် မြင့်မားနေပါသဖြင့် အချိုဓာတ်လျှော့စားပြီး ဆရာဝန်ညွှန်ကြားချက်အတိုင်း ဆေးသောက်ပါ',
              timestamp: latestGlu.createdAt || new Date().toISOString(),
              read: false,
              priority: 'high',
              data: {
                vitalType: 'glucose',
                value: `${gluVal} mg/dL`,
                userId: profile.id
              }
            };
            setNotifications(prev => [gluAlert, ...prev]);
          }
        }
      }
    }

    // Check Doctor Advices for THIS patient
    if (doctorAdvices.length > 0) {
      const latestAdvice = doctorAdvices[0];
      if (latestAdvice.userId === profile.id) {
        const adviceId = `advice-noti-${latestAdvice.id}`;
        if (!notifications.some(n => n.id === adviceId)) {
          const adviceNoti: AppNotification = {
            id: adviceId,
            type: 'doctor_advice',
            title: `👨‍⚕️ ဆရာဝန်၏ လမ်းညွှန်ချက် အသစ်`,
            message: `${latestAdvice.advice.substring(0, 100)}${latestAdvice.advice.length > 100 ? '...' : ''}`,
            timestamp: latestAdvice.createdAt || new Date().toISOString(),
            read: false,
            priority: 'normal',
            data: { userId: profile.id }
          };
          setNotifications(prev => [adviceNoti, ...prev]);
        }
      }
    }
  }, [profile, isAdmin, medications, bpRecords, glucoseRecords, doctorAdvices]);

  // Admin-specific notifications (e.g. pending doctor questions from patients needing answer)
  useEffect(() => {
    if (!isAdmin) return;

    if (doctorQuestions && doctorQuestions.length > 0) {
      const pendingQuestions = doctorQuestions.filter(q => q.status === 'pending');
      if (pendingQuestions.length > 0) {
        const latestQ = pendingQuestions[0];
        const qNotiId = `admin-qa-${latestQ.id}`;
        if (!notifications.some(n => n.id === qNotiId)) {
          const qNoti: AppNotification = {
            id: qNotiId,
            type: 'doctor_advice',
            title: `❓ အသုံးပြုသူမေးမြန်းချက် အသစ် (${pendingQuestions.length} ခု စောင့်ဆိုင်းနေပါသည်)`,
            message: `${latestQ.patientName || 'အသုံးပြုသူ'}: "${(latestQ.questionDetails || latestQ.title).substring(0, 75)}..."`,
            timestamp: latestQ.createdAt || new Date().toISOString(),
            read: false,
            priority: 'high',
          };
          setNotifications(prev => [qNoti, ...prev]);
        }
      }
    }
  }, [isAdmin, doctorQuestions]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Server notifications sync their read state back to Firestore so the
    // badge stays read on the user's other devices too.
    if (serverNotiIds.current.has(id)) {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(e =>
        console.warn('Error marking server notification as read:', e));
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    serverNotiIds.current.forEach(id => {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(e =>
        console.warn('Error marking server notification as read:', e));
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (serverNotiIds.current.has(id)) {
      serverNotiIds.current.delete(id);
      deleteDoc(doc(db, 'notifications', id)).catch(e =>
        console.warn('Error deleting server notification:', e));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    serverNotiIds.current.forEach(id => {
      deleteDoc(doc(db, 'notifications', id)).catch(e =>
        console.warn('Error deleting server notification:', e));
    });
    serverNotiIds.current.clear();
  };

  const addCustomReminder = (data: Omit<CustomReminder, 'id' | 'createdAt'>) => {
    const newRem: CustomReminder = {
      ...data,
      id: 'rem-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCustomReminders(prev => [newRem, ...prev]);
    
    // Post confirmation notification — honest wording (v2.4.8 A1): reminders
    // only fire while the app is open; they cannot ring when it is closed.
    sendManualNotification(
      `🔔 သတိပေးချက် အသစ် သတ်မှတ်ပြီးပါပြီ`,
      `"${newRem.title}" ကို နေ့စဉ် ${newRem.time} တွင် သတိပေးပါမည်။ အက်ပ် ဖွင့်ထားချိန်မှသာ သတိပေးနိုင်ပြီး အက်ပ် ပိတ်ထားချိန်တွင် သတိပေးချက် တက်မလာနိုင်ပါ။`,
      'custom_reminder',
      'normal'
    );
  };

  const deleteCustomReminder = (id: string) => {
    setCustomReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminderActive = (id: string) => {
    setCustomReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  // Mark a medication dose as taken FROM a notification (v2.4.10 6.2):
  // previously this only rewrote the notification text and never recorded
  // the dose anywhere. Now it first logs the dose for real via
  // toggleMedicationDoseTaken (today, dose 0) and only then rewrites the
  // notification as taken. The medication id comes from the notification's
  // own data payload (the on-open and dose-time reminders both carry it);
  // without it there is nothing to log, so the notification is only
  // rewritten as before. No circular import: this context already depends
  // on HealthDataContext (useHealthData), which does not import this file.
  // v2.4.11 (e): toggleMedicationDoseTaken now reports success — if the
  // write failed, the notification stays NOT taken and the user gets an
  // error toast instead of a false "သောက်ပြီးပါပြီ".
  const markMedicationTaken = async (notificationId: string, medName: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    const medId = target?.data?.medicationId;
    if (medId) {
      const todayStr = localDateStr(new Date());
      let ok = false;
      try {
        ok = await toggleMedicationDoseTaken(medId, todayStr, true, 0, medName);
      } catch (e) {
        console.warn('Failed to log dose from notification:', e);
      }
      if (!ok) {
        showToast('ဆေးသောက်မှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်နှိပ်ပါ။', 'error');
        return;
      }
    }
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        return {
          ...n,
          read: true,
          title: `✅ သောက်ပြီးပါပြီ: ${medName}`,
          message: `${medName} ကို ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} တွင် သောက်သုံးပြီးကြောင်း မှတ်တမ်းတင်ပြီးပါပြီ`,
          data: {
            ...n.data,
            takenAt: new Date().toISOString(),
          }
        };
      }
      return n;
    }));
  };

  // Snooze a notification: record it persistently (v2.4.11 6.5) instead of
  // an in-memory setTimeout that died on reload. The re-fire is handled by
  // the snooze interval above, which also survives a page reload.
  const snoozeReminder = (notificationId: string, minutes: number = 15) => {
    const target = notifications.find(n => n.id === notificationId);
    if (!target) return;
    markAsRead(notificationId);
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const cleanTitle = target.title.replace('💊 ', '').replace('✅ ', '');
    setSnoozed(prev => ({ ...prev, [notificationId]: { until, title: cleanTitle, type: target.type } }));
  };

  // For Admin: never include medication reminders in notifications or unreadCount
  const visibleNotifications = notifications.filter(n => {
    if (isAdmin && n.type === 'medication') return false;
    return true;
  });

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications: visibleNotifications,
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
      playNotificationSound: playChime,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
