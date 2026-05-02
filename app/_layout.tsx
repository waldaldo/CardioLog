import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { getDb } from '@/db/client';
import { getProfile } from '@/db/repositories';
import { syncAllFromDb } from '@/lib/notifications';
import { Logo } from '@/components/Logo';
import { palette } from '@/theme/tokens';
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

function LoadingOverlay() {
  const opacity = useSharedValue(1);

  const dotOpacity = useSharedValue(0.3);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(500)}
      style={styles.overlay}
    >
      <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.content}>
        <Logo size={90}/>
        <Text style={styles.title}>
          <Text style={{ color: '#fff' }}>Cardio</Text>
          <Text style={{ color: '#00f0ff' }}>Log</Text>
        </Text>
        <Text style={styles.subtitle}>CONTROL DE PRESIÓN ARTERIAL</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[styles.dot, dotStyle, { animationDelay: `${i * 150}ms` }]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

  useEffect(() => {
    if (ready && !hasProfile) {
      router.replace('/onboarding');
    }
  }, [ready, hasProfile]);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setShowOverlay(false), 150);
      return () => clearTimeout(t);
    }
  }, [ready]);

  if (error) {
    return (
      <View style={[styles.overlay, { justifyContent: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', marginBottom: 10, fontSize: 18 }}>Error de inicialización:</Text>
        <Text style={{ color: 'white', textAlign: 'center' }}>{error.message || String(error)}</Text>
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
        <Stack.Screen name="readings-detail"/>
      </Stack>

      {showOverlay && <LoadingOverlay />}
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    marginTop: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '500',
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00f0ff',
  },
});
