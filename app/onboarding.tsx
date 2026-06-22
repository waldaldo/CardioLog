import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

interface OnboardingData {
  name: string;
  age: number;
  sex: 'M' | 'F';
  weight: number;
  height: number;
  theme: 'light' | 'dark';
}

type Step = 0 | 1 | 2;

export default function Onboarding() {
  const { save } = useProfile();
  const { t } = useLang();
  const { colors, setTheme, isDark } = useTheme();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    age: 60,
    sex: 'M',
    weight: 80,
    height: 170,
    theme: isDark ? 'dark' : 'light',
  });

  const next = async () => {
    if (step < 2) {
      setStep((step + 1) as Step);
      return;
    }
    try {
      await save({
        name: data.name || 'Usuario',
        age: data.age,
        sex: data.sex,
        weight_kg: data.weight,
        height_cm: data.height,
        goal_sys: 130,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(t('onbError'), t('onbErrorMsg'));
    }
  };

  const setThemeAndUpdate = (theme: 'light' | 'dark') => {
    setData({ ...data, theme });
    setTheme(theme === 'dark');
  };

  const canProceed = () => {
    if (step === 0) return data.name.trim().length > 0 && data.theme;
    if (step === 1) return data.age >= 18 && data.age <= 100;
    return true;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ flexGrow: 1, padding: 28, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo size={44} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>CardioLog</Text>
        </View>
        <View
          accessibilityLabel={`${t('stepOf')} ${step + 1} ${t('of')} 3`}
          style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: i <= step ? colors.primaryStrong : colors.surfaceRaised,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', marginVertical: 32 }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          {t('stepOf')} {step + 1} {t('of')} 3
        </Text>

        {step === 0 && (
          <>
            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 24, lineHeight: 32 }}>
              {t('onbTheme')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
              {(['light', 'dark'] as const).map((th) => {
                const active = data.theme === th;
                return (
                  <Pressable
                    key={th}
                    onPress={() => setThemeAndUpdate(th)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({
                      flex: 1,
                      padding: 22,
                      borderRadius: 16,
                      alignItems: 'center',
                      backgroundColor: active ? colors.accentBgStrong : colors.bgCard,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>{th === 'dark' ? '🌙' : '☀️'}</Text>
                    <Text
                      style={{
                        color: active ? colors.primary : colors.text,
                        fontSize: 16,
                        fontWeight: '700',
                      }}
                    >
                      {t(th)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 16 }}>
              {t('onbName')}
            </Text>
            <TextInput
              value={data.name}
              onChangeText={(v) => setData({ ...data, name: v })}
              placeholder={t('placeholderName')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('onbName')}
              autoFocus
              style={{
                padding: 16,
                fontSize: 20,
                color: colors.text,
                backgroundColor: colors.bgCard,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 24, lineHeight: 32 }}>
              {t('onbAge')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <Pressable
                onPress={() => setData({ ...data, age: Math.max(18, data.age - 1) })}
                accessibilityRole="button"
                accessibilityLabel="Disminuir edad"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>–</Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: colors.primary, fontSize: 72, fontWeight: '800', lineHeight: 76 }}
                >
                  {data.age}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    marginTop: 6,
                  }}
                >
                  {t('yearsUnit').toUpperCase()}
                </Text>
              </View>
              <Pressable
                onPress={() => setData({ ...data, age: Math.min(100, data.age + 1) })}
                accessibilityRole="button"
                accessibilityLabel="Aumentar edad"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>+</Text>
              </Pressable>
            </View>

            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 16 }}>
              {t('onbSex')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['M', 'F'] as const).map((s) => {
                const active = data.sex === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setData({ ...data, sex: s })}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({
                      flex: 1,
                      padding: 22,
                      borderRadius: 16,
                      alignItems: 'center',
                      backgroundColor: active ? colors.accentBgStrong : colors.bgCard,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: active ? colors.primary : colors.text,
                        fontSize: 16,
                        fontWeight: '700',
                      }}
                    >
                      {s === 'M' ? t('male') : t('female')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 24, lineHeight: 32 }}>
              {t('onbWeight')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <Pressable
                onPress={() => setData({ ...data, weight: Math.max(30, data.weight - 1) })}
                accessibilityRole="button"
                accessibilityLabel="Disminuir peso"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>–</Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: colors.primary, fontSize: 72, fontWeight: '800', lineHeight: 76 }}
                >
                  {data.weight}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    marginTop: 6,
                  }}
                >
                  {t('kilograms').toUpperCase()}
                </Text>
              </View>
              <Pressable
                onPress={() => setData({ ...data, weight: Math.min(200, data.weight + 1) })}
                accessibilityRole="button"
                accessibilityLabel="Aumentar peso"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>+</Text>
              </Pressable>
            </View>

            <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 16 }}>
              {t('onbHeight')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => setData({ ...data, height: Math.max(120, data.height - 1) })}
                accessibilityRole="button"
                accessibilityLabel="Disminuir altura"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>–</Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: colors.primary, fontSize: 72, fontWeight: '800', lineHeight: 76 }}
                >
                  {data.height}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    marginTop: 6,
                  }}
                >
                  {t('centimeters').toUpperCase()}
                </Text>
              </View>
              <Pressable
                onPress={() => setData({ ...data, height: Math.min(220, data.height + 1) })}
                accessibilityRole="button"
                accessibilityLabel="Aumentar altura"
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceSubtle,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>+</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      <Pressable
        onPress={next}
        accessibilityRole="button"
        accessibilityLabel={step < 2 ? t('continue') : t('start')}
        disabled={!canProceed()}
        style={({ pressed }) => ({
          padding: 18,
          borderRadius: 16,
          backgroundColor: canProceed() ? colors.primaryStrong : colors.surfaceSubtle,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            color: canProceed() ? colors.onPrimary : colors.textMuted,
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          {step < 2 ? t('continue') : t('start')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}