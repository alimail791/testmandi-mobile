import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';

export function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: colors.amber, marginRight: 1 }}>
          {i <= full ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}
