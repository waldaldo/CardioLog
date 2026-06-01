import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSetting, setSetting } from '@/db/repositories';
import { getColors, ThemeColors, typography } from '@/theme/tokens';

export type FontScale = 'normal' | 'grande' | 'xl';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (dark: boolean) => Promise<void>;
  fontScale: FontScale;
  fontSize: (base: number) => number;
  setFontScale: (scale: FontScale) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  colors: getColors(true),
  setTheme: async () => {},
  fontScale: 'normal',
  fontSize: (base: number) => base,
  setFontScale: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [fontScale, setFontScaleState] = useState<FontScale>('normal');

  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await getSetting('theme');
        setIsDark(storedTheme !== 'light');
        const storedScale = await getSetting('fontScale');
        if (storedScale === 'grande' || storedScale === 'xl') {
          setFontScaleState(storedScale as FontScale);
        }
      } catch {}
    })();
  }, []);

  const colors = getColors(isDark);

  const setTheme = useCallback(async (dark: boolean) => {
    setIsDark(dark);
    try { await setSetting('theme', dark ? 'dark' : 'light'); } catch {}
  }, []);

  const setFontScale = useCallback(async (scale: FontScale) => {
    setFontScaleState(scale);
    try { await setSetting('fontScale', scale); } catch {}
  }, []);

  const fontSize = useCallback((base: number) => {
    return Math.round(base * typography.scale[fontScale]);
  }, [fontScale]);

  return (
    <ThemeContext.Provider value={{ isDark, colors, setTheme, fontScale, fontSize, setFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
