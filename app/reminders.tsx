// app/reminders.tsx

import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { listReminders, upsertReminder, Reminder } from '@/db/repositories';
import { scheduleReminder, cancelReminder } from '@/lib/notifications';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function Reminders() {
  const { t } = useLang();
  const { colors } = useTheme();
  const [items, setItems] = useState<Reminder[]>([]);
  const refresh = useCallback(async () => setItems(await listReminders()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (r: Reminder) => {
    try {
      if (r.enabled) {
        await cancelReminder(r.notification_id);
        await upsertReminder({ ...r, enabled: false, notification_id: null });
      } else {
        await scheduleReminder({ id: r.id, timeHHMM: r.time_hhmm, label: r.label });
      }
      await refresh();
    } catch (e: any) {
      Alert.alert(t('saveError'), e.message);
    }
  };

  const addDefaults = async () => {
    try {
      await scheduleReminder({ timeHHMM: '08:00', label: t('morningMeasurement') });
      await scheduleReminder({ timeHHMM: '21:00', label: t('eveningMeasurement') });
      await refresh();
    } catch (e: any) {
      Alert.alert(t('saveError'), e.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 20 }}>←</Text>
    </Pressable>
    <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginLeft: 12 }}>{t('reminders')}</Text>
      </View>

      {items.map(r => (
        <View key={r.id} style={{
      padding: 16, marginBottom: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: r.enabled ? '#00f0ff' : colors.textMuted, fontSize: 28, fontWeight: '800' }}>
              {r.time_hhmm}
            </Text>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{r.label}</Text>
          </View>
          <Switch value={r.enabled} onValueChange={() => toggle(r)} trackColor={{ true: '#00f0ff' }}/>
        </View>
      ))}

      <Pressable onPress={addDefaults}
                 style={{
                   marginTop: 6, padding: 14, borderRadius: 14,
                   backgroundColor: 'rgba(0,240,255,0.08)',
                   borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)',
                   alignItems: 'center',
                 }}>
        <Text style={{ color: '#00f0ff', fontSize: 13, fontWeight: '700' }}>
          {t('addDefaultReminders')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
