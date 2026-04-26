// src/components/Logo.tsx — marca CardioLog

import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#00f0ff"/>
          <Stop offset="55%" stopColor="#6366f1"/>
          <Stop offset="100%" stopColor="#8a2be2"/>
        </LinearGradient>
        <LinearGradient id="lgl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9"/>
          <Stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9"/>
        </LinearGradient>
      </Defs>
      <Path fill="url(#lg)"
            d="M20 35.5s-12-7.5-12-18a6.8 6.8 0 0112-4.5 6.8 6.8 0 0112 4.5c0 10.5-12 18-12 18z"/>
      <Path fill="url(#lgl)" opacity="0.35"
            d="M20 31s-8.5-5.5-8.5-13a4.5 4.5 0 018.5-2.5 4.5 4.5 0 018.5 2.5c0 7.5-8.5 13-8.5 13z"/>
      <Path fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
            d="M9 19.5h3.5l2-4.2 3 8.4 2-5.2 1.8 2.8h4"/>
      <Path fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
            d="M25 17.8l2 2 4-4.2"/>
    </Svg>
  );
}
