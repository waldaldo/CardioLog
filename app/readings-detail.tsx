import { View, Text, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP } from '@/lib/oms';
import { daysAgo, avg } from '@/lib/i18n';
import { palette } from '@/theme/tokens';

export default function ReadingsDetail() {
  const { days } = useLocalSearchParams<{ days: string }>();
  const n = Number(days) || 7;
  const { readings } = useReadings();

  const filtered = daysAgo(readings, n);
  const reversed = [...filtered].reverse();

  const grouped: Record<string, typeof filtered> = {};
  for (const r of reversed) {
    const d = new Date(r.ts);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    (grouped[key] ??= []).push(r);
  }

  const avgSys = avg(filtered, 'sys');
  const avgDia = avg(filtered, 'dia');
  const avgPulse = avg(filtered, 'pulse');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()}
                   style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12 }}>Últimos {n} días</Text>
      </View>

      {filtered.length > 0 ? (
        <>
          <View style={{
            padding: 16, borderRadius: 16, flexDirection: 'row',
            backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder, marginBottom: 16,
          }}>
            <SummaryCol label="Promedio SYS" value={`${avgSys}`} color="#00f0ff"/>
            <SummaryCol label="Promedio DIA" value={`${avgDia}`} color="#fff"/>
            <SummaryCol label="Pulso med." value={`${avgPulse}`} color="#a78bfa"/>
            <SummaryCol label="Mediciones" value={`${filtered.length}`} color="#10b981"/>
          </View>

          {Object.entries(grouped).map(([day, rows]) => (
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
        </>
      ) : (
        <Text style={{ color: palette.textMuted, textAlign: 'center', marginTop: 40 }}>
          No hay mediciones en los últimos {n} días.
        </Text>
      )}
    </ScrollView>
  );
}

function SummaryCol({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value || '—'}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.3, marginTop: 3, textAlign: 'center' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
