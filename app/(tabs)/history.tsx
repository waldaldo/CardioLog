import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { classifyBP, omsColorFor } from '@/lib/oms';
import { exportPdfReport } from '@/lib/pdfReport';
import { AreaChart } from '@/components/AreaChart';
import { TabFade } from '@/components/TabFade';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function History() {
  const { readings, refresh } = useReadings();
  const { profile } = useProfile();
  const { lang, locale, t } = useLang();
  const { colors, isDark } = useTheme();
  const [pdfBusy, setPdfBusy] = useState(false);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const onSharePdf = async () => {
    if (!profile) return;
    try {
      setPdfBusy(true);
      await exportPdfReport(readings, profile, lang, 'all');
    } catch (e: any) {
      if (e.message !== 'cancelled') Alert.alert(t('saveError'), e.message);
    } finally {
      setPdfBusy(false);
    }
  };
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

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{t('history')}</Text>
          {readings.length > 0 && (
            <Pressable onPress={onSharePdf} disabled={pdfBusy || !profile}
              accessibilityRole="button"
              accessibilityLabel={t('pdfExportBtn') || 'Exportar PDF'}
              style={({ pressed }) => ({
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: colors.accentBg,
                borderWidth: 1, borderColor: colors.accentBorder,
                alignItems: 'center', justifyContent: 'center',
                opacity: (pdfBusy || !profile) ? 0.4 : pressed ? 0.7 : 1,
              })}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M12 4v12m0-12l-5 5m5-5l5 5M5 20h14" stroke={colors.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </Pressable>
          )}
        </View>

        {readings.length > 1 && (
          <View style={{
            padding: 16, borderRadius: 20, marginBottom: 16,
            backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
              {t('trendZones')}
            </Text>
            <AreaChart readings={readings} width={320} height={180}/>
          </View>
        )}

        {hiddenDaysCount > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
            {t('showingLast')} · {hiddenDaysCount} {t('olderHidden')}
          </Text>
        )}
        {visibleDays.map(([day, rows]) => (
          <View key={day} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 }}>
              {day.toUpperCase()}
            </Text>
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
              {rows.map((r, i) => {
                const cat = classifyBP(r.sys, r.dia);
                const catColor = omsColorFor(cat.id, isDark);
                const time = new Date(r.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                return (
                  <View key={r.id}
                    accessibilityRole="text"
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

        {readings.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
            {t('noRecords')}
          </Text>
        )}
      </ScrollView>
    </TabFade>
  );
}
