import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/theme';

export function ProgressBar({
  pct,
  color = colors.marigold,
  height = 7,
  track = 'rgba(23,21,15,0.09)',
}: {
  pct: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={[styles.track, { height, backgroundColor: track, borderRadius: height }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, borderRadius: height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
