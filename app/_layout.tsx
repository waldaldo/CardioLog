import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { getDb } from '@/db/client';
import { getProfile } from '@/db/repositories';
import { syncAllFromDb } from '@/lib/notifications';
import { Logo } from '@/components/Logo';
import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Overlay animado que se muestra mientras carga la BD.
// Coincide con el splash nativo para una transición imperceptible.
function LoadingOverlay() {
  const opacity = useSharedValue(1);

  // Pulso suave en el punto de carga
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

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fase 1: inicializa la BD y determina si el usuario ya completó el onboarding.
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

  // Fase 2: navega a onboarding SOLO después de que el Stack esté montado.
  // Si se hace la redirección dentro de la Fase 1 (antes del primer render),
  // Expo Router no tiene el árbol de navegación listo y lanza un error.
  useEffect(() => {
    if (ready && !hasProfile) {
      router.replace('/onboarding');
    }
  }, [ready, hasProfile]);

  // Fase 3: pequeña pausa para que el FadeOut del overlay se vea completo.
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
    <View style={{ flex: 1, backgroundColor: palette.bgDark }}>
      <StatusBar style="light"/>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bgDark, paddingTop: insets.top },
        sceneContainerStyle: { backgroundColor: palette.bgDark },
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

      {/* El overlay se renderiza encima del Stack y se desvanece al terminar la carga */}
      {showOverlay && <LoadingOverlay />}
    </View>
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
