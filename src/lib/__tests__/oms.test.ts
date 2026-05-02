import { classifyBP, bmiOf, bmiCategory, OMS_CATEGORIES } from '../oms';

describe('classifyBP', () => {
  it('clasifica presión óptima', () => {
    const r = classifyBP(110, 70);
    expect(r.id).toBe('optima');
  });

  it('clasifica presión normal', () => {
    const r = classifyBP(120, 80);
    expect(r.id).toBe('normal');
  });

  it('clasifica normal alta', () => {
    const r = classifyBP(130, 85);
    expect(r.id).toBe('normalAlta');
  });

  it('clasifica HTA grado 1', () => {
    const r = classifyBP(140, 90);
    expect(r.id).toBe('hta1');
  });

  it('clasifica HTA grado 2', () => {
    const r = classifyBP(160, 100);
    expect(r.id).toBe('hta2');
  });

  it('clasifica HTA grado 3', () => {
    const r = classifyBP(180, 110);
    expect(r.id).toBe('hta3');
  });

  it('aplica el criterio más alto entre sistólica y diastólica', () => {
    const r = classifyBP(110, 100);
    expect(r.id).toBe('hta2');
  });

  it('sistólica alta domina sobre diastólica baja', () => {
    const r = classifyBP(150, 70);
    expect(r.id).toBe('hta1');
  });

  it('valores en el límite inferior de cada rango', () => {
    expect(classifyBP(0, 0).id).toBe('optima');
    expect(classifyBP(120, 80).id).toBe('normal');
    expect(classifyBP(130, 85).id).toBe('normalAlta');
    expect(classifyBP(140, 90).id).toBe('hta1');
    expect(classifyBP(160, 100).id).toBe('hta2');
    expect(classifyBP(180, 110).id).toBe('hta3');
  });

  it('valores en el límite superior de cada rango', () => {
    expect(classifyBP(119, 79).id).toBe('optima');
    expect(classifyBP(129, 84).id).toBe('normal');
    expect(classifyBP(139, 89).id).toBe('normalAlta');
    expect(classifyBP(159, 99).id).toBe('hta1');
    expect(classifyBP(179, 109).id).toBe('hta2');
  });

  it('todas las categorías tienen etiquetas bilingües', () => {
    for (const cat of OMS_CATEGORIES) {
      expect(cat.label.es).toBeTruthy();
      expect(cat.label.en).toBeTruthy();
    }
  });
});

describe('bmiOf', () => {
  it('calcula IMC correctamente', () => {
    expect(bmiOf(80, 180)).toBeCloseTo(24.69, 1);
  });

  it('retorna 0 si falta height', () => {
    expect(bmiOf(80, 0)).toBe(0);
  });

  it('retorna 0 si falta weight', () => {
    expect(bmiOf(0, 180)).toBe(0);
  });
});

describe('bmiCategory', () => {
  it('clasifica bajo peso', () => {
    expect(bmiCategory(17, 'es')).toBe('Bajo peso');
    expect(bmiCategory(17, 'en')).toBe('Underweight');
  });

  it('clasifica normal', () => {
    expect(bmiCategory(22, 'es')).toBe('Normal');
    expect(bmiCategory(22, 'en')).toBe('Normal');
  });

  it('clasifica sobrepeso', () => {
    expect(bmiCategory(27, 'es')).toBe('Sobrepeso');
    expect(bmiCategory(27, 'en')).toBe('Overweight');
  });

  it('clasifica obesidad', () => {
    expect(bmiCategory(32, 'es')).toBe('Obesidad');
    expect(bmiCategory(32, 'en')).toBe('Obese');
  });
});
