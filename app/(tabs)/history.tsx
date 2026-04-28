import { useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP } from '@/lib/oms';
import { AreaChart } from '@/components/AreaChart';
import { TabFade } from '@/components/TabFade';
import { palette } from '@/theme/tokens';

export default function History() {
  const { readings, refresh } = useReadings();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const reversed = [...readings].reverse();
  const grouped: Record<string, typeof readings> = {};
  for (const r of reversed) {
    const d = new Date(r.ts);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    (grouped[key] ??= []).push(r);
  }
  const allDays = Object.entries(grouped);
  const visibleDays = allDays.slice(0, 20);
  const hiddenDaysCount = allDays.length - visibleDays.length;

  return (
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 16 }}>Historial</Text>

      {readings.length > 1 && (
        <View style={{
          padding: 16, borderRadius: 20, marginBottom: 16,
          backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder,
        }}>
          <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
            TENDENCIA · ZONAS OMS
          </Text>
          <AreaChart readings={readings} width={320} height={180}/>
        </View>
      )}

      {hiddenDaysCount > 0 && (
        <Text style={{ color: palette.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
          Mostrando los últimos 20 días · {hiddenDaysCount} días anteriores no se muestran
        </Text>
      )}
      {visibleDays.map(([day, rows]) => (
        <View key={day} style={{ marginBottom: 16 }}>
          <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 }}>
            {day.toUpperCase()}
          </Text>
          <View style={{ backgroundColor: palette.glassBg, borderRadius: 16, borderWidth: 1, borderColor: palette.glassBorder }}>
            {rows.map((r, i) => {
              const cat = classifyBP(r.sys, r.dia);
              const time = new Date(r.ts).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={r.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                  borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(255,255,255,0.05)',
                }}>
                  <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: cat.color }}/>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={{ color: cat.color, fontSize: 18, fontWeight: '800' }}>{r.sys}</Text>
                      <Text style={{ color: palette.textMuted }}>/</Text>
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{r.dia}</Text>
                      <Text style={{ color: palette.textMuted, fontSize: 10, marginLeft: 4 }}>mmHg</Text>
                    </View>
                    <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 2 }}>
                      {time} · {r.pulse} lpm · {cat.label.es}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {readings.length === 0 && (
        <Text style={{ color: palette.textMuted, textAlign: 'center', marginTop: 40 }}>
          Aún no hay registros. Toca + en Inicio para comenzar.
        </Text>
      )}
    </ScrollView>
    </TabFade>
  );
}
