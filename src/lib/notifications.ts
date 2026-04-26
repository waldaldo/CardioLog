// src/lib/notifications.ts — Expo local notifications for reminders
import { upsertReminder, listReminders, getReminderById } from '../db/repositories';

import Constants, { ExecutionEnvironment } from 'expo-constants';

let Notifications: any = null;

// Only require expo-notifications if we are NOT running in Expo Go
// Since SDK 53, requiring it in Expo Go on Android throws a fatal error.
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient && Constants.appOwnership !== 'expo') {
  try {
    const mod = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    Notifications = mod;
  } catch (e) {
    console.warn("Error inicializando notificaciones locales:", e);
    Notifications = null;
  }
} else {
  console.log("Notificaciones desactivadas: Ejecutando en Expo Go.");
}

export async function ensurePermissions(): Promise<boolean> {
  if (!Notifications) return false;
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const r = await Notifications.requestPermissionsAsync();
  return r.status === 'granted';
}

export async function scheduleReminder(opts: {
  id?: number;
  timeHHMM: string;   // "08:00"
  label: string;
  days?: number[];    // 1=Sun..7=Sat per expo; we'll schedule each
}): Promise<number> {
  const ok = await ensurePermissions();
  if (!ok) {
    console.log('Permiso de notificaciones denegado o no soportado en este entorno');
    return -1; // Return dummy ID if notifications aren't supported
  }

  // Cancel any existing notification for this reminder to avoid duplicates
  if (opts.id) {
    const existing = await getReminderById(opts.id);
    if (existing?.notification_id) {
      await cancelReminder(existing.notification_id);
    }
  }

  const parts = opts.timeHHMM.split(':').map(Number);
  const h = parts[0], m = parts[1];
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error(`Formato de hora inválido: "${opts.timeHHMM}". Se esperaba HH:MM.`);
  }
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'CardioLog',
      body: opts.label,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: h,
      minute: m,
    } as any,
  });

  const id = await upsertReminder({
    id: opts.id,
    time_hhmm: opts.timeHHMM,
    label: opts.label,
    days_mask: 127,
    enabled: true,
    notification_id: notifId,
  });
  return id;
}

export async function cancelReminder(notificationId: string | null) {
  if (!notificationId || !Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function syncAllFromDb() {
  const rows = await listReminders();
  for (const r of rows) {
    if (r.enabled && !r.notification_id) {
      await scheduleReminder({
        id: r.id, timeHHMM: r.time_hhmm, label: r.label,
      });
    }
  }
}
