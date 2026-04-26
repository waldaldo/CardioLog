// app/_layout.tsx — Root layout with SQLite init + onboarding gate

import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { getDb } from '@/db/client';
import { getProfile } from '@/db/repositories';
import { syncAllFromDb } from '@/lib/notifications';
import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fase 1: inicializar BD y leer perfil
  useEffect(() => {
    (async () => {
      try {
        await getDb();
        const profile = await getProfile();
        await syncAllFromDb();
        setHasProfile(!!profile);
        setReady(true);
      } catch (e: any) {
        setError(e);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  // Fase 2: navegar solo después de que el Stack esté montado
  useEffect(() => {
    if (ready && !hasProfile) {
      router.replace('/onboarding');
    }
  }, [ready, hasProfile]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bgDark, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10, fontSize: 18 }}>Error de inicialización:</Text>
        <Text style={{ color: 'white', textAlign: 'center' }}>{error.message || String(error)}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bgDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#00f0ff" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bgDark }}>
      <StatusBar style="light"/>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bgDark, paddingTop: insets.top },
        animation: 'fade_from_bottom',
      }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }}/>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }}/>
        <Stack.Screen name="record" options={{ presentation: 'modal', animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="recommendations"/>
        <Stack.Screen name="reminders"/>
        <Stack.Screen name="backup"/>
        <Stack.Screen name="settings"/>
      </Stack>
    </View>
  );
}
