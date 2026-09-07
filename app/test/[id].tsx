import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useData } from '../../src/lib/DataContext';
import { useAuth } from '../../src/lib/AuthContext';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { StarRating } from '../../src/components/StarRating';
import { StatTile } from '../../src/components/StatTile';
import { ChevronLeftIcon } from '../../src/components/icons';
import { topicBreakdown } from '../../src/lib/utils';
import { useSavedTests } from '../../src/lib/useSavedTests';

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { testsById, purchasedIds, attempts } = useData();
  const { session } = useAuth();
  const { savedIds, toggle: toggleSaved } = useSavedTests();
  const test = testsById[id];

  const topics = useMemo(() => (test ? topicBreakdown(test) : []), [test]);
  const owned = test ? purchasedIds.has(test.id) : false;
  const myAttempt = useMemo(
    () => (test ? [...attempts].filter((a) => a.testId === test.id).sort((a, b) => b.ts - a.ts)[0] : undefined),
    [attempts, test]
  );

  if (!test) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, padding: 20 }}>
        <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>Test not found.</Text>
      </SafeAreaView>
    );
  }

  const buy = () => {
    if (!session) return router.push('/auth/login');
    router.push(`/test/${test.id}/pay`);
  };

  const primaryAction = () => {
    if (!owned) return buy();
    if (myAttempt) return router.push(`/report/${myAttempt.id}`);
    return router.push(`/attempt/${test.id}`);
  };

  const primaryLabel = !owned ? 'Buy this test' : myAttempt ? 'View report' : 'Start attempt';

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaView edges={['top']} style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeftIcon size={16} />
        </Pressable>
        <Text style={[styles.headerLabel, { flex: 1 }]}>Test stall</Text>
        <Pressable onPress={() => toggleSaved(test.id)} hitSlop={8}>
          <Text style={styles.saveText}>{savedIds.has(test.id) ? '★ Saved' : '☆ Save'}</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
        <Pressable
          style={styles.sellerRow}
          onPress={() => router.push(`/seller/${encodeURIComponent(test.sellerEmail)}`)}
        >
          <Avatar name={test.sellerName} size={26} />
          <Text style={styles.sellerName}>{test.sellerName}</Text>
        </Pressable>

        <Text style={styles.title}>{test.title}</Text>
        <Text style={styles.description}>{test.description}</Text>

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
          <StatTile label="QUESTIONS" value={String(test.questions.length)} />
          <StatTile label="MINUTES" value={String(test.duration)} />
          <StatTile label="RATING" value={test.ratingCount > 0 ? test.rating.toFixed(1) : '—'} />
        </View>

        <Text style={styles.sectionLabel}>What's inside</Text>
        <View style={styles.card}>
          {topics.map((t, i) => (
            <View key={t.topic} style={[styles.topicRow, i === topics.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.topicName}>{t.topic}</Text>
              <Text style={styles.topicCount}>{t.count} Q</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Ratings</Text>
        <View style={styles.card}>
          {test.ratingCount > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={styles.ratingBig}>{test.rating.toFixed(1)}</Text>
                <StarRating value={test.rating} size={14} />
              </View>
              <Text style={styles.ratingCount}>{test.ratingCount} ratings</Text>
            </View>
          ) : (
            <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft, padding: 14 }}>No ratings yet — be the first to attempt this test.</Text>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.buyBar}>
        <View>
          <Text style={styles.buyPrice}>{test.price > 0 ? `₹${test.price}` : 'Free'}</Text>
          <Text style={styles.buyNote}>{owned ? 'you own this test' : 'one attempt · report free'}</Text>
        </View>
        <Button label={primaryLabel} onPress={primaryAction} style={{ flex: 1 }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.inkSoft },
  saveText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.amber },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sellerName: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: 'rgba(23,21,15,0.65)' },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 35, color: colors.ink },
  description: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: 'rgba(23,21,15,0.62)', marginTop: 9 },
  sectionLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.ink, marginTop: 22, marginBottom: 10 },
  card: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  topicName: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  topicCount: { fontFamily: fonts.mono, fontSize: 13, color: 'rgba(23,21,15,0.55)' },
  ratingBig: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  ratingCount: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft },
  buyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingTop: 14,
    backgroundColor: 'rgba(246,241,231,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buyPrice: { fontFamily: fonts.mono, fontSize: 20, color: colors.ink },
  buyNote: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint, marginTop: 3 },
});
