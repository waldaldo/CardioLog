import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Vibration } from 'react-native';
import { router } from 'expo-router';
import { setSetting } from '@/db/repositories';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { ScreenHeader } from '@/components/ScreenHeader';
import * as LocalAuthentication from 'expo-local-authentication';
import Svg, { Path } from 'react-native-svg';

const PIN_LENGTH = 4;

export default function SetPinScreen() {
  const { t } = useLang();
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'first' | 'confirm'>('first');
  const [error, setError] = useState('');
  const firstPin = useRef('');

  const onDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    Vibration.vibrate(10);
    const next = pin + d;
    setPin(next);
    setError('');
    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (step === 'first') {
          firstPin.current = next;
          setPin('');
          setStep('confirm');
        } else {
          if (next === firstPin.current) {
            (async () => {
              await setSetting('lockPin', next);
              router.back();
            })();
          } else {
            Vibration.vibrate(200);
            setError(t('lockPinMismatch'));
            setPin('');
          }
        }
      }, 100);
    }
  };

  const onDelete = () => {
    setPin(p => p.slice(0, -1));
    setError('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={step === 'first' ? t('setLockPin') : t('confirmPin')} showBack />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          {step === 'first' ? t('enterNewPin') : t('confirmNewPin')}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 32 }}>
          {step === 'first' ? t('pinWillSecure') : t('pinAgain')}
        </Text>

        {error ? (
          <Text style={{ color: colors.oms.hta2, fontSize: 14, marginBottom: 16 }}>{error}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 48 }}>
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
      </View>
    </View>
  );
}