// app/(tabs)/profile.tsx

import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf, bmiCategory } from '@/lib/oms';
import { TabFade } from '@/components/TabFade';
import { palette } from '@/theme/tokens';

export default function Profile() {
  const { profile } = useProfile();
  if (!profile) return null;
  const bmi = bmiOf(profile.weight_kg, profile.height_cm);

  const items = [
    { label: 'Recomendaciones', nav: '/recommendations' },
    { label: 'Recordatorios', nav: '/reminders' },
    { label: 'Respaldo en Google Drive', nav: '/backup' },
    { label: 'Ajustes', nav: '/settings' },
  ];

  return (
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: palette.bgDark }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 16 }}>Perfil</Text>

      <View style={{
        padding: 20, borderRadius: 20, alignItems: 'center',
        backgroundColor: palette.glassBg, borderWidth: 1, borderColor: palette.glassBorder, marginBottom: 14,
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40, backgroundColor: '#00f0ff',
          alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <Text style={{ color: '#07070a', fontSize: 28, fontWeight: '800' }}>
            {(profile.name || '?').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{profile.name}</Text>
        <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 2 }}>
          {profile.age} años · {profile.sex === 'M' ? 'Masculino' : 'Femenino'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
          <Stat label="Peso" value={`${profile.weight_kg}`} unit="kg"/>
          <Stat label="Altura" value={`${profile.height_cm}`} unit="cm"/>
          <Stat label="IMC" value={bmi.toFixed(1)} unit={bmiCategory(bmi)}/>
        </View>
      </View>

      <View style={{ backgroundColor: palette.glassBg, borderRadius: 16, borderWidth: 1, borderColor: palette.glassBorder }}>
        {items.map((it, i) => (
          <Pressable key={it.label} onPress={() => router.push(it.nav as any)}
                     style={{
                       padding: 16, flexDirection: 'row', alignItems: 'center',
                       borderBottomWidth: i < items.length - 1 ? 1 : 0,
                       borderBottomColor: 'rgba(255,255,255,0.05)',
                     }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{it.label}</Text>
            <Text style={{ color: palette.textMuted }}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
    </TabFade>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: '#00f0ff', fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: palette.textSecondary, fontSize: 10, marginTop: 2 }}>{unit}</Text>
    </View>
  );
}
