import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function SearchIcon({ size = 15, color = '#17150F', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="21" y1="21" x2="16.2" y2="16.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 16, color = '#17150F', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = '#17150F', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function StoreTabIcon({ size = 20, color = '#17150F', active }: IconProps & { active?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9.5L5.4 4h13.2L20 9.5M4 9.5v9.5a1 1 0 001 1h14a1 1 0 001-1V9.5M4 9.5h16"
        stroke={color}
        strokeWidth={active ? 2 : 1.8}
        strokeLinejoin="round"
      />
      <Path d="M9.5 20V14.5h5V20" stroke={color} strokeWidth={active ? 2 : 1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchTabIcon({ size = 20, color = '#17150F', active }: IconProps & { active?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={active ? 2 : 1.8} />
      <Line x1="19.5" y1="19.5" x2="15.2" y2="15.2" stroke={color} strokeWidth={active ? 2 : 1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ClipboardTabIcon({ size = 20, color = '#17150F', active }: IconProps & { active?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="4.5" width="14" height="17" rx="2" stroke={color} strokeWidth={active ? 2 : 1.8} />
      <Path d="M9 4.5V3.5a1 1 0 011-1h4a1 1 0 011 1v1" stroke={color} strokeWidth={active ? 2 : 1.8} strokeLinejoin="round" />
      <Line x1="8.5" y1="10.5" x2="15.5" y2="10.5" stroke={color} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
      <Line x1="8.5" y1="14" x2="15.5" y2="14" stroke={color} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
      <Line x1="8.5" y1="17.5" x2="12.5" y2="17.5" stroke={color} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileTabIcon({ size = 20, color = '#17150F', active }: IconProps & { active?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.2" r="3.7" stroke={color} strokeWidth={active ? 2 : 1.8} />
      <Path d="M4.8 20c1.2-3.8 4.3-5.8 7.2-5.8s6 2 7.2 5.8" stroke={color} strokeWidth={active ? 2 : 1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ShareIcon({ size = 15, color = '#17150F', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="2.6" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="12" r="2.6" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="19" r="2.6" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="8.3" y1="10.7" x2="15.7" y2="6.3" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="8.3" y1="13.3" x2="15.7" y2="17.7" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = '#17150F', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12.5l5 5L20 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CrossIcon({ size = 14, color = '#17150F', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
