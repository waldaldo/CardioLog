import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Path, Line, Text as SvgText, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

interface Reading {
  sys: number;
  dia: number;
  ts: string;
  moment: 'morning' | 'afternoon' | 'evening' | null;
}

interface Props {
  readings: Reading[];
  width?: number;
  height?: number;
}

export function SummaryChart({ readings, width = 340, height = 220 }: Props) {
  const { colors, isDark } = useTheme();
  const { lang, t, locale } = useLang();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!readings.length) return null;

  const pad = { top: 30, right: 15, bottom: 40, left: 35 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const minY = 50, maxY = 190;

  const xOf = (i: number) => pad.left + (i / Math.max(1, readings.length - 1)) * iw;
  const yOf = (v: number) => pad.top + ih - ((Math.max(minY, Math.min(maxY, v)) - minY) / (maxY - minY)) * ih;

  const sysPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(r.sys)}`).join(' ');
  const diaPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(r.dia)}`).join(' ');

  const getMomentColor = (m: string | null) => {
    if (m === 'morning') return colors.primary;
    if (m === 'afternoon') return '#facc15'; // Yellow
    if (m === 'evening') return colors.secondary;
    return colors.textMuted;
  };

  const handleTouch = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const relativeX = x - pad.left;
    const index = Math.round((relativeX / iw) * (readings.length - 1));
    if (index >= 0 && index < readings.length) {
      setActiveIndex(index);
    }
  };

  const active = activeIndex !== null ? readings[activeIndex] : null;

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        onStartShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderRelease={() => setActiveIndex(null)}
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad-sys" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.2"/>
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0"/>
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[80, 120, 140, 160].map(v => (
            <React.Fragment key={v}>
              <Line x1={pad.left} x2={width - pad.right} y1={yOf(v)} y2={yOf(v)}
                    stroke={colors.border} strokeWidth={1} strokeDasharray="4 4" />
              <SvgText x={pad.left - 8} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill={colors.textMuted}>{v}</SvgText>
            </React.Fragment>
          ))}

          {/* Area and lines */}
          <Path d={`${sysPath} L${xOf(readings.length - 1)},${yOf(minY)} L${xOf(0)},${yOf(minY)} Z`} fill="url(#grad-sys)" />
          <Path d={sysPath} fill="none" stroke={colors.primary} strokeWidth={2.5} />
          <Path d={diaPath} fill="none" stroke={colors.secondary} strokeWidth={2} />

          {/* Points color-coded by moment */}
          {readings.map((r, i) => (
            <Circle
              key={i}
              cx={xOf(i)}
              cy={yOf(r.sys)}
              r={activeIndex === i ? 6 : 4}
              fill={getMomentColor(r.moment)}
              stroke={colors.bgCard}
              strokeWidth={1.5}
            />
          ))}

          {/* Active indicator */}
          {activeIndex !== null && active && (
            <G>
              <Line x1={xOf(activeIndex)} x2={xOf(activeIndex)} y1={pad.top} y2={pad.top + ih} stroke={colors.text} strokeWidth={1} />
            </G>
          )}
        </Svg>
      </View>

      {/* Legend / Tooltip info */}
      <View style={{
        marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle,
        width: width - 20, minHeight: 60, justifyContent: 'center'
      }}>
        {active ? (
          <View>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
              {new Date(active.ts).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(active.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>SYS: {active.sys}</Text>
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>DIA: {active.dia}</Text>
              <Text style={{ color: getMomentColor(active.moment), fontSize: 12, fontWeight: '600' }}>
                {active.moment ? t(active.moment).toUpperCase() : ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            {t('swipeToViewDetail') || 'Desliza para ver detalles'}
          </Text>
        )}
      </View>

      {/* Legend for moments */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 8 }}>
        <LegendItem color={colors.primary} label={t('morning')} />
        <LegendItem color="#facc15" label={t('afternoon')} />
        <LegendItem color={colors.secondary} label={t('evening')} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
