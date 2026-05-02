// app/recommendations.tsx

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

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
      <ScreenHeader title={t('recommendations')}/>

      <View style={{
        padding: 16, borderRadius: 16, flexDirection: 'row',
        backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, marginBottom: 14,
      }}>
        <MetricMini label={t('avgSystolic')} value={avgSys} accent={colors.primary}/>
        <MetricMini label={t('bmi')} value={bmi.toFixed(1)} accent={colors.text}/>
        <MetricMini label={t('goal')} value={profile.goal_sys} accent={colors.oms.optima}/>
      </View>

      {recs.map(r => {
        const isOpen = expanded === r.id;
        return (
          <Pressable key={r.id} onPress={() => toggle(r.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded: isOpen }}
            accessibilityLabel={r.title[lang]}
            style={{
              marginBottom: 10, borderRadius: 16,
              backgroundColor: colors.bgCard,
              borderLeftWidth: 4, borderLeftColor: r.color,
              borderWidth: 1, borderColor: isOpen ? r.color + '60' : colors.border,
              overflow: 'hidden',
            }}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>{r.title[lang]}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{r.short[lang]}</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 18, marginLeft: 8 }}>{isOpen ? '∧' : '∨'}</Text>
            </View>

            {isOpen && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 12 }}/>
                <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21 }}>{r.detail[lang]}</Text>
                <Pressable onPress={() => openGoogle(r.title[lang])}
                  accessibilityRole="link"
                  accessibilityLabel={t('searchGoogle')}
                  style={({ pressed }) => ({
                    marginTop: 14, paddingVertical: 10, paddingHorizontal: 16,
                    borderRadius: 10, backgroundColor: colors.accentBg,
                    borderWidth: 1, borderColor: colors.accentBorder,
                    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
                    opacity: pressed ? 0.85 : 1,
                  })}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{t('searchGoogle')}</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function MetricMini({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: accent, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>{label}</Text>
    </View>
  );
}
