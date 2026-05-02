// app/reminders.tsx

import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { listReminders, upsertReminder, Reminder } from '@/db/repositories';
import { scheduleReminder, cancelReminder } from '@/lib/notifications';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

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
      <ScreenHeader title={t('reminders')}/>

      {items.map(r => (
        <View key={r.id}
          accessibilityLabel={`${r.time_hhmm}, ${r.label}, ${r.enabled ? 'activado' : 'desactivado'}`}
          style={{
            padding: 16, marginBottom: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
          }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: r.enabled ? colors.primary : colors.textMuted, fontSize: 28, fontWeight: '800' }}>
              {r.time_hhmm}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 }}>{r.label}</Text>
          </View>
          <Switch value={r.enabled} onValueChange={() => toggle(r)} trackColor={{ true: colors.primary, false: colors.surfaceRaised }}/>
        </View>
      ))}

      <Pressable onPress={addDefaults}
        accessibilityRole="button" accessibilityLabel={t('addDefaultReminders')}
        style={({ pressed }) => ({
          marginTop: 6, padding: 16, borderRadius: 14,
          backgroundColor: colors.accentBg,
          borderWidth: 1, borderColor: colors.accentBorder,
          alignItems: 'center', opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
          {t('addDefaultReminders')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
