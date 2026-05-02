import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Reading, Profile } from '../db/repositories';
import { Lang, avg, daysAgo } from './i18n';
import { OMS_CATEGORIES, OMSCategoryId } from './oms';
import { buildChartSvg } from './chartSvg';

export type PdfPeriod = 'all' | '30d' | '90d';

function fmtDate(ts: string): string {
  return ts.slice(0, 10);
}

function fmtTime(ts: string): string {
  return ts.slice(11, 16);
}

function catById(id: string): (typeof OMS_CATEGORIES)[0] {
  return OMS_CATEGORIES.find(c => c.id === id) ?? OMS_CATEGORIES[0];
}

function dominantCategory(readings: Reading[]): (typeof OMS_CATEGORIES)[0] | null {
  if (!readings.length) return null;
  const freq: Record<string, number> = {};
  for (const r of readings) freq[r.category_id] = (freq[r.category_id] ?? 0) + 1;
  const topId = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as OMSCategoryId;
  return catById(topId);
}

export function buildReportHtml(
  readings: Reading[],
  profile: Profile,
  lang: Lang,
  period: PdfPeriod = 'all',
): string {
  const l = {
    es: {
      reportTitle: 'Informe de presión arterial',
      exportDate: 'Fecha de exportación',
      historyTitle: 'Historial de mediciones',
      date: 'Fecha', time: 'Hora', category: 'Clasificación',
      systolic: 'Sistólica', diastolic: 'Diastólica', pulse: 'Pulso',
      measurements: 'Mediciones', avgSys: 'Promedio SYS', avgDia: 'Promedio DIA',
      avgPulse: 'Pulso med.', years: 'años', male: 'Masculino', female: 'Femenino',
      trendZones: 'TENDENCIA · ZONAS OMS', noReadings: 'Sin mediciones en el período',
      capped: 'Mostrando las últimas 200 de',
    },
    en: {
      reportTitle: 'Blood pressure report',
      exportDate: 'Export date',
      historyTitle: 'Measurement history',
      date: 'Date', time: 'Time', category: 'Classification',
      systolic: 'Systolic', diastolic: 'Diastolic', pulse: 'Pulse',
      measurements: 'Readings', avgSys: 'Avg SYS', avgDia: 'Avg DIA',
      avgPulse: 'Avg pulse', years: 'years', male: 'Male', female: 'Female',
      trendZones: 'TREND · WHO ZONES', noReadings: 'No readings in period',
      capped: 'Showing last 200 of',
    },
  }[lang];

  const filtered = period === '30d'
    ? daysAgo(readings, 30)
    : period === '90d'
    ? daysAgo(readings, 90)
    : [...readings];

  const avgSys   = avg(filtered, 'sys');
  const avgDia   = avg(filtered, 'dia');
  const avgPulse = avg(filtered, 'pulse');
  const count    = filtered.length;
  const dominant = dominantCategory(filtered);

  const chartSvg = buildChartSvg(filtered, 560, 220);
  const chartImg = chartSvg
    ? `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(chartSvg)}" width="560" height="220" style="display:block"/>`
    : '';

  const desc = filtered.slice().sort((a, b) => b.ts.localeCompare(a.ts));
  const capped = desc.length > 200;
  const rows = desc.slice(0, 200).map(r => {
    const cat = catById(r.category_id);
    return `<tr>
      <td>${fmtDate(r.ts)}</td>
      <td>${fmtTime(r.ts)}</td>
      <td style="color:${cat.color};font-weight:700">${r.sys}</td>
      <td>${r.dia}</td>
      <td style="color:#a78bfa">${r.pulse}</td>
      <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};margin-right:6px;vertical-align:middle"></span>${cat.label[lang]}</td>
    </tr>`;
  }).join('\n');

  const exportDateStr = new Date().toISOString().slice(0, 10);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{font-family:-apple-system,Helvetica,Arial,sans-serif;margin:0;padding:32px;background:#fff;color:#0f172a}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #00c8d8;padding-bottom:16px;margin-bottom:24px}
  .logo{font-size:28px;font-weight:900;letter-spacing:-0.5px}
  .logo span{color:#00b8c8}
  .sub{font-size:13px;color:#64748b;margin-top:4px}
  .patient{text-align:right;font-size:12px;color:#64748b;line-height:1.7}
  .stats{display:flex;gap:12px;margin-bottom:20px}
  .card{flex:1;border-radius:10px;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;text-align:center}
  .val{font-size:26px;font-weight:800}
  .lbl{font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;margin-top:3px}
  .dom{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;margin-bottom:20px}
  .section{font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
  .chart{margin-bottom:20px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
  td{padding:7px 10px;border-bottom:1px solid #f1f5f9}
  .cap{font-size:11px;color:#94a3b8;margin-bottom:8px}
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">Cardio<span>Log</span></div>
    <div class="sub">${l.reportTitle}</div>
  </div>
  <div class="patient">
    <strong>${profile.name}</strong><br>
    ${profile.age} ${l.years} · ${profile.sex === 'M' ? l.male : l.female}<br>
    ${l.exportDate}: ${exportDateStr}
  </div>
</div>

${count === 0 ? `<p style="color:#64748b;text-align:center;padding:32px 0">${l.noReadings}</p>` : `
<div class="stats">
  <div class="card"><div class="val" style="color:#00b8c8">${avgSys}</div><div class="lbl">${l.avgSys}</div></div>
  <div class="card"><div class="val">${avgDia}</div><div class="lbl">${l.avgDia}</div></div>
  <div class="card"><div class="val" style="color:#a78bfa">${avgPulse}</div><div class="lbl">${l.avgPulse}</div></div>
  <div class="card"><div class="val" style="color:#10b981">${count}</div><div class="lbl">${l.measurements}</div></div>
</div>

${dominant ? `<div class="dom" style="background:${dominant.color}18;border:1px solid ${dominant.color}44">
  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dominant.color}"></span>
  <span style="font-weight:700;color:${dominant.color}">${dominant.label[lang]}</span>
  <span style="color:#64748b;font-size:12px;margin-left:4px">${dominant.rangeText}</span>
</div>` : ''}

${chartImg ? `<div class="chart">
  <div class="section">${l.trendZones}</div>
  ${chartImg}
</div>` : ''}

<div class="section">${l.historyTitle}</div>
${capped ? `<div class="cap">${l.capped} ${count}</div>` : ''}
<table>
  <thead>
    <tr>
      <th>${l.date}</th>
      <th>${l.time}</th>
      <th>${l.systolic}</th>
      <th>${l.diastolic}</th>
      <th>${l.pulse}</th>
      <th>${l.category}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
`}

</body>
</html>`;
}

export async function exportPdfReport(
  readings: Reading[],
  profile: Profile,
  lang: Lang,
  period: PdfPeriod = 'all',
): Promise<{ count: number }> {
  if (Platform.OS === 'web') {
    throw new Error('PDF export is not available on web');
  }

  const filtered = period === '30d'
    ? daysAgo(readings, 30)
    : period === '90d'
    ? daysAgo(readings, 90)
    : [...readings];

  const html = buildReportHtml(readings, profile, lang, period);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const sharingTitle = lang === 'es' ? 'Informe CardioLog' : 'CardioLog Report';
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: sharingTitle,
    UTI: 'com.adobe.pdf',
  });

  return { count: filtered.length };
}
