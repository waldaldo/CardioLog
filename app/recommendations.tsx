// app/recommendations.tsx

import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { palette } from '@/theme/tokens';

export default function Recommendations() {
  const { readings } = useReadings();
  const { profile } = useProfile();
  if (!profile) return null;

  const avgSys = avg(daysAgo(readings, 7), 'sys') || 130;
  const bmi = bmiOf(profile.weight_kg, profile.height_cm);
  const recs = getRecommendations(avgSys, bmi);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginLeft: 12 }}>Recomendaciones</Text>
      </View>

      <View style={{
        padding: 16, borderRadius: 16, flexDirection: 'row',
        backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder, marginBottom: 14,
      }}>
        <MetricMini label="Sist. promedio" value={avgSys} color="#00f0ff"/>
        <MetricMini label="IMC" value={bmi.toFixed(1)} color="#fff"/>
        <MetricMini label="Meta" value={profile.goal_sys} color="#10b981"/>
      </View>

      {recs.map(r => (
        <View key={r.id} style={{
          padding: 16, marginBottom: 10, borderRadius: 16,
          backgroundColor: palette.glassBg,
          borderLeftWidth: 4, borderLeftColor: r.color,
          borderWidth: 1, borderColor: palette.glassBorder,
        }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>{r.title.es}</Text>
          <Text style={{ color: palette.textSecondary, fontSize: 12, marginBottom: 6 }}>{r.short.es}</Text>
          <Text style={{ color: palette.textMuted, fontSize: 11, lineHeight: 16 }}>{r.detail.es}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function MetricMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 10, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
