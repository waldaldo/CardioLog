import { View, Text, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP } from '@/lib/oms';
import { daysAgo, avg } from '@/lib/i18n';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function ReadingsDetail() {
  const { days } = useLocalSearchParams<{ days: string }>();
  const n = Number(days) || 7;
  const { readings } = useReadings();
  const { lang, locale, t } = useLang();
  const { colors } = useTheme();

  const filtered = daysAgo(readings, n);
  const reversed = [...filtered].reverse();

  const grouped: Record<string, typeof filtered> = {};
  for (const r of reversed) {
    const d = new Date(r.ts);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    (grouped[key] ??= []).push(r);
  }

  const avgSys = avg(filtered, 'sys');
  const avgDia = avg(filtered, 'dia');
  const avgPulse = avg(filtered, 'pulse');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 20 }}>←</Text>
    </Pressable>
    <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginLeft: 12 }}>{t('lastNDays')} {n} {t('days')}</Text>
      </View>

      {filtered.length > 0 ? (
        <>
          <View style={{
      padding: 16, borderRadius: 16, flexDirection: 'row',
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 16,
          }}>
      <SummaryCol label={t('avgSys')} value={`${avgSys}`} color="#00f0ff"/>
      <SummaryCol label={t('avgDia')} value={`${avgDia}`} color={colors.text}/>
      <SummaryCol label={t('avgPulse')} value={`${avgPulse}`} color="#a78bfa"/>
            <SummaryCol label={t('measurements')} value={`${filtered.length}`} color="#10b981"/>
          </View>

          {Object.entries(grouped).map(([day, rows]) => (
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
        </>
      ) : (
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>
          {t('noReadingsPeriod')} {n} {t('days')}.
        </Text>
      )}
    </ScrollView>
  );
}

function SummaryCol({ label, value, color }: { label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value || '—'}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.3, marginTop: 3, textAlign: 'center' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
