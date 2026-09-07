import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';

export function SectionHeading({
  title,
  action,
  onPressAction,
}: {
  title: string;
  action?: string;
  onPressAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onPressAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  title: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  action: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.amber },
});
