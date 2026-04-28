import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Animación de entrada para las pestañas del bottom tab.
// Las tabs permanecen montadas en memoria mientras la app está abierta,
// por lo que el prop `entering` de Reanimated no se dispara al volver a ellas.
// useFocusEffect es el equivalente de "onResume" para tabs: corre cada vez
// que la pestaña queda activa, sin importar si fue desmontada o no.
export function TabFade({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 180 });
      return () => { opacity.value = 0; };
    }, [])
  );

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      {children}
    </Animated.View>
  );
}
