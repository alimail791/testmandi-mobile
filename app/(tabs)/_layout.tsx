import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, fonts } from '../../src/theme/theme';
import { StoreTabIcon, SearchTabIcon, ClipboardTabIcon, ProfileTabIcon } from '../../src/components/icons';

function TabIcon({ focused, kind }: { focused: boolean; kind: 'bazaar' | 'search' | 'my-tests' | 'profile' }) {
  const color = focused ? colors.ink : 'rgba(23,21,15,0.45)';
  const Icon =
    kind === 'bazaar' ? StoreTabIcon : kind === 'search' ? SearchTabIcon : kind === 'my-tests' ? ClipboardTabIcon : ProfileTabIcon;
  return <Icon size={21} color={color} active={focused} />;
}

function tabLabel(label: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={[styles.label, { color: focused ? colors.ink : 'rgba(23,21,15,0.45)', fontFamily: focused ? fonts.sansSemiBold : fonts.sansMedium }]}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: 'rgba(23,21,15,0.45)',
        tabBarStyle: styles.bar,
        tabBarItemStyle: { paddingTop: 6 },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bazaar',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="bazaar" />,
          tabBarLabel: tabLabel('Bazaar'),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="search" />,
          tabBarLabel: tabLabel('Search'),
        }}
      />
      <Tabs.Screen
        name="my-tests"
        options={{
          title: 'My tests',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="my-tests" />,
          tabBarLabel: tabLabel('My tests'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="profile" />,
          tabBarLabel: tabLabel('Profile'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(246,241,231,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    height: Platform.select({ ios: 88, default: 66 }),
    paddingTop: 8,
  },
  label: { fontSize: 10.5, marginTop: 2 },
});
