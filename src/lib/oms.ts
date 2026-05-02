// Clasificación de presión arterial según rangos de la OMS

import { omsColors } from '@/theme/tokens';

export type OMSCategoryId =
  | 'optima' | 'normal' | 'normalAlta' | 'hta1' | 'hta2' | 'hta3';

export interface OMSCategory {
  id: OMSCategoryId;
  label: { es: string; en: string };
  sys: [number, number];
  dia: [number, number];
  /** Color del tema OSCURO (legacy — la clasificación usa este por compat) */
  color: string;
  rangeText: string;
}

export const OMS_CATEGORIES: OMSCategory[] = [
  { id: 'optima',     label: { es: 'Óptima',      en: 'Optimal' },     sys: [0, 119],   dia: [0, 79],    color: omsColors.dark.optima,     rangeText: '<120 / <80' },
  { id: 'normal',     label: { es: 'Normal',      en: 'Normal' },      sys: [120, 129], dia: [80, 84],   color: omsColors.dark.normal,     rangeText: '120-129 / 80-84' },
  { id: 'normalAlta', label: { es: 'Normal alta', en: 'High normal' }, sys: [130, 139], dia: [85, 89],   color: omsColors.dark.normalAlta, rangeText: '130-139 / 85-89' },
  { id: 'hta1',       label: { es: 'HTA Grado 1', en: 'Stage 1' },     sys: [140, 159], dia: [90, 99],   color: omsColors.dark.hta1,       rangeText: '140-159 / 90-99' },
  { id: 'hta2',       label: { es: 'HTA Grado 2', en: 'Stage 2' },     sys: [160, 179], dia: [100, 109], color: omsColors.dark.hta2,       rangeText: '160-179 / 100-109' },
  { id: 'hta3',       label: { es: 'HTA Grado 3', en: 'Stage 3' },     sys: [180, 300], dia: [110, 300], color: omsColors.dark.hta3,       rangeText: '≥180 / ≥110' },
];

// La clasificación final es la más severa entre sistólica y diastólica (criterio OMS).
export function classifyBP(sys: number, dia: number): OMSCategory {
  const last = OMS_CATEGORIES.length - 1;
  let idxS = OMS_CATEGORIES.findIndex(c => sys >= c.sys[0] && sys <= c.sys[1]);
  let idxD = OMS_CATEGORIES.findIndex(c => dia >= c.dia[0] && dia <= c.dia[1]);
  if (idxS < 0) idxS = sys < OMS_CATEGORIES[0].sys[0] ? 0 : last;
  if (idxD < 0) idxD = dia < OMS_CATEGORIES[0].dia[0] ? 0 : last;
  return OMS_CATEGORIES[Math.max(idxS, idxD)];
}

/** Devuelve el color OMS apropiado para el tema actual (accesible en ambos). */
export function omsColorFor(id: OMSCategoryId, isDark: boolean): string {
  return isDark ? omsColors.dark[id] : omsColors.light[id];
}

export function bmiOf(weightKg: number, heightCm: number): number {
  if (!heightCm || !weightKg) return 0;
  return weightKg / ((heightCm / 100) ** 2);
}

export function bmiCategory(bmi: number, lang: 'es' | 'en' = 'es'): string {
  const t = lang === 'es'
    ? ['Bajo peso', 'Normal', 'Sobrepeso', 'Obesidad']
    : ['Underweight', 'Normal', 'Overweight', 'Obese'];
  if (bmi < 18.5) return t[0];
  if (bmi < 25)   return t[1];
  if (bmi < 30)   return t[2];
  return t[3];
}
