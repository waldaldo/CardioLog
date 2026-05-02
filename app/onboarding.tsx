import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

interface Step {
  titleKey: string;
  field: 'name' | 'age' | 'sex' | 'weight' | 'height';
  kind: 'text' | 'num' | 'choice';
  unitKey?: string; min?: number; max?: number;
  options?: Array<[string, string, string]>;
}

interface OnboardingData {
  name: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
}

const STEPS: Step[] = [
  { titleKey: 'onbName', field: 'name', kind: 'text' },
  { titleKey: 'onbAge', field: 'age', kind: 'num', unitKey: 'yearsUnit', min: 18, max: 100 },
  { titleKey: 'onbSex', field: 'sex', kind: 'choice', options: [['M', 'male', 'Masculino'], ['F', 'female', 'Femenino']] },
  { titleKey: 'onbWeight', field: 'weight', kind: 'num', unitKey: 'kilograms', min: 30, max: 200 },
  { titleKey: 'onbHeight', field: 'height', kind: 'num', unitKey: 'centimeters', min: 120, max: 220 },
];

export default function Onboarding() {
  const { save } = useProfile();
  const { t } = useLang();
  const { colors } = useTheme();
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
      Alert.alert(t('onbError'), t('onbErrorMsg'));
    }
  };

  const getOptionLabel = (opt: [string, string, string]) => {
    return t(opt[1]) !== opt[1] ? t(opt[1]) : opt[2];
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 28 }}>
      <View style={{ paddingTop: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Logo size={40}/>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>CardioLog</Text>
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
          {t('stepOf')} {step + 1} {t('of')} {STEPS.length}
        </Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 28, lineHeight: 32 }}>
          {t(s.titleKey)}
        </Text>

        {s.kind === 'text' && (
          <TextInput
            value={String(data[s.field])}
            onChangeText={v => setData({ ...data, [s.field]: v })}
            placeholder={t('placeholderName')}
            placeholderTextColor={colors.textMuted}
            style={{
              padding: 16, fontSize: 18, color: colors.text,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
            }}
          />
        )}

        {s.kind === 'num' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.max(s.min ?? 0, (data[s.field] as number) - 1) })}
              style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 26 }}>–</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#00f0ff', fontSize: 72, fontWeight: '800', lineHeight: 72 }}>{data[s.field]}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 6 }}>
                {s.unitKey ? t(s.unitKey).toUpperCase() : ''}
              </Text>
            </View>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.min(s.max ?? 9999, (data[s.field] as number) + 1) })}
              style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 26 }}>+</Text>
            </Pressable>
          </View>
        )}

        {s.kind === 'choice' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(s.options ?? []).map(opt => (
              <Pressable key={opt[0]} onPress={() => setData({ ...data, [s.field]: opt[0] })}
                style={{
                  flex: 1, padding: 20, borderRadius: 16, alignItems: 'center',
                  backgroundColor: data[s.field] === opt[0] ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: data[s.field] === opt[0] ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                }}>
                <Text style={{ color: data[s.field] === opt[0] ? '#00f0ff' : colors.text, fontSize: 16, fontWeight: '700' }}>{getOptionLabel(opt)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={next}
        style={{ padding: 18, borderRadius: 16, backgroundColor: '#00f0ff', alignItems: 'center' }}>
        <Text style={{ color: '#07070a', fontSize: 16, fontWeight: '800' }}>
          {step < STEPS.length - 1 ? t('continue') : t('start')}
        </Text>
      </Pressable>
    </View>
  );
}
