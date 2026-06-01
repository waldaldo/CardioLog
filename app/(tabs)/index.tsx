import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { classifyBP, bmiOf, omsColorFor } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { AreaChart } from '@/components/AreaChart';
import { Logo } from '@/components/Logo';
import { TabFade } from '@/components/TabFade';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import Svg, { Path } from 'react-native-svg';

export default function HomeScreen() {
  const { readings, refresh } = useReadings();
  const { profile } = useProfile();
  const { lang, locale, t } = useLang();
  const { colors, isDark } = useTheme();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!profile) return null;

  const latest = readings[readings.length - 1];
  const cat = latest ? classifyBP(latest.sys, latest.dia) : null;
  const catColor = cat ? omsColorFor(cat.id, isDark) : colors.text;
  const last7 = daysAgo(readings, 7);
  const last30 = daysAgo(readings, 30);
  const avgSys7 = avg(last7, 'sys'), avgDia7 = avg(last7, 'dia');

  const reversed = [...readings].reverse();
  const grouped: Record<string, typeof readings> = {};
  for (const r of reversed) {
    const d = new Date(r.ts);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    (grouped[key] ??= []).push(r);
  }
  const allDays = Object.entries(grouped);
  const visibleDays = allDays.slice(0, 7);
  const hiddenDaysCount = allDays.length - visibleDays.length;

  return (
    <TabFade>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo size={36}/>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{t('greeting')}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{profile.name}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/readings-detail?days=30')}
            accessibilityRole="button"
            accessibilityLabel={t('history')}
            style={({ pressed }) => ({
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
              backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accentBorder,
              opacity: pressed ? 0.7 : 1,
            })}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{t('history')}</Text>
          </Pressable>
        </View>

        {latest && cat && (
          <Animated.View
            entering={FadeInUp.duration(600)}
            accessibilityRole="summary"
            accessibilityLabel={`${t('lastReading')}: ${latest.sys} sobre ${latest.dia} ${t('mmHg')}, ${cat.label[lang]}, pulso ${latest.pulse}`}
            style={{
              padding: 20, borderRadius: 20,
              backgroundColor: catColor + (isDark ? '22' : '14'),
              borderWidth: 1, borderColor: catColor + (isDark ? '55' : '66'),
              marginBottom: 12,
            }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 }}>
              {t('lastReading')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
              <Text style={{ color: catColor, fontSize: 60, fontWeight: '800', lineHeight: 64 }}>{latest.sys}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 32 }}>/</Text>
              <Text style={{ color: colors.text, fontSize: 40, fontWeight: '800' }}>{latest.dia}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>{t('mmHg')}</Text>
            </View>
            <Text style={{ color: catColor, fontSize: 14, fontWeight: '700', marginTop: 6 }}>
              {cat.label[lang]} · {latest.pulse} {t('bpm')}
            </Text>
            {latest.note ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10, fontStyle: 'italic' }}>
                " {latest.note} "
              </Text>
            ) : null}
          </Animated.View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <AvgCard label={t('weekAvg')} sys={avgSys7} dia={avgDia7} accent={colors.primary} viewDetail={t('viewDetail')}
            onPress={() => router.push({ pathname: '/readings-detail', params: { days: '7' } })}/>
          <AvgCard label={t('monthAvg')} sys={avg(last30, 'sys')} dia={avg(last30, 'dia')} accent={colors.secondary} viewDetail={t('viewDetail')}
            onPress={() => router.push({ pathname: '/readings-detail', params: { days: '30' } })}/>
        </View>

        {readings.length > 1 && (
          <Animated.View
            entering={FadeInRight.delay(200).duration(500)}
            style={{
            padding: 16, borderRadius: 20,
            backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
            marginBottom: 12,
          }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>{t('last14Days')}</Text>
            <AreaChart readings={readings.slice(-14)} width={320} height={160}/>
          </Animated.View>
        )}

        {readings.length > 0 && (
          <>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 }}>
              {t('history')} ({readings.length})
            </Text>
            {visibleDays.map(([day, rows], index) => (
              <Animated.View
                key={day}
                entering={FadeInDown.delay(index * 80).duration(400)}
                style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 }}>
                  {day.toUpperCase()}
                </Text>
                <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                  {rows.map((r, i) => {
                    const c = classifyBP(r.sys, r.dia);
                    const cColor = omsColorFor(c.id, isDark);
                    const time = new Date(r.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => router.push('/record')}
                        accessibilityRole="button"
                        accessibilityLabel={`${time}, ${r.sys} sobre ${r.dia}, ${c.label[lang]}, ${r.pulse} ${t('bpm')}`}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                          borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                          borderBottomColor: colors.borderSubtle,
                        }}>
                        <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: cColor }}/>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Text style={{ color: cColor, fontSize: 22, fontWeight: '800' }}>{r.sys}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 16 }}>/</Text>
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{r.dia}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>{t('mmHg')}</Text>
                          </View>
                          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                            {time} · {r.pulse} {t('bpm')} · {c.label[lang]}
                            {r.note ? ` · ${r.note}` : ''}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            ))}
            {hiddenDaysCount > 0 && (
              <Pressable
                onPress={() => router.push('/readings-detail?days=30')}
                style={({ pressed }) => ({
                  padding: 14, borderRadius: 14, alignItems: 'center',
                  backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accentBorder,
                  opacity: pressed ? 0.7 : 1,
                })}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
                  + {hiddenDaysCount} {hiddenDaysCount === 1 ? 'día' : 'días'} más
                </Text>
              </Pressable>
            )}
          </>
        )}

        {readings.length > 0 && (
          <>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 }}>
              {t('recommendationsForYou')}
            </Text>
            {getRecommendations(avgSys7, bmiOf(profile.weight_kg, profile.height_cm)).slice(0, 3).map(r => (
              <View key={r.id} style={{
                padding: 14, marginBottom: 8, borderRadius: 16,
                backgroundColor: colors.bgCard,
                borderLeftWidth: 4, borderLeftColor: r.color,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{r.title[lang]}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{r.short[lang]}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/record')}
        accessibilityRole="button"
        accessibilityLabel={t('addReading')}
        style={({ pressed }) => ({
          position: 'absolute', bottom: 24, right: 24,
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: colors.primaryStrong,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.primaryStrong, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
          opacity: pressed ? 0.85 : 1,
        })}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke={colors.onPrimary} strokeWidth={3} strokeLinecap="round"/>
        </Svg>
      </Pressable>
    </TabFade>
  );
}

function AvgCard({ label, sys, dia, accent, onPress, viewDetail }: {
  label: string; sys: number; dia: number; accent: string; onPress: () => void; viewDetail: string; }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${sys || '-'} sobre ${dia || '-'}. ${viewDetail}`}
      style={({ pressed }) => ({
        flex: 1, padding: 14, borderRadius: 16,
        backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={{ color: accent, fontSize: 26, fontWeight: '800' }}>{sys || '—'}</Text>
        <Text style={{ color: colors.textMuted }}>/</Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{dia || '—'}</Text>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>{viewDetail}</Text>
    </Pressable>
  );
}