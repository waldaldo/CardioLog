import { getRecommendations } from '../recommendations';

describe('getRecommendations', () => {
  it('retorna al menos 5 recomendaciones base', () => {
    const recs = getRecommendations(120, 22);
    expect(recs.length).toBeGreaterThanOrEqual(5);
  });

  it('incluye consulta médica cuando sys >= 140', () => {
    const recs = getRecommendations(145, 22);
    const medical = recs.find(r => r.id === 'medical');
    expect(medical).toBeDefined();
  });

  it('incluye consulta médica cuando BMI > 27', () => {
    const recs = getRecommendations(120, 28);
    const medical = recs.find(r => r.id === 'medical');
    expect(medical).toBeDefined();
  });

  it('no incluye consulta médica cuando todo está bien', () => {
    const recs = getRecommendations(120, 22);
    const medical = recs.find(r => r.id === 'medical');
    expect(medical).toBeUndefined();
  });

  it('todas las recomendaciones tienen títulos bilingües', () => {
    const recs = getRecommendations(145, 28);
    for (const r of recs) {
      expect(r.title.es).toBeTruthy();
      expect(r.title.en).toBeTruthy();
      expect(r.short.es).toBeTruthy();
      expect(r.short.en).toBeTruthy();
      expect(r.detail.es).toBeTruthy();
      expect(r.detail.en).toBeTruthy();
    }
  });

  it('recomendación médica dice HTA cuando sys alto', () => {
    const recs = getRecommendations(145, 22);
    const medical = recs.find(r => r.id === 'medical');
    expect(medical!.short.es).toContain('140');
  });

  it('recomendación médica dice IMC cuando BMI alto', () => {
    const recs = getRecommendations(120, 28);
    const medical = recs.find(r => r.id === 'medical');
    expect(medical!.short.es).toContain('IMC');
  });
});
