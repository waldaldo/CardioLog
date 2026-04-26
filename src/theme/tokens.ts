// src/theme/tokens.ts — Design tokens portados del prototipo

export const palette = {
  bgDark: '#07070a',
  bgElevated: '#151522',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.5)',
  glassBg: 'rgba(20,20,24,0.6)',
  glassBorder: 'rgba(255,255,255,0.08)',

  // Light theme
  bgLight: '#f5f7fb',
  bgLightElevated: '#ffffff',
  textLightPrimary: '#0f172a',
  textLightSecondary: 'rgba(15,23,42,0.72)',
  textLightMuted: 'rgba(15,23,42,0.5)',
  glassLightBg: 'rgba(255,255,255,0.85)',
  glassLightBorder: 'rgba(15,23,42,0.08)',
};

export const accents = {
  cyan:    { primary: '#00f0ff', secondary: '#8a2be2' },
  violet:  { primary: '#a78bfa', secondary: '#8a2be2' },
  medical: { primary: '#10b981', secondary: '#0ea5e9' },
} as const;

export type AccentKey = keyof typeof accents;

export const omsColors = {
  optima:     '#10b981',
  normal:     '#84cc16',
  normalAlta: '#facc15',
  hta1:       '#fb923c',
  hta2:       '#ef4444',
  hta3:       '#b91c1c',
};

export const typography = {
  fontFamily: 'Inter_400Regular',
  fontFamilyDisplay: 'Outfit_700Bold',
  scale: {
    normal: 1.0,
    grande: 1.15,
    xl:     1.3,
  },
};

export const spacing = (n: number) => n * 4; // 4px base
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
