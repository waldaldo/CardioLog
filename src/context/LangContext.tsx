import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as Localization from 'expo-localization';
import { getSetting, setSetting } from '@/db/repositories';
import { I18N, Lang } from '@/lib/i18n';

interface LangContextValue {
  lang: Lang;
  locale: string;
  t: (key: string) => string;
  setLang: (l: Lang) => Promise<void>;
}

const LangContext = createContext<LangContextValue>({
  lang: 'es',
  locale: 'es-CL',
  t: (key: string) => (I18N.es as any)[key] ?? key,
  setLang: async () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    (async () => {
      try {
        const stored = await getSetting('lang');
        if (stored === 'en' || stored === 'es') {
          setLangState(stored);
        } else {
          // Auto-detect language
          const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
          const autoLang: Lang = deviceLang === 'es' ? 'es' : 'en';
          setLangState(autoLang);
          // Don't save to DB yet, wait for user or onboarding completion if needed
          // but we can save it as initial default
          await setSetting('lang', autoLang);
        }
      } catch {}
    })();
  }, []);

  const locale = lang === 'es' ? 'es-CL' : 'en-US';

  const t = useCallback(
    (key: string): string => {
      const dict = I18N[lang] as any;
      return dict[key] ?? key;
    },
    [lang],
  );

  const setLang = useCallback(async (l: Lang) => {
    setLangState(l);
    try { await setSetting('lang', l); } catch {}
  }, []);

  return (
    <LangContext.Provider value={{ lang, locale, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
