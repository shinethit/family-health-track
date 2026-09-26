import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, CustomReminder, NotificationType } from '../types/health';
import { useAuth } from './AuthContext';
import { useHealthData } from './HealthDataContext';

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
  const { profile } = useAuth();
  const { medications, bpRecords, glucoseRecords, doctorAdvices } = useHealthData();

  const [permissionGranted, setPermissionGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('family_health_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customReminders, setCustomReminders] = useState<CustomReminder[]>(() => {
    try {
      const saved = localStorage.getItem('family_health_custom_reminders');
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('family_health_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('family_health_custom_reminders', JSON.stringify(customReminders));
  }, [customReminders]);

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
  }, [sendBrowserNotification]);

  // Sync / Generate Active Medication Reminders & Vitals Reminders on mount/update
  useEffect(() => {
    const activeMeds = medications.filter(m => m.status === 'active');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if we need to generate initial reminders for active medications
    activeMeds.forEach(med => {
      const existingToday = notifications.some(
        n => n.type === 'medication' && 
             n.data?.medicationId === med.id && 
             n.timestamp.startsWith(todayStr)
      );

      if (!existingToday) {
        const noti: AppNotification = {
          id: `med-reminder-${med.id}-${todayStr}`,
          type: 'medication',
          title: `💊 ဆေးသောက်ရန် အချိန်ရောက်ပါပြီ: ${med.name}`,
          message: `${med.dosage} (${med.frequency}) - ${med.timing === 'after_meal' ? 'အစာစားပြီး' : med.timing === 'before_meal' ? 'အစာမစားမီ' : med.timing === 'bedtime' ? 'ညအိပ်ရာဝင်' : 'ပုံမှန်အချိန်'} သောက်ရန်`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          data: {
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
          }
        };
        setNotifications(prev => {
          if (prev.some(p => p.id === noti.id)) return prev;
          return [noti, ...prev];
        });
      }
    });

    // Check abnormal Blood Pressure Alert
    if (bpRecords.length > 0) {
      const latestBP = bpRecords[0];
      if (latestBP.category === 'stage2' || latestBP.category === 'crisis') {
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
            }
          };
          setNotifications(prev => [bpAlert, ...prev]);
        }
      }
    }

    // Check abnormal Glucose Alert
    if (glucoseRecords.length > 0) {
      const latestGlu = glucoseRecords[0];
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
            }
          };
          setNotifications(prev => [gluAlert, ...prev]);
        }
      }
    }

    // Check Doctor Advices
    if (doctorAdvices.length > 0) {
      const latestAdvice = doctorAdvices[0];
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
        };
        setNotifications(prev => [adviceNoti, ...prev]);
      }
    }
  }, [medications, bpRecords, glucoseRecords, doctorAdvices]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addCustomReminder = (data: Omit<CustomReminder, 'id' | 'createdAt'>) => {
    const newRem: CustomReminder = {
      ...data,
      id: 'rem-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCustomReminders(prev => [newRem, ...prev]);
    
    // Also post an immediate confirmation noti
    sendManualNotification(
      `🔔 သတိပေးချက် အသစ် သတ်မှတ်ပြီးပါပြီ`,
      `"${newRem.title}" ကို အချိန် ${newRem.time} တွင် နေ့စဉ် ပုံမှန် သတိပေးပါမည်`,
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

  const markMedicationTaken = (notificationId: string, medName: string) => {
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

  const snoozeReminder = (notificationId: string, minutes: number = 15) => {
    markAsRead(notificationId);
    setTimeout(() => {
      const target = notifications.find(n => n.id === notificationId);
      if (target) {
        sendManualNotification(
          `⏰ ပြန်လည်သတိပေးချက်: ${target.title.replace('💊 ', '').replace('✅ ', '')}`,
          `${minutes} မိနစ် ရွှေ့ဆိုင်းထားသော သတိပေးချက် ရောက်ရှိပါပြီ`,
          target.type,
          'high'
        );
      }
    }, minutes * 60 * 1000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
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
