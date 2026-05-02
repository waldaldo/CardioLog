// src/components/Logo.tsx — marca CardioLog
//
// Composición: corazón con un ECG limpio integrado.
// - Trazo grueso uniforme para legibilidad a tamaños pequeños
// - Sin doble silueta (el "ghost heart" anterior introducía ruido)
// - ECG con un único pico R prominente y pulsos secundarios proporcionales
// - viewBox 64x64 para precisión sub-pixel; el SVG escala perfecto a cualquier size

import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  /** Variante 'mark' (heart + ecg) o 'glyph' (sólo el ECG, para iconos pequeños) */
  variant?: 'mark' | 'glyph';
  /** Color de acento. Por defecto usa el gradiente cyan→violeta */
  monochrome?: string;
}

export function Logo({ size = 40, variant = 'mark', monochrome }: LogoProps) {
  const useGradient = !monochrome;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="cl-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#22d3ee"/>
          <Stop offset="50%" stopColor="#6366f1"/>
          <Stop offset="100%" stopColor="#8b5cf6"/>
        </LinearGradient>
        <LinearGradient id="cl-grad-soft" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/>
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </LinearGradient>
      </Defs>

      {variant === 'mark' && (
        <G>
          {/* Corazón: forma sólida, con curvas balanceadas. Diseñado a 64x64 */}
          <Path
            d="M32 56
               C 14 44, 6 32, 6 22
               C 6 14, 12 8, 19 8
               C 24 8, 28.5 10.5, 32 15
               C 35.5 10.5, 40 8, 45 8
               C 52 8, 58 14, 58 22
               C 58 32, 50 44, 32 56 Z"
            fill={useGradient ? 'url(#cl-grad)' : monochrome}
          />
          {/* Brillo superior sutil para dar volumen sin AI-slop */}
          <Path
            d="M32 56
               C 14 44, 6 32, 6 22
               C 6 14, 12 8, 19 8
               C 24 8, 28.5 10.5, 32 15
               C 35.5 10.5, 40 8, 45 8
               C 52 8, 58 14, 58 22
               C 58 32, 50 44, 32 56 Z"
            fill="url(#cl-grad-soft)"
          />

          {/* ECG centrado dentro del corazón.
              Línea base a y=30, pico R a y=20, valle Q/S compactos.
              Trazo blanco para máximo contraste sobre cualquier acento. */}
          <Path
            d="M12 30
               L 20 30
               L 24 26
               L 28 34
               L 32 18
               L 36 38
               L 40 26
               L 44 30
               L 52 30"
            fill="none"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Punto en el pico R — ancla visual, refuerza la marca */}
          <Circle cx={32} cy={18} r={2.2} fill="#ffffff"/>
        </G>
      )}

      {variant === 'glyph' && (
        <G>
          {/* Sólo el ECG en un cuadrado redondeado — para favicons/iconos pequeños */}
          <Path
            d="M4 12 H 60 A 8 8 0 0 1 60 52 H 4 A 8 8 0 0 1 4 12 Z
               M4 52 V 12"
            fill={useGradient ? 'url(#cl-grad)' : monochrome}
          />
          <Path
            d="M10 32 L 22 32 L 26 26 L 30 38 L 34 18 L 38 42 L 42 30 L 46 32 L 54 32"
            fill="none"
            stroke="#ffffff"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      )}
    </Svg>
  );
}
