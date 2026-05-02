// src/components/SplashOverlay.tsx — Splash animado nativo
//
// Composición:
//   - LinearGradient nativo (expo-linear-gradient) anclado al viewport — más
//     fluido que un PNG estático en cualquier resolución
//   - Halo radial animado con SVG (RadialGradient) y Reanimated
//   - Logo con escala "breath" (latido suave) sincronizada con los dots
//   - Tipografía con fade-in escalonado para sentirse cinemática

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Logo } from './Logo';

const { width: W, height: H } = Dimensions.get('window');

export function SplashOverlay() {
  // Latido sincronizado al ritmo cardiaco humano de reposo (~70 bpm = ~860ms ciclo)
  const beat = useSharedValue(1);
  // Halo respira a la mitad de velocidad
  const haloScale = useSharedValue(0.95);
  const haloOpacity = useSharedValue(0.6);
  // Dots
  const dot0 = useSharedValue(0.3);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);

  useEffect(() => {
    // Latido: subida rápida + bajada lenta (mimética del electrocardiograma)
    beat.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0.98, { duration: 220, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 460, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.55, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );

    const dotAnim = (sv: typeof dot0, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    };
    dotAnim(dot0, 0);
    dotAnim(dot1, 150);
    dotAnim(dot2, 300);
  }, []);

  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beat.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));
  const dot0Style = useAnimatedStyle(() => ({ opacity: dot0.value }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(420)}
      style={styles.overlay}
    >
      {/* Gradiente base nativo: rinde a 60fps sin work en JS */}
      <LinearGradient
        colors={['#07070a', '#0d0d1a', '#1a1428']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Halo radial respirando, dibujado en SVG (escalable + animable) */}
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <Svg width={W} height={H * 0.6} viewBox={`0 0 ${W} ${H * 0.6}`}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35"/>
              <Stop offset="40%" stopColor="#6366f1" stopOpacity="0.18"/>
              <Stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={W} height={H * 0.6} fill="url(#halo)"/>
        </Svg>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(500)} style={beatStyle}>
          <Logo size={104}/>
        </Animated.View>

        <Animated.Text
          entering={FadeIn.duration(500).delay(180)}
          style={styles.title}
        >
          <Text style={styles.titleA}>Cardio</Text>
          <Text style={styles.titleB}>Log</Text>
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.duration(500).delay(320)}
          style={styles.subtitle}
        >
          CONTROL DE PRESIÓN ARTERIAL
        </Animated.Text>

        <Animated.View
          entering={FadeIn.duration(500).delay(460)}
          style={styles.dotsRow}
        >
          <Animated.View style={[styles.dot, dot0Style]}/>
          <Animated.View style={[styles.dot, dot1Style]}/>
          <Animated.View style={[styles.dot, dot2Style]}/>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07070a',
  },
  halo: {
    position: 'absolute',
    top: H * 0.15,
    left: 0,
    right: 0,
    height: H * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    marginTop: 22,
    letterSpacing: -0.5,
  },
  titleA: { color: '#ffffff' },
  titleB: { color: '#22d3ee' },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '600',
    marginTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 52,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
  },
});
