import Animated, { SlideInRight } from 'react-native-reanimated';

// Animación de entrada para pantallas dentro del Stack (record, settings, etc.).
// Usa SlideInRight en lugar de FadeIn porque FadeIn empieza en opacity 0,
// lo que revelaría el fondo blanco del contenedor nativo en Android.
// SlideInRight desplaza la vista sin cambiar opacidad, así nunca hay transparencia.
export function ScreenSlide({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={SlideInRight.duration(220)} style={{ flex: 1 }}>
      {children}
    </Animated.View>
  );
}
