// app/(tabs)/profile.tsx

import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { bmiOf, bmiCategory } from '@/lib/oms';
import { TabFade } from '@/components/TabFade';
import { palette } from '@/theme/tokens';

export default function Profile() {
  const { profile, save, refresh } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ weight_kg: '', height_cm: '', age: '' });

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!profile) return null;
  const bmi = bmiOf(profile.weight_kg, profile.height_cm);

  const startEdit = () => {
    setDraft({
      weight_kg: String(profile.weight_kg),
      height_cm: String(profile.height_cm),
      age: String(profile.age),
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    const w = parseFloat(draft.weight_kg);
    const h = parseFloat(draft.height_cm);
    const a = parseInt(draft.age, 10);
    if (!w || !h || !a || w < 20 || w > 300 || h < 50 || h > 250 || a < 1 || a > 120) {
      Alert.alert('Datos inválidos', 'Revisa que peso, talla y edad sean valores correctos.');
      return;
    }
    await save({ ...profile, weight_kg: w, height_cm: h, age: a });
    setEditing(false);
  };

  const items = [
    { label: 'Recomendaciones', nav: '/recommendations' },
    { label: 'Recordatorios', nav: '/reminders' },
    { label: 'Respaldo en Google Drive', nav: '/backup' },
    { label: 'Ajustes', nav: '/settings' },
  ];

  const inputStyle = {
    color: '#00f0ff', fontSize: 18, fontWeight: '800' as const,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,240,255,0.4)',
    paddingVertical: 2, minWidth: 50, textAlign: 'center' as const,
  };

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
          {editing ? (
            <TextInput
              value={draft.age}
              onChangeText={v => setDraft(d => ({ ...d, age: v }))}
              keyboardType="number-pad"
              style={[inputStyle, { fontSize: 13, color: '#fff' }]}
            />
          ) : `${profile.age} años`}
          {' · '}{profile.sex === 'M' ? 'Masculino' : 'Femenino'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
          {editing ? (
            <>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <TextInput
                  value={draft.weight_kg}
                  onChangeText={v => setDraft(d => ({ ...d, weight_kg: v }))}
                  keyboardType="decimal-pad"
                  style={inputStyle}
                />
                <Text style={{ color: palette.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 }}>PESO</Text>
                <Text style={{ color: palette.textSecondary, fontSize: 10, marginTop: 2 }}>kg</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <TextInput
                  value={draft.height_cm}
                  onChangeText={v => setDraft(d => ({ ...d, height_cm: v }))}
                  keyboardType="number-pad"
                  style={inputStyle}
                />
                <Text style={{ color: palette.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 }}>TALLA</Text>
                <Text style={{ color: palette.textSecondary, fontSize: 10, marginTop: 2 }}>cm</Text>
              </View>
              <Stat label="IMC" value={bmiOf(parseFloat(draft.weight_kg)||profile.weight_kg, parseFloat(draft.height_cm)||profile.height_cm).toFixed(1)}
                    unit={bmiCategory(bmiOf(parseFloat(draft.weight_kg)||profile.weight_kg, parseFloat(draft.height_cm)||profile.height_cm))}/>
            </>
          ) : (
            <>
              <Stat label="Peso" value={`${profile.weight_kg}`} unit="kg"/>
              <Stat label="Altura" value={`${profile.height_cm}`} unit="cm"/>
              <Stat label="IMC" value={bmi.toFixed(1)} unit={bmiCategory(bmi)}/>
            </>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          {editing ? (
            <>
              <Pressable onPress={saveEdit}
                         style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: '#00f0ff' }}>
                <Text style={{ color: '#07070a', fontWeight: '800', fontSize: 13 }}>Guardar</Text>
              </Pressable>
              <Pressable onPress={() => setEditing(false)}
                         style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={startEdit}
                       style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0,240,255,0.1)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)' }}>
              <Text style={{ color: '#00f0ff', fontWeight: '700', fontSize: 13 }}>✏ Editar datos</Text>
            </Pressable>
          )}
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
