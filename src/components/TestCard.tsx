import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';
import type { Test } from '../lib/types';
import { Avatar } from './Avatar';
import { Pill } from './Pill';

export function TestCard({
  test,
  purchased,
  onPress,
  onPressSeller,
}: {
  test: Test;
  purchased?: boolean;
  onPress: () => void;
  onPressSeller?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { borderColor: colors.borderStrong }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Pressable onPress={onPressSeller} hitSlop={4} style={styles.sellerRow}>
            <Avatar name={test.sellerName} size={20} />
            <Text style={styles.sellerName} numberOfLines={1}>
              {test.sellerName}
            </Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={2}>
            {test.title}
          </Text>
          <Text style={styles.meta}>
            {test.questions.length} Q · {test.duration} min
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>{test.price > 0 ? `₹${test.price}` : 'Free'}</Text>
          {test.ratingCount > 0 ? (
            <Text style={styles.rating}>
              ★ {test.rating.toFixed(1)} ({test.ratingCount})
            </Text>
          ) : (
            <Text style={styles.ratingMuted}>New</Text>
          )}
          {purchased ? <Pill label="Owned" tone="amber" style={{ marginTop: 8 }} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 14,
  },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  sellerName: { fontFamily: fonts.sansMedium, fontSize: 11.5, color: colors.inkSoft, flexShrink: 1 },
  title: { fontFamily: fonts.sansSemiBold, fontSize: 15.5, color: colors.ink, lineHeight: 20 },
  meta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft, marginTop: 7 },
  price: { fontFamily: fonts.monoMedium, fontSize: 18, color: colors.ink },
  rating: { fontFamily: fonts.sansMedium, fontSize: 11.5, color: colors.ink, marginTop: 9 },
  ratingMuted: { fontFamily: fonts.sansMedium, fontSize: 11.5, color: colors.inkFaint, marginTop: 9 },
});
