// app/(tabs)/index.tsx — Home screen (functional)

import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { useProfile } from '@/hooks/useProfile';
import { classifyBP, bmiOf } from '@/lib/oms';
import { avg, daysAgo } from '@/lib/i18n';
import { getRecommendations } from '@/lib/recommendations';
import { AreaChart } from '@/components/AreaChart';
import { Logo } from '@/components/Logo';
import { TabFade } from '@/components/TabFade';
import { palette } from '@/theme/tokens';

export default function HomeScreen() {
  const { readings } = useReadings();
  const { profile } = useProfile();
  if (!profile) return null;

  const latest = readings[readings.length - 1];
  const cat = latest ? classifyBP(latest.sys, latest.dia) : null;
  const last7 = daysAgo(readings, 7);
  const last30 = daysAgo(readings, 30);
  const avgSys7 = avg(last7, 'sys'), avgDia7 = avg(last7, 'dia');

  return (
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Logo size={36}/>
          <View>
            <Text style={{ color: palette.textMuted, fontSize: 12, fontWeight: '600' }}>Hola</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{profile.name}</Text>
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
          <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
            ÚLTIMA MEDICIÓN
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
            <Text style={{ color: cat.color, fontSize: 60, fontWeight: '800', lineHeight: 60 }}>{latest.sys}</Text>
            <Text style={{ color: palette.textMuted, fontSize: 32 }}>/</Text>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>{latest.dia}</Text>
            <Text style={{ color: palette.textMuted, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>mmHg</Text>
          </View>
          <Text style={{ color: cat.color, fontSize: 13, fontWeight: '700', marginTop: 6 }}>
            {cat.label.es} · {latest.pulse} lpm
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <AvgCard label="7 días" sys={avgSys7} dia={avgDia7} color="#00f0ff"/>
        <AvgCard label="30 días" sys={avg(last30, 'sys')} dia={avg(last30, 'dia')} color="#a78bfa"/>
      </View>

      {readings.length > 1 && (
        <View style={{
          padding: 16, borderRadius: 20,
          backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder,
          marginBottom: 12,
        }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Últimos 14 días</Text>
          <AreaChart readings={readings.slice(-14)} width={320} height={160}/>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/record')}
        style={{
          padding: 18, borderRadius: 16,
          backgroundColor: '#00f0ff', alignItems: 'center',
        }}>
        <Text style={{ color: '#07070a', fontSize: 16, fontWeight: '800' }}>+ Registrar medición</Text>
      </Pressable>

      {readings.length > 0 && (
        <>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 10 }}>
            Recomendaciones para ti
          </Text>
          {getRecommendations(avgSys7, bmiOf(profile.weight_kg, profile.height_cm)).slice(0, 3).map(r => (
            <View key={r.id} style={{
              padding: 14, marginBottom: 8, borderRadius: 16,
              backgroundColor: palette.glassBg,
              borderLeftWidth: 3, borderLeftColor: r.color,
              borderWidth: 1, borderColor: palette.glassBorder,
            }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{r.title.es}</Text>
              <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 4 }}>{r.short.es}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
    </TabFade>
  );
}

function AvgCard({ label, sys, dia, color }: { label: string; sys: number; dia: number; color: string }) {
  return (
    <View style={{
      flex: 1, padding: 14, borderRadius: 16,
      backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder,
    }}>
      <Text style={{ color: palette.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={{ color, fontSize: 26, fontWeight: '800' }}>{sys || '—'}</Text>
        <Text style={{ color: palette.textMuted }}>/</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{dia || '—'}</Text>
      </View>
    </View>
  );
}
