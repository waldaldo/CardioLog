import { upsertReminder, listReminders, getReminderById } from '../db/repositories';
import Constants, { ExecutionEnvironment } from 'expo-constants';

let Notifications: any = null;

// expo-notifications no está disponible en Expo Go desde SDK 53.
// Se importa dinámicamente solo cuando la app corre como build instalada.
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
    console.warn('Error inicializando notificaciones locales:', e);
    Notifications = null;
  }
} else {
  console.log('Notificaciones desactivadas: ejecutando en Expo Go.');
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
  days?: number[];
}): Promise<number> {
  const ok = await ensurePermissions();
  if (!ok) {
    console.log('Permiso de notificaciones denegado o no soportado en este entorno');
    return -1;
  }

  // Cancela la notificación anterior antes de crear una nueva para evitar duplicados
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

// Al iniciar la app, reprograma los recordatorios habilitados que perdieron su notificationId
// (puede ocurrir si la app se reinstala o se limpia la caché de notificaciones del sistema).
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
