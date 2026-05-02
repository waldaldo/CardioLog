import { buildChartSvg } from '../chartSvg';

it('returns empty string for no readings', () => {
  expect(buildChartSvg([])).toBe('');
});

it('returns valid svg with path for single reading', () => {
  const s = buildChartSvg([{ sys: 120, dia: 80 }]);
  expect(s).toContain('<svg');
  expect(s).toContain('<path');
  expect(s).toContain('xmlns');
});

it('includes all six zone bands', () => {
  const s = buildChartSvg([{ sys: 120, dia: 80 }, { sys: 150, dia: 90 }]);
  const rectCount = (s.match(/<rect/g) ?? []).length;
  expect(rectCount).toBe(6);
});

it('respects custom dimensions', () => {
  const s = buildChartSvg([{ sys: 130, dia: 85 }], 400, 180);
  expect(s).toContain('width="400"');
  expect(s).toContain('height="180"');
});
