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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo size={44}/>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>CardioLog</Text>
        </View>
        <View
          accessibilityLabel={`${t('stepOf')} ${step + 1} ${t('of')} ${STEPS.length}`}
          style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
          {STEPS.map((_, i) => (
            <View key={i} style={{
              flex: 1, height: 5, borderRadius: 3,
              backgroundColor: i <= step ? colors.primaryStrong : colors.surfaceRaised,
            }}/>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          {t('stepOf')} {step + 1} {t('of')} {STEPS.length}
        </Text>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 28, lineHeight: 32 }}>
          {t(s.titleKey)}
        </Text>

        {s.kind === 'text' && (
          <TextInput
            value={String(data[s.field])}
            onChangeText={v => setData({ ...data, [s.field]: v })}
            placeholder={t('placeholderName')}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t(s.titleKey)}
            style={{
              padding: 16, fontSize: 18, color: colors.text,
              backgroundColor: colors.bgCard,
              borderRadius: 14, borderWidth: 1, borderColor: colors.border,
            }}
          />
        )}

        {s.kind === 'num' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.max(s.min ?? 0, (data[s.field] as number) - 1) })}
              accessibilityRole="button" accessibilityLabel="Disminuir"
              style={({ pressed }) => ({ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>–</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text accessibilityLiveRegion="polite" style={{ color: colors.primary, fontSize: 72, fontWeight: '800', lineHeight: 76 }}>{data[s.field]}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 6 }}>
                {s.unitKey ? t(s.unitKey).toUpperCase() : ''}
              </Text>
            </View>
            <Pressable onPress={() => setData({ ...data, [s.field]: Math.min(s.max ?? 9999, (data[s.field] as number) + 1) })}
              accessibilityRole="button" accessibilityLabel="Aumentar"
              style={({ pressed }) => ({ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>+</Text>
            </Pressable>
          </View>
        )}

        {s.kind === 'choice' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(s.options ?? []).map(opt => {
              const active = data[s.field] === opt[0];
              return (
                <Pressable key={opt[0]} onPress={() => setData({ ...data, [s.field]: opt[0] })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => ({
                    flex: 1, padding: 22, borderRadius: 16, alignItems: 'center',
                    backgroundColor: active ? colors.accentBgStrong : colors.bgCard,
                    borderWidth: 1.5, borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  })}>
                  <Text style={{ color: active ? colors.primary : colors.text, fontSize: 16, fontWeight: '700' }}>{getOptionLabel(opt)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Pressable onPress={next}
        accessibilityRole="button"
        accessibilityLabel={step < STEPS.length - 1 ? t('continue') : t('start')}
        style={({ pressed }) => ({ padding: 18, borderRadius: 16, backgroundColor: colors.primaryStrong, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}>
        <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '800' }}>
          {step < STEPS.length - 1 ? t('continue') : t('start')}
        </Text>
      </Pressable>
    </View>
  );
}
