import { avg, daysAgo, I18N } from '../i18n';

describe('avg', () => {
  it('calcula promedio de números enteros', () => {
    expect(avg([{ sys: 120 }, { sys: 130 }, { sys: 140 }], 'sys')).toBe(130);
  });

  it('retorna 0 para array vacío', () => {
    expect(avg([], 'sys')).toBe(0);
  });

  it('ignora valores NaN', () => {
    expect(avg([{ sys: 120 }, { sys: NaN }, { sys: 140 }], 'sys')).toBe(130);
  });

  it('ignora valores no numéricos', () => {
    expect(avg([{ sys: 120 }, { sys: 'abc' as any }, { sys: 140 }], 'sys')).toBe(130);
  });

  it('retorna 0 si todos los valores son NaN', () => {
    expect(avg([{ sys: NaN }, { sys: NaN }], 'sys')).toBe(0);
  });

  it('redondea al entero más cercano', () => {
    expect(avg([{ sys: 121 }, { sys: 122 }], 'sys')).toBe(122);
  });
});

describe('daysAgo', () => {
  it('filtra mediciones dentro del rango', () => {
    const now = new Date();
    const within = new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString();
    const outside = new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString();
    const readings = [
      { ts: within, sys: 120, dia: 80 },
      { ts: outside, sys: 140, dia: 90 },
    ];
    const result = daysAgo(readings, 7);
    expect(result).toHaveLength(1);
    expect(result[0].sys).toBe(120);
  });

  it('retorna todos si todos están dentro del rango', () => {
    const now = new Date();
    const r1 = new Date(now.getTime() - 1000).toISOString();
    const r2 = new Date(now.getTime() - 2000).toISOString();
    const readings = [{ ts: r1 }, { ts: r2 }];
    expect(daysAgo(readings, 7)).toHaveLength(2);
  });

  it('retorna vacío si ningún registro está en el rango', () => {
    const old = new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString();
    const readings = [{ ts: old }];
    expect(daysAgo(readings, 7)).toHaveLength(0);
  });

  it('preserva las propiedades adicionales del tipo genérico', () => {
    const now = new Date();
    const ts = new Date(now.getTime() - 1000).toISOString();
    const readings = [{ ts, sys: 120, dia: 80, pulse: 72 }];
    const result = daysAgo(readings, 7);
    expect(result[0].sys).toBe(120);
    expect(result[0].pulse).toBe(72);
  });
});

describe('I18N', () => {
  it('ambos idiomas tienen las mismas claves', () => {
    const esKeys = Object.keys(I18N.es).sort();
    const enKeys = Object.keys(I18N.en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('no hay valores vacíos en español', () => {
    for (const [key, val] of Object.entries(I18N.es)) {
      expect(val).not.toBe('');
    }
  });

  it('no hay valores vacíos en inglés', () => {
    for (const [key, val] of Object.entries(I18N.en)) {
      expect(val).not.toBe('');
    }
  });
});
