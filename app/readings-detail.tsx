import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP, omsColorFor } from '@/lib/oms';
import { daysAgo, avg } from '@/lib/i18n';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function ReadingsDetail() {
  const { days } = useLocalSearchParams<{ days: string }>();
  const n = Number(days) || 7;
  const { readings } = useReadings();
  const { lang, locale, t } = useLang();
  const { colors, isDark } = useTheme();

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
      <ScreenHeader title={`${t('lastNDays')} ${n} ${t('days')}`}/>

      {filtered.length > 0 ? (
        <>
          <View style={{
            padding: 16, borderRadius: 16, flexDirection: 'row',
            backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, marginBottom: 16,
          }}>
            <SummaryCol label={t('avgSys')} value={`${avgSys}`} accent={colors.primary}/>
            <SummaryCol label={t('avgDia')} value={`${avgDia}`} accent={colors.text}/>
            <SummaryCol label={t('avgPulse')} value={`${avgPulse}`} accent={colors.secondary}/>
            <SummaryCol label={t('measurements')} value={`${filtered.length}`} accent={colors.oms.optima}/>
          </View>

          {Object.entries(grouped).map(([day, rows]) => (
            <View key={day} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 }}>
                {day.toUpperCase()}
              </Text>
              <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                {rows.map((r, i) => {
                  const cat = classifyBP(r.sys, r.dia);
                  const catColor = omsColorFor(cat.id, isDark);
                  const time = new Date(r.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                  return (
                    <View key={r.id}
                      accessibilityLabel={`${time}, ${r.sys} sobre ${r.dia}, ${cat.label[lang]}, ${r.pulse} ${t('bpm')}`}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                        borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                        borderBottomColor: colors.borderSubtle,
                      }}>
                      <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: catColor }}/>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                          <Text style={{ color: catColor, fontSize: 18, fontWeight: '800' }}>{r.sys}</Text>
                          <Text style={{ color: colors.textMuted }}>/</Text>
                          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{r.dia}</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>{t('mmHg')}</Text>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
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
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
          {t('noReadingsPeriod')} {n} {t('days')}.
        </Text>
      )}
    </ScrollView>
  );
}

function SummaryCol({ label, value, accent }: { label: string; value: string; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: accent, fontSize: 20, fontWeight: '800' }}>{value || '—'}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, marginTop: 4, textAlign: 'center' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
