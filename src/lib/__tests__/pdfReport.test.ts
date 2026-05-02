import { buildReportHtml } from '../pdfReport';
import { Profile, Reading } from '../../db/repositories';

const profile: Profile = {
  name: 'Ana García',
  age: 52,
  sex: 'F',
  weight_kg: 68,
  height_cm: 162,
  goal_sys: 120,
};

const makeReading = (overrides: Partial<Reading> = {}): Reading => ({
  id: 'r-1',
  ts: new Date().toISOString(),
  sys: 120,
  dia: 80,
  pulse: 70,
  moment: null,
  note: '',
  category_id: 'normal',
  ...overrides,
});

it('returns valid HTML with table even with zero readings', () => {
  const html = buildReportHtml([], profile, 'es', 'all');
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain('Ana García');
});

it('contains table headers when readings present', () => {
  const html = buildReportHtml([makeReading()], profile, 'es', 'all');
  expect(html).toContain('<table>');
  expect(html).toContain('Fecha');
  expect(html).toContain('Clasificación');
});

it('uses English labels when lang=en', () => {
  const html = buildReportHtml([makeReading()], profile, 'en', 'all');
  expect(html).toContain('Blood pressure report');
  expect(html).toContain('Date');
  expect(html).toContain('Classification');
});

it('filters 30d — excludes readings older than 30 days', () => {
  const old: Reading = makeReading({
    id: 'r-old',
    ts: new Date(Date.now() - 60 * 86400_000).toISOString(),
    sys: 155,
    category_id: 'hta1',
  });
  const recent: Reading = makeReading({ id: 'r-new', sys: 120 });
  const html = buildReportHtml([old, recent], profile, 'es', '30d');
  expect(html).not.toContain(old.ts.slice(0, 10));
  expect(html).toContain(recent.ts.slice(0, 10));
});
