import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'marigold' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth,
  size = 'md',
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isMarigold = variant === 'marigold';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isMarigold && styles.marigold,
        isGhost && styles.ghost,
        fullWidth && { alignSelf: 'stretch' },
        (disabled || loading) && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onInk : colors.ink} />
      ) : (
        <Text
          style={[
            styles.label,
            size === 'lg' && styles.labelLg,
            isPrimary && { color: colors.onInk },
            isOutline && { color: colors.ink },
            isMarigold && { color: colors.ink },
            isGhost && { color: colors.inkSoft },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  lg: {
    paddingVertical: 16,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  marigold: {
    backgroundColor: colors.marigold,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14.5,
  },
  labelLg: {
    fontSize: 15,
  },
});
