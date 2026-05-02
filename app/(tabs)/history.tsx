import { useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP } from '@/lib/oms';
import { AreaChart } from '@/components/AreaChart';
import { TabFade } from '@/components/TabFade';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function History() {
  const { readings, refresh } = useReadings();
  const { lang, locale, t } = useLang();
  const { colors } = useTheme();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const reversed = [...readings].reverse();
  const grouped: Record<string, typeof readings> = {};
  for (const r of reversed) {
    const d = new Date(r.ts);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    (grouped[key] ??= []).push(r);
  }
  const allDays = Object.entries(grouped);
  const visibleDays = allDays.slice(0, 20);
  const hiddenDaysCount = allDays.length - visibleDays.length;

  return (
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 16 }}>{t('history')}</Text>

        {readings.length > 1 && (
          <View style={{
      padding: 16, borderRadius: 20, marginBottom: 16,
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
              {t('trendZones')}
            </Text>
            <AreaChart readings={readings} width={320} height={180}/>
          </View>
        )}

        {hiddenDaysCount > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
            {t('showingLast')} · {hiddenDaysCount} {t('olderHidden')}
          </Text>
        )}
        {visibleDays.map(([day, rows]) => (
          <View key={day} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 }}>
              {day.toUpperCase()}
            </Text>
            <View style={{ backgroundColor: colors.glassBg, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder }}>
              {rows.map((r, i) => {
                const cat = classifyBP(r.sys, r.dia);
                const time = new Date(r.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                return (
                  <View key={r.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
        borderBottomWidth: i < rows.length - 1 ? 1 : 0,
        borderBottomColor: colors.borderSubtle,
                  }}>
                    <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: cat.color }}/>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                        <Text style={{ color: cat.color, fontSize: 18, fontWeight: '800' }}>{r.sys}</Text>
          <Text style={{ color: colors.textMuted }}>/</Text>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{r.dia}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, marginLeft: 4 }}>{t('mmHg')}</Text>
                      </View>
                      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                        {time} · {r.pulse} {t('bpm')} · {cat.label[lang]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {readings.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>
            {t('noRecords')}
          </Text>
        )}
      </ScrollView>
    </TabFade>
  );
}
