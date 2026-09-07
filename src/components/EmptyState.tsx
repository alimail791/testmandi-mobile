import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';
import { Button } from './Button';

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel ? <Button label={actionLabel} onPress={onAction} style={{ marginTop: 14 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
  },
  title: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, textAlign: 'center' },
  body: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
