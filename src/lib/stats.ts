export function stdDev(arr: any[], key: string): number {
  if (arr.length < 2) return 0;
  const valid = arr.filter(r => typeof r[key] === 'number' && !isNaN(r[key]));
  if (valid.length < 2) return 0;
  const m = valid.reduce((s, r) => s + r[key], 0) / valid.length;
  const sumSq = valid.reduce((s, r) => s + (r[key] - m) ** 2, 0);
  return Math.sqrt(sumSq / (valid.length - 1));
}

export function cv(arr: any[], key: string): number {
  const valid = arr.filter(r => typeof r[key] === 'number' && !isNaN(r[key]));
  if (valid.length < 2) return 0;
  const m = valid.reduce((s, r) => s + r[key], 0) / valid.length;
  if (m === 0) return 0;
  return (stdDev(valid, key) / m) * 100;
}
