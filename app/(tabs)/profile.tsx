import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useAuth } from '../../src/lib/AuthContext';
import { Avatar, initialsFor } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { Pill } from '../../src/components/Pill';

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>Profile</Text>
          <EmptyState
            title="Log in to see your profile"
            body="Log in or create an account to manage your details and purchases."
            actionLabel="Log in / Register"
            onAction={() => router.push('/auth/login')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const doLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={session.name} size={48} square={false} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{session.name}</Text>
              <Text style={styles.email}>{session.email}</Text>
            </View>
            <Pill label={session.role} tone="marigold" />
          </View>
        </View>

        {session.role !== 'buyer' ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Full {session.role} tools — publishing tests, managing payouts, running ads — live on the TestMandi web app for now. This mobile
              app covers browsing and account access.
            </Text>
          </View>
        ) : null}

        {session.businessName ? (
          <Row label="Business name" value={session.businessName} />
        ) : null}
        {session.phone ? <Row label="Phone" value={session.phone} /> : null}
        {session.referralCode ? <Row label="Referral code" value={session.referralCode} /> : null}

        <Button label={loggingOut ? 'Logging out…' : 'Log out'} variant="outline" onPress={doLogout} loading={loggingOut} style={{ marginTop: 24 }} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, marginBottom: 16 },
  card: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 14,
  },
  name: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink },
  email: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft, marginTop: 3 },
  noteCard: { backgroundColor: 'rgba(227,168,87,0.14)', borderRadius: radius.lg, padding: 13, marginBottom: 14 },
  noteText: { fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(23,21,15,0.75)', lineHeight: 18 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft },
  rowValue: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
});
