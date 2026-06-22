import { stdDev, cv } from '../stats';

describe('stdDev', () => {
  it('retorna 0 con array vacío', () => {
    expect(stdDev([], 'sys')).toBe(0);
  });

  it('retorna 0 con un solo elemento', () => {
    expect(stdDev([{ sys: 120 }], 'sys')).toBe(0);
  });

  it('retorna 0 con valores idénticos', () => {
    expect(stdDev([{ sys: 120 }, { sys: 120 }, { sys: 120 }], 'sys')).toBe(0);
  });

  it('calcula desvío estándar muestral de [120, 130, 140]', () => {
    // media=130, diff²=[100,0,100], sum=200, / (3-1) = 100, sqrt = 10
    expect(stdDev([{ sys: 120 }, { sys: 130 }, { sys: 140 }], 'sys')).toBeCloseTo(10, 5);
  });

  it('con 2 elementos usa la diferencia absoluta (denominador n-1=1)', () => {
    // media=125, diff²=[25,25], /1 = 50, sqrt ≈ 7.07
    expect(stdDev([{ sys: 120 }, { sys: 130 }], 'sys')).toBeCloseTo(Math.sqrt(50), 5);
  });

  it('ignora NaN', () => {
    expect(stdDev([{ sys: 120 }, { sys: 130 }, { sys: 140 }, { sys: NaN }], 'sys')).toBeCloseTo(10, 5);
  });

  it('ignora valores no numéricos', () => {
    expect(stdDev([{ sys: 120 }, { sys: 130 }, { sys: 140 }, { sys: 'abc' as any }], 'sys')).toBeCloseTo(10, 5);
  });

  it('retorna 0 si todos los valores son NaN', () => {
    expect(stdDev([{ sys: NaN }, { sys: NaN }, { sys: NaN }], 'sys')).toBe(0);
  });

  it('retorna 0 si tras filtrar queda menos de 2 valores', () => {
    expect(stdDev([{ sys: 120 }, { sys: NaN }], 'sys')).toBe(0);
  });
});

describe('cv', () => {
  it('retorna 0 con array vacío', () => {
    expect(cv([], 'sys')).toBe(0);
  });

  it('retorna 0 con un solo elemento', () => {
    expect(cv([{ sys: 120 }], 'sys')).toBe(0);
  });

  it('retorna 0 con valores idénticos', () => {
    expect(cv([{ sys: 120 }, { sys: 120 }, { sys: 120 }], 'sys')).toBe(0);
  });

  it('calcula CV% de [120, 130, 140]', () => {
    // σ=10, media=130, CV = 10/130 * 100 ≈ 7.69
    expect(cv([{ sys: 120 }, { sys: 130 }, { sys: 140 }], 'sys')).toBeCloseTo(7.692, 2);
  });

  it('retorna 0 si la media es 0', () => {
    expect(cv([{ sys: 0 }, { sys: 0 }, { sys: 0 }], 'sys')).toBe(0);
  });

  it('ignora NaN', () => {
    expect(cv([{ sys: 120 }, { sys: 130 }, { sys: 140 }, { sys: NaN }], 'sys')).toBeCloseTo(7.692, 2);
  });
});
