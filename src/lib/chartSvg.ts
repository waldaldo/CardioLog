// Pure SVG string generator — same math as AreaChart.tsx but for PDF (white background).
export function buildChartSvg(
  readings: { sys: number; dia: number }[],
  width = 560,
  height = 220,
): string {
  if (!readings.length) return '';

  const pad = { top: 18, right: 12, bottom: 22, left: 32 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const minY = 60, maxY = 180;
  const xOf = (i: number) => pad.left + (i / Math.max(1, readings.length - 1)) * iw;
  const yOf = (v: number) => pad.top + ih - ((v - minY) / (maxY - minY)) * ih;

  const sysPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i).toFixed(1)},${yOf(r.sys).toFixed(1)}`).join(' ');
  const diaPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i).toFixed(1)},${yOf(r.dia).toFixed(1)}`).join(' ');

  const sysZones = [
    { from: 60,  to: 119, color: '#10b981' },
    { from: 120, to: 129, color: '#84cc16' },
    { from: 130, to: 139, color: '#facc15' },
    { from: 140, to: 159, color: '#fb923c' },
    { from: 160, to: 179, color: '#ef4444' },
    { from: 180, to: 200, color: '#b91c1c' },
  ];

  const zoneBands = sysZones.map(z => {
    const y = yOf(Math.min(z.to, maxY));
    const h = Math.max(0, yOf(Math.max(z.from, minY)) - y);
    return `<rect x="${pad.left}" y="${y.toFixed(1)}" width="${iw}" height="${h.toFixed(1)}" fill="${z.color}" opacity="0.12"/>`;
  }).join('\n      ');

  const gridLines = [80, 100, 120, 140, 160].map(v => `
      <line x1="${pad.left}" x2="${width - pad.right}" y1="${yOf(v).toFixed(1)}" y2="${yOf(v).toFixed(1)}"
            stroke="rgba(0,0,0,0.08)" stroke-dasharray="2 4"/>
      <text x="${pad.left - 6}" y="${(yOf(v) + 4).toFixed(1)}" text-anchor="end"
            font-size="10" fill="rgba(80,80,80,0.7)">${v}</text>`).join('');

  const last = readings.length - 1;
  const sysAreaPath = `${sysPath} L${xOf(last).toFixed(1)},${yOf(minY).toFixed(1)} L${xOf(0).toFixed(1)},${yOf(minY).toFixed(1)} Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00c8d8" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#00c8d8" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${zoneBands}
  ${gridLines}
  <path d="${sysAreaPath}" fill="url(#sg)"/>
  <path d="${sysPath}" fill="none" stroke="#00b8c8" stroke-width="2"/>
  <path d="${diaPath}" fill="none" stroke="#a78bfa" stroke-width="2"/>
  <line x1="${pad.left}" x2="${width - pad.right}" y1="${yOf(130).toFixed(1)}" y2="${yOf(130).toFixed(1)}"
        stroke="#facc15" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
  <circle cx="${xOf(last).toFixed(1)}" cy="${yOf(readings[last].sys).toFixed(1)}"
          r="4" fill="#00b8c8" stroke="#ffffff" stroke-width="2"/>
</svg>`;
}
