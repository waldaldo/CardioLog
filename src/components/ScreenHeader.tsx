// src/components/ScreenHeader.tsx — Header con back button + título

import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from './BackButton';
import { useTheme } from '@/context/ThemeContext';

export function ScreenHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    }}>
      <BackButton/>
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 22, fontWeight: '800', flex: 1 }}>
        {title}
      </Text>
      {right}
    </View>
  );
}
