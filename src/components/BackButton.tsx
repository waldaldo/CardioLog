// src/components/BackButton.tsx — Botón de volver consistente y accesible

import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export function BackButton({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel={t('back') || 'Volver'}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surfaceSubtle,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18l-6-6 6-6" stroke={colors.text} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    </Pressable>
  );
}
