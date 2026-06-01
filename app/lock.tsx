import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, Vibration } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { Logo } from '@/components/Logo';
import { getSetting } from '@/db/repositories';
import Svg, { Path } from 'react-native-svg';

const PIN_LENGTH = 4;

export default function LockScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const biometricAvailable = useRef(false);
  const savedPin = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedPin = await getSetting('lockPin');
      savedPin.current = storedPin;
      const compat = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      biometricAvailable.current = compat && enrolled;
      if (biometricAvailable.current) {
        setTimeout(() => attemptBiometric(), 500);
      }
    })();
  }, []);

  const attemptBiometric = async () => {
    if (!biometricAvailable.current) return;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('unlockPrompt'),
        fallbackLabel: t('usePinInstead'),
        disableDeviceFallback: true,
      });
      if (result.success) {
        router.replace('/(tabs)');
      }
    } catch {}
  };

  const onDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    Vibration.vibrate(10);
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => checkPin(next), 100);
    }
  };

  const onDelete = () => setPin(p => p.slice(0, -1));

  const checkPin = (entered: string) => {
    if (entered === savedPin.current) {
      router.replace('/(tabs)');
    } else {
      Vibration.vibrate(200);
      setPin('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        Alert.alert(t('tooManyAttempts'), t('tooManyAttemptsMsg'));
      }
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 28 }}>
      <Logo size={48} />
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 20, marginBottom: 8 }}>
        CardioLog
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 32 }}>
        {t('enterPin')}
      </Text>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: i < pin.length ? colors.primaryStrong : colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280, gap: 12 }}>
        {digits.map((d) => (
          d === '' ? (
            <View key="empty" style={{ width: 80, height: 60 }} />
          ) : d === 'DEL' ? (
            <Pressable
              key="del"
              onPress={onDelete}
              accessibilityLabel={t('delete')}
              style={({ pressed }) => ({
                width: 80, height: 60, borderRadius: 16,
                backgroundColor: colors.surfaceSubtle, alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM18 9l-6 6M12 15l6-6" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </Pressable>
          ) : (
            <Pressable
              key={d}
              onPress={() => onDigit(d)}
              accessibilityLabel={d}
              style={({ pressed }) => ({
                width: 80, height: 60, borderRadius: 16,
                backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{d}</Text>
            </Pressable>
          )
        ))}
      </View>

      {biometricAvailable.current && (
        <Pressable
          onPress={attemptBiometric}
          accessibilityRole="button"
          accessibilityLabel={t('unlockBiometric')}
          style={({ pressed }) => ({
            marginTop: 28, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
            backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accentBorder,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zM8 10a5 5 0 0 0 8 0M6 17a6 6 0 0 0 12 0" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>{t('unlockBiometric')}</Text>
        </Pressable>
      )}
    </View>
  );
}