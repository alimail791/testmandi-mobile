import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useAuth } from '../../src/lib/AuthContext';
import { useData } from '../../src/lib/DataContext';
import { useSavedTests } from '../../src/lib/useSavedTests';
import { api } from '../../src/lib/api';
import type { ReferralData } from '../../src/lib/types';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { timeAgo } from '../../src/lib/utils';

type Segment = 'attempt' | 'reports' | 'saved';

export default function MyTestsScreen() {
  const { session } = useAuth();
  const { tests, testsById, purchasedIds, purchases, attempts } = useData();
  const { savedIds } = useSavedTests();
  const [segment, setSegment] = useState<Segment>('attempt');
  const [referral, setReferral] = useState<ReferralData | null>(null);

  useEffect(() => {
    if (session?.role === 'buyer') {
      api.getMyReferrals().then(setReferral).catch(() => {});
    }
  }, [session?.email]);

  const attemptedTestIds = useMemo(() => new Set(attempts.map((a) => a.testId)), [attempts]);
  const toAttempt = useMemo(
    () => purchases.filter((p) => !attemptedTestIds.has(p.testId) && testsById[p.testId]).map((p) => testsById[p.testId]),
    [purchases, attemptedTestIds, testsById]
  );
  const reports = useMemo(() => [...attempts].sort((a, b) => b.ts - a.ts), [attempts]);
  const savedTests = useMemo(() => tests.filter((t) => savedIds.has(t.id)), [tests, savedIds]);

  const trend = reports
    .slice()
    .sort((a, b) => a.ts - b.ts)
    .slice(-6)
    .map((a) => Math.round((a.score / a.total) * 100));
  const trendDelta = trend.length > 1 ? trend[trend.length - 1] - trend[0] : null;

  if (!session || session.role !== 'buyer') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>My tests</Text>
          <EmptyState
            title="Log in to see your tests"
            body="Log in or register as a candidate to view purchases, attempt tests, and see score reports."
            actionLabel="Log in / Register"
            onAction={() => router.push('/auth/login')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const shareReferral = () => {
    if (!referral) return;
    Share.share({
      message: `Join me on TestMandi and try MCQ tests for competitive exams! Use my code ${referral.referralCode} when you sign up.`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>My tests</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 14 }}>
          {(['attempt', 'reports', 'saved'] as Segment[]).map((s) => {
            const active = segment === s;
            const label = s === 'attempt' ? 'To attempt' : s === 'reports' ? 'Reports' : 'Saved';
            return (
              <Pressable key={s} onPress={() => setSegment(s)} style={[styles.segChip, active && styles.segChipActive]}>
                <Text style={[styles.segChipText, active && styles.segChipTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40 }}>
        {segment === 'attempt' ? (
          <View style={{ gap: 11 }}>
            {toAttempt.map((t) => (
              <Pressable key={t.id} style={styles.card} onPress={() => router.push(`/attempt/${t.id}`)}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.cardEyebrow}>PURCHASED</Text>
                  <Text style={styles.cardTitle}>{t.title}</Text>
                  <Text style={styles.cardMeta}>
                    {t.sellerName} · {t.questions.length} Q
                  </Text>
                </View>
                <View style={styles.startBtn}>
                  <Text style={styles.startBtnText}>Start</Text>
                </View>
              </Pressable>
            ))}
            {toAttempt.length === 0 ? <EmptyState title="Nothing pending" body="Tests you buy will show up here until you attempt them." /> : null}
          </View>
        ) : null}

        {segment === 'reports' ? (
          <View style={{ gap: 11 }}>
            {reports.map((a) => {
              const t = testsById[a.testId];
              const pct = Math.round((a.score / a.total) * 100);
              return (
                <Pressable key={a.id} style={styles.card} onPress={() => router.push(`/report/${a.id}`)}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.cardEyebrow}>{timeAgo(a.ts).toUpperCase()}</Text>
                    <Text style={styles.cardTitle}>{t?.title ?? 'Test'}</Text>
                    <Text style={styles.cardMeta}>
                      {a.score}/{a.total} correct
                    </Text>
                  </View>
                  <Text style={[styles.pctBadge, { color: pct >= 50 ? colors.teal : colors.red }]}>{pct}%</Text>
                </Pressable>
              );
            })}
            {reports.length === 0 ? <EmptyState title="No reports yet" body="Attempt a purchased test to see your first score report here." /> : null}
          </View>
        ) : null}

        {segment === 'saved' ? (
          <View style={{ gap: 11 }}>
            {savedTests.map((t) => (
              <Pressable key={t.id} style={styles.card} onPress={() => router.push(`/test/${t.id}`)}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.cardTitle}>{t.title}</Text>
                  <Text style={styles.cardMeta}>
                    {t.sellerName} · {t.questions.length} Q
                  </Text>
                </View>
                <Text style={styles.cardPrice}>{t.price > 0 ? `₹${t.price}` : 'Free'}</Text>
              </Pressable>
            ))}
            {savedTests.length === 0 ? <EmptyState title="Nothing saved" body="Tap ☆ Save on a test's page to keep it here for later." /> : null}
          </View>
        ) : null}

        {segment === 'reports' && trend.length > 1 ? (
          <>
            <Text style={styles.sectionTitle}>Score trend</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendBars}>
                {trend.map((pct, i) => (
                  <View key={i} style={[styles.trendBar, { height: `${Math.max(6, pct)}%`, backgroundColor: i === trend.length - 1 ? colors.teal : 'rgba(43,85,96,0.3)' }]} />
                ))}
              </View>
              {trendDelta !== null ? (
                <Text style={styles.trendNote}>
                  {trendDelta >= 0 ? '+' : ''}
                  {trendDelta}% accuracy across {trend.length} recent attempts.
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {referral ? (
          <View style={styles.walletCard}>
            <View>
              <Text style={styles.walletLabel}>REFER & EARN</Text>
              <Text style={styles.walletCode}>{referral.referralCode}</Text>
              <Text style={styles.walletNote}>
                {referral.referredCount} referred · {referral.rewards.filter((r) => !r.used).length} reward(s) available
              </Text>
            </View>
            <Pressable style={styles.walletBtn} onPress={shareReferral}>
              <Text style={styles.walletBtnText}>Share</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink },
  segChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong },
  segChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  segChipText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ink },
  segChipTextActive: { color: colors.onInk, fontFamily: fonts.sansSemiBold },
  card: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEyebrow: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.8, color: colors.amber },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, marginTop: 7, lineHeight: 20 },
  cardMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkSoft, marginTop: 6 },
  cardPrice: { fontFamily: fonts.mono, fontSize: 16, color: colors.ink },
  startBtn: { paddingVertical: 11, paddingHorizontal: 15, borderRadius: 11, backgroundColor: colors.ink },
  startBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.onInk },
  pctBadge: { fontFamily: fonts.mono, fontSize: 18 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, marginTop: 24, marginBottom: 12 },
  trendCard: { backgroundColor: colors.paperCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16 },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, height: 96 },
  trendBar: { flex: 1, borderRadius: 5 },
  trendNote: { fontFamily: fonts.sans, fontSize: 13, color: 'rgba(23,21,15,0.65)', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  walletCard: {
    marginTop: 24,
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.8, color: 'rgba(246,241,231,0.55)' },
  walletCode: { fontFamily: fonts.serif, fontSize: 26, color: colors.onInk, marginTop: 7 },
  walletNote: { fontFamily: fonts.sans, fontSize: 11.5, color: 'rgba(246,241,231,0.55)', marginTop: 6 },
  walletBtn: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 11, backgroundColor: colors.marigold },
  walletBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.ink },
});
