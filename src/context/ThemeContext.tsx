import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSetting, setSetting } from '@/db/repositories';
import { getColors, ThemeColors } from '@/theme/tokens';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (dark: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  colors: getColors(true),
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getSetting('theme');
        setIsDark(stored !== 'light');
      } catch {}
    })();
  }, []);

  const colors = getColors(isDark);

  const setTheme = useCallback(async (dark: boolean) => {
    setIsDark(dark);
    try { await setSetting('theme', dark ? 'dark' : 'light'); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
