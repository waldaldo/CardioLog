import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { getDb } from '@/db/client';
import { getProfile, getSetting, deleteReadingsOlderThan } from '@/db/repositories';
import { syncAllFromDb } from '@/lib/notifications';
import { SplashOverlay } from '@/components/SplashOverlay';
import { LangProvider } from '@/context/LangContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedNav({ children }: { children: React.ReactNode }) {
  const { isDark, colors } = useTheme();
  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.bg } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

  return (
    <NavThemeProvider value={navTheme}>
      {children}
    </NavThemeProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [locked, setLocked] = useState(false);

  const applyAutoDelete = async () => {
    const months = await getSetting('autoDeleteMonths');
    if (!months) return 0;
    const n = parseInt(months, 10);
    if (!Number.isFinite(n) || n <= 0) return 0;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - n);
    if (isNaN(cutoff.getTime())) return 0;
    return deleteReadingsOlderThan(cutoff.toISOString());
  };

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        const profile = await getProfile();
        await syncAllFromDb();
        await applyAutoDelete();
        setHasProfile(!!profile);
        const lockPinHash = await getSetting('lockPinHash');
        setLocked(!!lockPinHash);
        setReady(true);
      } catch (e: any) {
        setError(e);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  // Re-bloquear al volver del background si hay un PIN configurado.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        getSetting('lockPinHash').then((h) => {
          if (h) setLocked(true);
        }).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!hasProfile) {
      router.replace('/onboarding');
    } else if (locked) {
      router.replace('/lock');
    }
  }, [ready, hasProfile, locked]);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setShowOverlay(false), 900);
      return () => clearTimeout(t);
    }
  }, [ready]);

  if (error) {
    return (
      <View style={{
        flex: 1, backgroundColor: '#07070a',
        alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <Text style={{ color: '#ef4444', marginBottom: 10, fontSize: 18, fontWeight: '700' }}>
          Error de inicialización
        </Text>
        <Text style={{ color: '#ffffff', textAlign: 'center' }}>
          {error.message || String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'}/>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg, paddingTop: insets.top },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }}/>
        <Stack.Screen name="record" options={{ presentation: 'modal', animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="recommendations"/>
        <Stack.Screen name="reminders"/>
        <Stack.Screen name="backup"/>
        <Stack.Screen name="settings"/>
        <Stack.Screen name="lock" options={{ animation: 'fade' }}/>
        <Stack.Screen name="set-pin" options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="readings-detail"/>
      </Stack>

      {showOverlay && <SplashOverlay />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LangProvider>
        <ThemedNav>
          <AppContent />
        </ThemedNav>
      </LangProvider>
    </ThemeProvider>
  );
}
