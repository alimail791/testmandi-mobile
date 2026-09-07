import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

interface PillProps {
  label: string;
  tone?: 'marigold' | 'inkGhost' | 'teal' | 'amber' | 'ink';
  mono?: boolean;
  style?: ViewStyle;
}

export function Pill({ label, tone = 'inkGhost', mono, style }: PillProps) {
  const toneStyle = TONES[tone];
  return (
    <View style={[styles.base, toneStyle.container, style]}>
      <Text style={[mono ? styles.monoLabel : styles.label, toneStyle.text]}>{label}</Text>
    </View>
  );
}

const TONES: Record<string, { container: ViewStyle; text: { color: string } }> = {
  marigold: { container: { backgroundColor: colors.marigold }, text: { color: colors.ink } },
  ink: { container: { backgroundColor: colors.ink }, text: { color: colors.onInk } },
  inkGhost: { container: { backgroundColor: 'rgba(23,21,15,0.08)' }, text: { color: colors.ink } },
  teal: { container: { backgroundColor: 'rgba(43,85,96,0.1)' }, text: { color: colors.teal } },
  amber: { container: { backgroundColor: 'rgba(227,168,87,0.18)' }, text: { color: colors.amber } },
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 12.5 },
  monoLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.3 },
});
