import React, { useState } from 'react';
import { G, Path, Line, Text as SvgText, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Svg from 'react-native-svg';
import { View, Pressable } from 'react-native';

interface Props {
  readings: { sys: number; dia: number }[];
  width?: number;
  height?: number;
  showZones?: boolean;
}

export function AreaChart({ readings, width = 340, height = 200, showZones = true }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!readings.length) return null;
  const pad = { top: 24, right: 12, bottom: 22, left: 32 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const minY = 60, maxY = 180;

  const xOf = (i: number) => pad.left + (i / Math.max(1, readings.length - 1)) * iw;
  const yOf = (v: number) => pad.top + ih - ((Math.max(minY, Math.min(maxY, v)) - minY) / (maxY - minY)) * ih;

  const sysPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(r.sys)}`).join(' ');
  const diaPath = readings.map((r, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(r.dia)}`).join(' ');

  const sysZones = [
    { from: 60, to: 119, color: '#10b981' },
    { from: 120, to: 129, color: '#84cc16' },
    { from: 130, to: 139, color: '#facc15' },
    { from: 140, to: 159, color: '#fb923c' },
    { from: 160, to: 179, color: '#ef4444' },
    { from: 180, to: 200, color: '#b91c1c' },
  ];

  const handleTouch = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const relativeX = x - pad.left;
    const index = Math.round((relativeX / iw) * (readings.length - 1));
    if (index >= 0 && index < readings.length) {
      setActiveIndex(index);
    }
  };

  const activeReading = activeIndex !== null ? readings[activeIndex] : null;

  return (
    <View>
      <Pressable onPressIn={handleTouch} onPressOut={() => setActiveIndex(null)}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="sys-grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25"/>
              <Stop offset="100%" stopColor="#00f0ff" stopOpacity="0"/>
            </LinearGradient>
          </Defs>

          {showZones && sysZones.map((z, i) => (
            <Rect key={i} x={pad.left} y={yOf(Math.min(z.to, maxY))} width={iw}
                  height={Math.max(0, yOf(Math.max(z.from, minY)) - yOf(Math.min(z.to, maxY)))}
                  fill={z.color} opacity={0.06}/>
          ))}

          {[80, 100, 120, 140, 160].map(v => (
            <React.Fragment key={v}>
              <Line x1={pad.left} x2={width - pad.right} y1={yOf(v)} y2={yOf(v)}
                    stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4"/>
              <SvgText x={pad.left - 6} y={yOf(v) + 4} textAnchor="end"
                       fontSize="10" fill="rgba(255,255,255,0.4)">{v}</SvgText>
            </React.Fragment>
          ))}

          <Path d={`${sysPath} L${xOf(readings.length-1)},${yOf(minY)} L${xOf(0)},${yOf(minY)} Z`} fill="url(#sys-grad)"/>
          <Path d={sysPath} fill="none" stroke="#00f0ff" strokeWidth={2.5}/>
          <Path d={diaPath} fill="none" stroke="#a78bfa" strokeWidth={2.5}/>

          {/* Línea de Meta (Opcional visual) */}
          <Line x1={pad.left} x2={width - pad.right} y1={yOf(130)} y2={yOf(130)}
                stroke="#facc15" strokeWidth={1} strokeDasharray="4 4" opacity={0.4}/>

          {/* Dots en cada medición si hay pocas */}
          {readings.length < 15 && readings.map((r, i) => (
            <Circle key={`d-${i}`} cx={xOf(i)} cy={yOf(r.sys)} r={3} fill="#00f0ff" opacity={0.5} />
          ))}

          {/* Indicador Activo */}
          {activeIndex !== null && activeReading && (
            <G>
              <Line x1={xOf(activeIndex)} x2={xOf(activeIndex)} y1={pad.top} y2={pad.top + ih} stroke="#ffffff" strokeWidth={1} strokeDasharray="2 2" />
              <Circle cx={xOf(activeIndex)} cy={yOf(activeReading.sys)} r={5} fill="#00f0ff" stroke="#ffffff" strokeWidth={2} />
              <Rect x={xOf(activeIndex) - 25} y={yOf(activeReading.sys) - 28} width={50} height={20} rx={4} fill="#00f0ff" />
              <SvgText x={xOf(activeIndex)} y={yOf(activeReading.sys) - 14} textAnchor="middle" fontSize="12" fontWeight="800" fill="#000000">
                {activeReading.sys}
              </SvgText>
            </G>
          )}

          {/* Último punto resaltado si no hay interacción */}
          {activeIndex === null && (
            <Circle cx={xOf(readings.length - 1)} cy={yOf(readings[readings.length - 1].sys)}
                    r={5} fill="#00f0ff" stroke="#07070a" strokeWidth={2}/>
          )}
        </Svg>
      </Pressable>
    </View>
  );
}
