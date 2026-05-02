// app/(tabs)/_layout.tsx — Bottom tab bar

import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', paddingTop: 10 }}>
      <View style={{
        width: 28, height: 3, borderRadius: 2,
        backgroundColor: focused ? '#00f0ff' : 'transparent',
        marginBottom: 6,
      }}/>
      <Text style={{
        color: focused ? '#00f0ff' : colors.textMuted,
        fontSize: 12,
        fontWeight: focused ? '700' : '500',
        letterSpacing: 0.3,
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { colors } = useTheme();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      sceneContainerStyle: { backgroundColor: colors.bg },
      tabBarStyle: {
        backgroundColor: colors.bg,
        borderTopColor: colors.glassBorder,
        borderTopWidth: 1,
        height: tabBarHeight,
        paddingBottom: insets.bottom,
        paddingTop: 0,
      },
      tabBarShowLabel: false,
      tabBarItemStyle: {
        flex: 1,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabBarIconStyle: {
        width: '100%',
        height: '100%',
      },
    }}>
    <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label={t('home')}/> }}/>
    <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label={t('history')}/> }}/>
    <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label={t('profile')}/> }}/>
    </Tabs>
  );
}
