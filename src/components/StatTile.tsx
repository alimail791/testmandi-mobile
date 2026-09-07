import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

export function StatTile({
  label,
  value,
  suffix,
  dark,
  style,
}: {
  label: string;
  value: string;
  suffix?: string;
  dark?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.wrap,
        dark ? { backgroundColor: 'rgba(246,241,231,0.08)' } : { backgroundColor: colors.paperCard, borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: dark ? colors.onInkFaint : colors.inkFaint }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text style={[styles.value, { color: dark ? colors.onInk : colors.ink }]}>{value}</Text>
        {suffix ? <Text style={[styles.suffix, { color: dark ? colors.onInkFaint : colors.inkFaint }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: radius.md, padding: 11 },
  label: { fontFamily: fonts.monoMedium, fontSize: 9.5, letterSpacing: 0.8 },
  value: { fontFamily: fonts.serif, fontSize: 20 },
  suffix: { fontFamily: fonts.sansMedium, fontSize: 12, marginLeft: 4 },
});
