// app/recommendations.tsx

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Recommendations() {
  const { readings } = useReadings();
  const { profile } = useProfile();
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!profile) return null;

  const avgSys = avg(daysAgo(readings, 7), 'sys') || 130;
  const bmi = bmiOf(profile.weight_kg, profile.height_cm);
  const recs = getRecommendations(avgSys, bmi);

  const toggle = (id: string) => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(prev => prev === id ? null : id);
  };

  const openGoogle = (title: string) => {
    const q = encodeURIComponent(`${title} presión arterial`);
    Linking.openURL(`https://www.google.com/search?q=${q}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 20 }}>←</Text>
    </Pressable>
    <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginLeft: 12 }}>{t('recommendations')}</Text>
      </View>

      <View style={{
      padding: 16, borderRadius: 16, flexDirection: 'row',
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 14,
      }}>
      <MetricMini label={t('avgSystolic')} value={avgSys} color="#00f0ff"/>
      <MetricMini label={t('bmi')} value={bmi.toFixed(1)} color={colors.text}/>
      <MetricMini label={t('goal')} value={profile.goal_sys} color="#10b981"/>
      </View>

      {recs.map(r => {
        const isOpen = expanded === r.id;
        return (
          <Pressable key={r.id} onPress={() => toggle(r.id)} style={{
        marginBottom: 10, borderRadius: 16,
        backgroundColor: colors.glassBg,
        borderLeftWidth: 4, borderLeftColor: r.color,
        borderWidth: 1, borderColor: isOpen ? r.color + '60' : colors.glassBorder,
            overflow: 'hidden',
          }}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>{r.title[lang]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{r.short[lang]}</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 18, marginLeft: 8 }}>{isOpen ? '∧' : '∨'}</Text>
            </View>

            {isOpen && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 12 }}/>
        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>{r.detail[lang]}</Text>
        <Pressable onPress={() => openGoogle(r.title[lang])}
                           style={{
                             marginTop: 14, paddingVertical: 10, paddingHorizontal: 16,
                             borderRadius: 10, backgroundColor: 'rgba(0,240,255,0.08)',
                             borderWidth: 1, borderColor: 'rgba(0,240,255,0.25)',
                             flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
                           }}>
                  <Text style={{ color: '#00f0ff', fontSize: 13, fontWeight: '700' }}>{t('searchGoogle')}</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function MetricMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
