import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

const PALETTE = [colors.teal, colors.brown, colors.amber, '#4B3B6B', '#3D5A3D'];

export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return PALETTE[hash % PALETTE.length];
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
  square?: boolean;
}

export function Avatar({ name, size = 26, square = true }: AvatarProps) {
  const bg = colorForName(name);
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: square ? Math.round(size * 0.27) : size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.label, { fontSize: Math.max(9.5, size * 0.42) }]}>{initialsFor(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.sansSemiBold, color: colors.onInk },
});
