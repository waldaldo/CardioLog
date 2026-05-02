import { getColors, palette } from '../tokens';

describe('getColors', () => {
  it('retorna colores oscuros cuando isDark=true', () => {
    const c = getColors(true);
    expect(c.bg).toBe(palette.bgDark);
    expect(c.text).toBe(palette.textPrimary);
    expect(c.glassBg).toBe(palette.glassBg);
  });

  it('retorna colores claros cuando isDark=false', () => {
    const c = getColors(false);
    expect(c.bg).toBe(palette.bgLight);
    expect(c.text).toBe(palette.textLightPrimary);
    expect(c.glassBg).toBe(palette.glassLightBg);
  });

  it('ambos temas tienen todas las propiedades', () => {
    const dark = getColors(true);
    const light = getColors(false);
    const keys = ['bg', 'bgElevated', 'text', 'textSecondary', 'textMuted', 'glassBg', 'glassBorder', 'borderSubtle'];
    for (const k of keys) {
      expect(dark[k as keyof typeof dark]).toBeTruthy();
      expect(light[k as keyof typeof light]).toBeTruthy();
    }
  });
});
