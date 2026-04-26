// app/onboarding.tsx — 5-step onboarding that saves to SQLite

import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { Logo } from '@/components/Logo';
import { palette } from '@/theme/tokens';

interface Step {
  title: string;
  field: 'name' | 'age' | 'sex' | 'weight' | 'height';
  kind: 'text' | 'num' | 'choice';
  unit?: string; min?: number; max?: number;
  options?: Array<[string, string]>;
}

interface OnboardingData {
  name: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
}

const STEPS: Step[] = [
  { title: '¿Cómo te llamas?', field: 'name', kind: 'text' },
  { title: '¿Cuál es tu edad?', field: 'age', kind: 'num', unit: 'años', min: 18, max: 100 },
  { title: 'Sexo biológico', field: 'sex', kind: 'choice', options: [['M', 'Masculino'], ['F', 'Femenino']] },
  { title: '¿Cuánto pesas?', field: 'weight', kind: 'num', unit: 'kilogramos', min: 30, max: 200 },
  { title: '¿Cuál es tu estatura?', field: 'height', kind: 'num', unit: 'centímetros', min: 120, max: 220 },
];

export default function Onboarding() {
  const { save } = useProfile();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({ name: '', age: 60, sex: 'M', weight: 80, height: 170 });
  const s = STEPS[step];

  const next = async () => {
    if (step < STEPS.length - 1) return setStep(step + 1);
    try {
      await save({
        name: data.name || 'Usuario',
        age: data.age, sex: data.sex as 'M' | 'F',
        weight_kg: data.weight, height_cm: data.height,
        goal_sys: 130,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo guardar el perfil. Intenta de nuevo.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bgDark, padding: 28 }}>
      <View style={{ paddingTop: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Logo size={40}/>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>CardioLog</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
          {STEPS.map((_, i) => (
            <View key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= step ? '#00f0ff' : 'rgba(255,255,255,0.1)',
            }}/>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: '#00f0ff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          PASO {step + 1} DE {STEPS.length}
        </Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 28, lineHeight: 32 }}>
          {s.title}
        </Text>

        {s.kind === 'text' && (
          <TextInput
            value={String(data[s.field])}
            onChangeText={v => setData({ ...data, [s.field]: v })}
            placeholder="Tu nombre"
            placeholderTextColor={palette.textMuted}
            style={{
              padding: 16, fontSize: 18, color: '#fff',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
            }}
          />
        )}

        {s.kind === 'num' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.max(s.min ?? 0, (data[s.field] as number) - 1) })}
                       style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 26 }}>–</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#00f0ff', fontSize: 72, fontWeight: '800', lineHeight: 72 }}>{data[s.field]}</Text>
              <Text style={{ color: palette.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 6 }}>
                {s.unit?.toUpperCase()}
              </Text>
            </View>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.min(s.max ?? 9999, (data[s.field] as number) + 1) })}
                       style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 26 }}>+</Text>
            </Pressable>
          </View>
        )}

        {s.kind === 'choice' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(s.options ?? []).map(([v, l]) => (
              <Pressable key={v} onPress={() => setData({ ...data, [s.field]: v })}
                         style={{
                           flex: 1, padding: 20, borderRadius: 16, alignItems: 'center',
                           backgroundColor: data[s.field] === v ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                           borderWidth: 1, borderColor: data[s.field] === v ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                         }}>
                <Text style={{ color: data[s.field] === v ? '#00f0ff' : '#fff', fontSize: 16, fontWeight: '700' }}>{l}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={next}
                 style={{ padding: 18, borderRadius: 16, backgroundColor: '#00f0ff', alignItems: 'center' }}>
        <Text style={{ color: '#07070a', fontSize: 16, fontWeight: '800' }}>
          {step < STEPS.length - 1 ? 'Continuar' : 'Comenzar'}
        </Text>
      </Pressable>
    </View>
  );
}
