import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  edges?: Edge[];
  style?: ViewStyle;
}

export function Screen({ children, bg = colors.paper, edges = ['top'], style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
