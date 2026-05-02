import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useReadings } from '@/hooks/useReadings';
import { classifyBP, omsColorFor } from '@/lib/oms';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function RecordScreen() {
  const { add } = useReadings();
  const { lang, t } = useLang();
  const { colors, isDark } = useTheme();
  const [sys, setSys] = useState(132);
  const [dia, setDia] = useState(84);
  const [pulse, setPulse] = useState(74);
  const [moment, setMoment] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const cat = classifyBP(sys, dia);
  const catColor = omsColorFor(cat.id, isDark);

  const momentLabels: Record<string, string> = {
    morning: t('morning'),
    afternoon: t('afternoon'),
    evening: t('evening'),
  };

  const save = async () => {
    try {
      await add({
        ts: new Date().toISOString(),
        sys, dia, pulse, moment, note: '',
      });
      router.back();
    } catch (e: any) {
      Alert.alert(t('saveError'), t('saveErrorMsg'));
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title={t('recordTitle')}/>

      <View
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${cat.label[lang]}, ${cat.rangeText} ${t('mmHg')}`}
        style={{
          padding: 16, borderRadius: 16, alignItems: 'center',
          backgroundColor: catColor + (isDark ? '22' : '14'),
          borderWidth: 1, borderColor: catColor + (isDark ? '55' : '66'),
          marginBottom: 12,
        }}>
        <Text style={{ color: catColor, fontSize: 15, fontWeight: '800' }}>{cat.label[lang]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{cat.rangeText} {t('mmHg')}</Text>
      </View>

      <Stepper label={t('systolic')} unit={t('mmHg')} value={sys} setValue={setSys} min={70} max={220} accent={colors.primary}/>
      <Stepper label={t('diastolic')} unit={t('mmHg')} value={dia} setValue={setDia} min={40} max={140} accent={colors.secondary}/>
      <Stepper label={t('pulse')} unit={t('bpm')} value={pulse} setValue={setPulse} min={30} max={200} accent={colors.oms.hta2}/>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 20 }}>
        {(['morning', 'afternoon', 'evening'] as const).map(m => {
          const active = moment === m;
          return (
            <Pressable key={m} onPress={() => setMoment(m)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={momentLabels[m]}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 14, alignItems: 'center',
                backgroundColor: active ? colors.accentBgStrong : colors.surfaceSubtle,
                borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              })}>
              <Text style={{
                color: active ? colors.primary : colors.text,
                fontWeight: active ? '800' : '600', fontSize: 13,
              }}>
                {momentLabels[m]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={save}
        accessibilityRole="button"
        accessibilityLabel={t('save')}
        style={({ pressed }) => ({
          padding: 18, borderRadius: 14,
          backgroundColor: colors.primaryStrong,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '800' }}>{t('save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

interface StepperProps {
  label: string; unit: string; value: number;
  setValue: (v: number) => void; min: number; max: number; accent: string;
}
function Stepper({ label, unit, value, setValue, min, max, accent }: StepperProps) {
  const { colors } = useTheme();
  return (
    <View style={{
      padding: 16, borderRadius: 16, marginBottom: 10,
      backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{unit}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <StepBtn label="–" onPress={() => setValue(Math.max(min, value - 1))} a11y={`Disminuir ${label}`}/>
        <Text accessibilityLiveRegion="polite" accessibilityLabel={`${label} ${value} ${unit}`}
          style={{ flex: 1, textAlign: 'center', color: accent, fontSize: 48, fontWeight: '800' }}>{value}</Text>
        <StepBtn label="+" onPress={() => setValue(Math.min(max, value + 1))} a11y={`Aumentar ${label}`}/>
      </View>
    </View>
  );
}

function StepBtn({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: colors.surfaceSubtle,
        borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '600', lineHeight: 26 }}>{label}</Text>
    </Pressable>
  );
}
