// src/lib/recommendations.ts — OMS lifestyle recommendations

export interface Recommendation {
  id: string;
  icon: string;
  color: string;
  title: { es: string; en: string };
  short: { es: string; en: string };
  detail: { es: string; en: string };
}

export function getRecommendations(avgSys: number, bmi: number): Recommendation[] {
  const recs: Recommendation[] = [];
  const isHigh = avgSys >= 140;

  if (isHigh || bmi > 27) {
    const shortEs = isHigh
      ? 'Tu promedio supera 140/90. Agenda con cardiología.'
      : 'Tu IMC supera 27. El sobrepeso eleva el riesgo cardiovascular.';
    const shortEn = isHigh
      ? 'Your avg is over 140/90. Book cardiology.'
      : 'Your BMI is over 27. Excess weight raises cardiovascular risk.';
    recs.push({
      id: 'medical', icon: 'shield', color: '#ef4444',
      title: { es: 'Consulta médica', en: 'See a doctor' },
      short: { es: shortEs, en: shortEn },
      detail: {
        es: 'La OMS clasifica ≥140/90 como hipertensión. El tratamiento farmacológico puede ser necesario.',
        en: 'WHO classifies ≥140/90 as hypertension. Medication may be required.',
      },
    });
  }
  recs.push(
    {
      id: 'salt', icon: 'salt', color: '#fb923c',
      title: { es: 'Reduce la sal', en: 'Reduce salt' },
      short: { es: 'Meta OMS: menos de 5 g al día (< 1 cucharadita).', en: 'WHO goal: less than 5 g/day.' },
      detail: { es: 'Evita ultraprocesados, embutidos y caldos concentrados.', en: 'Avoid processed foods and cured meats.' },
    },
    {
      id: 'walk', icon: 'run', color: '#10b981',
      title: { es: 'Camina 30 min al día', en: 'Walk 30 min daily' },
      short: { es: '150 min/semana moderado reducen ~8 mmHg.', en: '150 min/week lowers ~8 mmHg.' },
      detail: { es: 'Reparte en 5 sesiones. Ritmo: puedes hablar pero no cantar.', en: '5 sessions a week. You can talk but not sing.' },
    },
    {
      id: 'diet', icon: 'apple', color: '#84cc16',
      title: { es: 'Dieta DASH', en: 'DASH diet' },
      short: { es: 'Frutas, verduras, legumbres y lácteos descremados.', en: 'Fruit, vegetables, legumes, low-fat dairy.' },
      detail: { es: 'Rica en potasio, magnesio y calcio. ~8-14 mmHg de reducción.', en: 'Rich in potassium/magnesium/calcium. ~8-14 mmHg reduction.' },
    },
    {
      id: 'sleep', icon: 'moon', color: '#a78bfa',
      title: { es: 'Dormir 7-8 horas', en: 'Sleep 7-8 hours' },
      short: { es: 'El mal sueño eleva la presión matinal.', en: 'Poor sleep raises morning BP.' },
      detail: { es: 'Horarios regulares. Evita pantallas 1 h antes.', en: 'Regular schedule. Avoid screens 1h before.' },
    },
    {
      id: 'stress', icon: 'brain', color: '#00f0ff',
      title: { es: 'Manejar el estrés', en: 'Manage stress' },
      short: { es: '10 min de respiración profunda al día.', en: '10 min deep breathing daily.' },
      detail: { es: 'Respiración 4-7-8, meditación guiada o yoga suave.', en: '4-7-8 breathing, meditation, gentle yoga.' },
    },
  );
  return recs;
}
