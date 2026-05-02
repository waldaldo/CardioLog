import { getColors, palette } from '../tokens';

describe('getColors', () => {
  it('retorna colores oscuros cuando isDark=true', () => {
    const c = getColors(true);
    expect(c.bg).toBe(palette.bgDark);
    expect(c.text).toBe(palette.textDarkPrimary);
    expect(c.bgCard).toBe(palette.bgDarkCard);
  });

  it('retorna colores claros cuando isDark=false', () => {
    const c = getColors(false);
    expect(c.bg).toBe(palette.bgLight);
    expect(c.text).toBe(palette.textLightPrimary);
    expect(c.bgCard).toBe(palette.bgLightCard);
  });

  it('ambos temas exponen todas las propiedades del esquema', () => {
    const dark = getColors(true);
    const light = getColors(false);
    const keys: Array<keyof typeof dark> = [
      'bg', 'bgElevated', 'bgCard',
      'text', 'textSecondary', 'textMuted',
      'border', 'borderSubtle',
      'surfaceSubtle', 'surfaceRaised',
      'primary', 'primaryStrong', 'secondary', 'onPrimary',
      'accentBg', 'accentBgStrong', 'accentBorder',
      'glassBg', 'glassBorder',
    ];
    for (const k of keys) {
      expect(dark[k]).toBeTruthy();
      expect(light[k]).toBeTruthy();
    }
  });

  it('expone paleta OMS específica por tema', () => {
    const dark = getColors(true);
    const light = getColors(false);
    expect(dark.oms.optima).toBe('#10b981');
    expect(light.oms.optima).toBe('#047857'); // versión accesible para fondo claro
  });
});
