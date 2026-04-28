export const I18N = {
  es: {
    appName: 'CardioLog',
    home: 'Inicio', record: 'Registro', history: 'Historial', profile: 'Perfil',
    greeting: 'Hola', lastReading: 'Última medición',
    addReading: 'Registrar medición',
    systolic: 'Sistólica', diastolic: 'Diastólica', pulse: 'Pulso',
    mmHg: 'mmHg', bpm: 'lpm',
    weekAvg: 'Promedio 7 días', monthAvg: 'Promedio 30 días',
    recommendations: 'Recomendaciones', viewAll: 'Ver todas',
    weekly: 'Semanal', monthly: 'Mensual',
    save: 'Guardar', cancel: 'Cancelar', back: 'Atrás',
    morning: 'Mañana', evening: 'Noche', afternoon: 'Tarde',
    categories: 'Clasificación OMS',
    reminders: 'Recordatorios',
    backup: 'Respaldo en Google Drive',
    settings: 'Ajustes',
  },
  en: {
    appName: 'CardioLog',
    home: 'Home', record: 'Record', history: 'History', profile: 'Profile',
    greeting: 'Hello', lastReading: 'Last reading',
    addReading: 'Log a reading',
    systolic: 'Systolic', diastolic: 'Diastolic', pulse: 'Pulse',
    mmHg: 'mmHg', bpm: 'bpm',
    weekAvg: '7-day average', monthAvg: '30-day average',
    recommendations: 'Recommendations', viewAll: 'View all',
    weekly: 'Weekly', monthly: 'Monthly',
    save: 'Save', cancel: 'Cancel', back: 'Back',
    morning: 'Morning', evening: 'Evening', afternoon: 'Afternoon',
    categories: 'WHO categories',
    reminders: 'Reminders',
    backup: 'Google Drive backup',
    settings: 'Settings',
  },
};

export type Lang = 'es' | 'en';

export function avg(arr: any[], key: string): number {
  if (!arr.length) return 0;
  const valid = arr.filter(r => typeof r[key] === 'number' && !isNaN(r[key]));
  if (!valid.length) return 0;
  return Math.round(valid.reduce((s, r) => s + r[key], 0) / valid.length);
}

export function daysAgo(arr: { ts: string }[], days: number) {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return arr.filter(r => new Date(r.ts).getTime() >= cutoff);
}
