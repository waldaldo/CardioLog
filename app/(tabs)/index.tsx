import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { classifyBP, bmiOf } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { AreaChart } from '@/components/AreaChart';
import { Logo } from '@/components/Logo';
import { TabFade } from '@/components/TabFade';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function HomeScreen() {
  const { readings, refresh } = useReadings();
  const { profile } = useProfile();
  const { lang, locale, t } = useLang();
  const { colors } = useTheme();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!profile) return null;

  const latest = readings[readings.length - 1];
  const cat = latest ? classifyBP(latest.sys, latest.dia) : null;
  const last7 = daysAgo(readings, 7);
  const last30 = daysAgo(readings, 30);
  const avgSys7 = avg(last7, 'sys'), avgDia7 = avg(last7, 'dia');

  return (
    <TabFade>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Logo size={36}/>
          <View>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{t('greeting')}</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{profile.name}</Text>
          </View>
        </View>
      </View>

      {latest && cat && (
        <View style={{
          padding: 20, borderRadius: 20,
          backgroundColor: cat.color + '22',
          borderWidth: 1, borderColor: cat.color + '55',
          marginBottom: 12,
        }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
        {t('lastReading')}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <Text style={{ color: cat.color, fontSize: 60, fontWeight: '800', lineHeight: 60 }}>{latest.sys}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 32 }}>/</Text>
        <Text style={{ color: colors.text, fontSize: 40, fontWeight: '800' }}>{latest.dia}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>{t('mmHg')}</Text>
          </View>
          <Text style={{ color: cat.color, fontSize: 13, fontWeight: '700', marginTop: 6 }}>
            {cat.label[lang]} · {latest.pulse} {t('bpm')}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <AvgCard label={t('weekAvg')} sys={avgSys7} dia={avgDia7} color="#00f0ff" viewDetail={t('viewDetail')}
          onPress={() => router.push({ pathname: '/readings-detail', params: { days: '7' } })}/>
        <AvgCard label={t('monthAvg')} sys={avg(last30, 'sys')} dia={avg(last30, 'dia')} color="#a78bfa" viewDetail={t('viewDetail')}
          onPress={() => router.push({ pathname: '/readings-detail', params: { days: '30' } })}/>
      </View>

      {readings.length > 1 && (
        <View style={{
      padding: 16, borderRadius: 20,
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
          marginBottom: 12,
        }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>{t('last14Days')}</Text>
          <AreaChart readings={readings.slice(-14)} width={320} height={160}/>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/record')}
        style={{
          padding: 18, borderRadius: 16,
          backgroundColor: '#00f0ff', alignItems: 'center',
        }}>
        <Text style={{ color: '#07070a', fontSize: 16, fontWeight: '800' }}>+ {t('addReading')}</Text>
      </Pressable>

      {readings.length > 0 && (
        <>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 10 }}>
        {t('recommendationsForYou')}
      </Text>
          {getRecommendations(avgSys7, bmiOf(profile.weight_kg, profile.height_cm)).slice(0, 3).map(r => (
            <View key={r.id} style={{
          padding: 14, marginBottom: 8, borderRadius: 16,
          backgroundColor: colors.glassBg,
          borderLeftWidth: 3, borderLeftColor: r.color,
          borderWidth: 1, borderColor: colors.glassBorder,
            }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{r.title[lang]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{r.short[lang]}</Text>
            </View>
          ))}
        </>
      )}
      </ScrollView>
    </TabFade>
  );
}

function AvgCard({ label, sys, dia, color, onPress, viewDetail }: {
  label: string; sys: number; dia: number; color: string; onPress: () => void; viewDetail: string; }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{
    flex: 1, padding: 14, borderRadius: 16,
    backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
    }}>
    <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
      <Text style={{ color, fontSize: 26, fontWeight: '800' }}>{sys || '—'}</Text>
      <Text style={{ color: colors.textMuted }}>/</Text>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{dia || '—'}</Text>
    </View>
    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6 }}>{viewDetail}</Text>
    </Pressable>
  );
}
