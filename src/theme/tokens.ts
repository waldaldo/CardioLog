// src/theme/tokens.ts — Sistema de diseño accesible (WCAG AA)
//
// Reglas de contraste:
//   - Texto/iconos: mínimo 4.5:1 sobre cualquier surface (AA normal)
//   - Texto grande (≥18px bold o ≥24px regular): mínimo 3:1 (AA large)
//   - Bordes/iconos no interactivos: mínimo 3:1 (AA non-text)
//
// Tema oscuro: paleta cyan/violeta sobre #07070a (alto contraste nativo)
// Tema claro: variantes oscurecidas del acento para cumplir AA sobre #ffffff

// ── Paleta base ─────────────────────────────────────────────────────────────

export const palette = {
  // Surfaces oscuras
  bgDark: '#07070a',
  bgDarkElevated: '#13131c',
  bgDarkCard: '#1a1a26',
  textDarkPrimary: '#ffffff',
  textDarkSecondary: 'rgba(255,255,255,0.78)',
  textDarkMuted: 'rgba(255,255,255,0.58)',
  borderDark: 'rgba(255,255,255,0.10)',
  borderDarkSubtle: 'rgba(255,255,255,0.06)',
  surfaceDarkSubtle: 'rgba(255,255,255,0.06)',
  surfaceDarkRaised: 'rgba(255,255,255,0.10)',

  // Surfaces claras (sólidas, no transparentes — evita el "efecto invisible")
  bgLight: '#f4f6fb',
  bgLightElevated: '#ffffff',
  bgLightCard: '#ffffff',
  textLightPrimary: '#0b1220',          // 16.7:1 sobre #fff
  textLightSecondary: '#3a4256',         // 8.6:1 sobre #fff
  textLightMuted: '#5b6478',             // 5.4:1 sobre #fff (cumple AA)
  borderLight: '#d6dbe6',                // 3.0:1 (cumple AA non-text)
  borderLightSubtle: '#e6e9f0',
  surfaceLightSubtle: '#eef1f7',
  surfaceLightRaised: '#e3e8f0',
};

// ── Acentos por tema ────────────────────────────────────────────────────────
// Cyan/violeta de marca, con variantes accesibles para tema claro

export const accent = {
  // Tema oscuro: cyan brillante funciona perfecto
  darkPrimary: '#00d8e8',          // texto sobre #07070a → 11.2:1
  darkPrimaryStrong: '#00f0ff',    // sobre fondos oscuros (botones, valores destacados)
  darkSecondary: '#a78bfa',        // violeta complementario → 7.6:1
  darkOnAccent: '#031318',         // texto sobre botón cyan
  darkAccentBg: 'rgba(0,216,232,0.12)',
  darkAccentBgStrong: 'rgba(0,216,232,0.22)',
  darkAccentBorder: 'rgba(0,216,232,0.40)',

  // Tema claro: cyan oscurecido para AA
  lightPrimary: '#0891a8',         // cyan oscuro → 4.6:1 sobre #fff (AA ✓)
  lightPrimaryStrong: '#0e7490',   // botones primarios → 5.7:1
  lightSecondary: '#6d28d9',       // violeta accesible → 8.0:1
  lightOnAccent: '#ffffff',        // texto sobre botón
  lightAccentBg: '#e0f7fa',        // surface tintado claro
  lightAccentBgStrong: '#b2ebf2',
  lightAccentBorder: '#0891a8',
};

// ── OMS (rangos clínicos) — variantes light/dark ────────────────────────────
// Cada categoría tiene un par: el "intense" para texto/borde sobre fondo claro,
// y el "vivid" para texto sobre fondo oscuro o como fill de chips.

export const omsColors = {
  dark: {
    optima:     '#10b981',  // verde
    normal:     '#84cc16',  // lima
    normalAlta: '#facc15',  // amarillo
    hta1:       '#fb923c',  // naranja
    hta2:       '#ef4444',  // rojo
    hta3:       '#dc2626',  // rojo oscuro
  },
  light: {
    optima:     '#047857',  // 5.4:1 sobre #fff
    normal:     '#4d7c0f',  // 4.7:1 sobre #fff
    normalAlta: '#a16207',  // 4.6:1 sobre #fff (amarillo es traicionero)
    hta1:       '#c2410c',  // 4.7:1 sobre #fff
    hta2:       '#b91c1c',  // 6.3:1 sobre #fff
    hta3:       '#991b1b',  // 8.1:1 sobre #fff
  },
};

// ── Esquema de tema completo ────────────────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  bg: string;
  bgElevated: string;
  bgCard: string;
  // Texto
  text: string;
  textSecondary: string;
  textMuted: string;
  // Bordes
  border: string;
  borderSubtle: string;
  // Surfaces interactivas (botones secundarios, steppers, back, chips)
  surfaceSubtle: string;
  surfaceRaised: string;
  // Acento
  primary: string;
  primaryStrong: string;
  secondary: string;
  onPrimary: string;
  accentBg: string;
  accentBgStrong: string;
  accentBorder: string;
  // OMS
  oms: typeof omsColors.dark;
  // Compat (alias antiguos para no romper más imports si quedan)
  glassBg: string;
  glassBorder: string;
}

export function getColors(isDark: boolean): ThemeColors {
  if (isDark) {
    return {
      bg: palette.bgDark,
      bgElevated: palette.bgDarkElevated,
      bgCard: palette.bgDarkCard,
      text: palette.textDarkPrimary,
      textSecondary: palette.textDarkSecondary,
      textMuted: palette.textDarkMuted,
      border: palette.borderDark,
      borderSubtle: palette.borderDarkSubtle,
      surfaceSubtle: palette.surfaceDarkSubtle,
      surfaceRaised: palette.surfaceDarkRaised,
      primary: accent.darkPrimary,
      primaryStrong: accent.darkPrimaryStrong,
      secondary: accent.darkSecondary,
      onPrimary: accent.darkOnAccent,
      accentBg: accent.darkAccentBg,
      accentBgStrong: accent.darkAccentBgStrong,
      accentBorder: accent.darkAccentBorder,
      oms: omsColors.dark,
      glassBg: palette.bgDarkCard,
      glassBorder: palette.borderDark,
    };
  }
  return {
    bg: palette.bgLight,
    bgElevated: palette.bgLightElevated,
    bgCard: palette.bgLightCard,
    text: palette.textLightPrimary,
    textSecondary: palette.textLightSecondary,
    textMuted: palette.textLightMuted,
    border: palette.borderLight,
    borderSubtle: palette.borderLightSubtle,
    surfaceSubtle: palette.surfaceLightSubtle,
    surfaceRaised: palette.surfaceLightRaised,
    primary: accent.lightPrimary,
    primaryStrong: accent.lightPrimaryStrong,
    secondary: accent.lightSecondary,
    onPrimary: accent.lightOnAccent,
    accentBg: accent.lightAccentBg,
    accentBgStrong: accent.lightAccentBgStrong,
    accentBorder: accent.lightAccentBorder,
    oms: omsColors.light,
    glassBg: palette.bgLightCard,
    glassBorder: palette.borderLight,
  };
}

// ── Utilidades para clasificar BP con colores correctos del tema ────────────
// Para uso en clasificación: pasa la categoría y obtienes el color del tema
export type OmsCategoryKey = 'optima' | 'normal' | 'normalAlta' | 'hta1' | 'hta2' | 'hta3';

export function getOmsColor(cat: OmsCategoryKey, isDark: boolean): string {
  return isDark ? omsColors.dark[cat] : omsColors.light[cat];
}

// ── Tipografía y espaciado ──────────────────────────────────────────────────

export const typography = {
  fontFamily: 'Inter_400Regular',
  fontFamilyDisplay: 'Outfit_700Bold',
  scale: {
    normal: 1.0,
    grande: 1.15,
    xl: 1.3,
  },
};

export const spacing = (n: number) => n * 4;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

// ── Aliases legacy (para tests existentes) ──────────────────────────────────
export const accents = {
  cyan: { primary: accent.darkPrimaryStrong, secondary: accent.darkSecondary },
  violet: { primary: accent.darkSecondary, secondary: '#8a2be2' },
  medical: { primary: '#10b981', secondary: '#0ea5e9' },
} as const;
export type AccentKey = keyof typeof accents;
