import React, { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useData } from '../../src/lib/DataContext';
import { Avatar, colorForName } from '../../src/components/Avatar';
import { Pill } from '../../src/components/Pill';
import { ChevronLeftIcon, ShareIcon } from '../../src/components/icons';

export default function SellerScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { tests, purchasedIds } = useData();
  const sellerEmail = decodeURIComponent(email);

  const sellerTests = useMemo(
    () => tests.filter((t) => t.sellerEmail === sellerEmail).sort((a, b) => b.createdAt - a.createdAt),
    [tests, sellerEmail]
  );
  const sellerName = sellerTests[0]?.sellerName ?? sellerEmail;
  const totalRatings = sellerTests.reduce((s, t) => s + t.ratingCount, 0);
  const avgRating = totalRatings > 0 ? sellerTests.reduce((s, t) => s + t.rating * t.ratingCount, 0) / totalRatings : 0;
  const headerColor = colorForName(sellerName);

  const share = () => {
    Share.share({ message: `Check out ${sellerName} on TestMandi.` }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: headerColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeftIcon size={16} color={colors.onInk} />
        </Pressable>
        <View style={styles.headerTop}>
          <Avatar name={sellerName} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{sellerName}</Text>
            <Text style={styles.sub}>{sellerTests.length} test{sellerTests.length === 1 ? '' : 's'} live</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>TESTS</Text>
            <Text style={styles.statValue}>{sellerTests.length}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>RATINGS</Text>
            <Text style={styles.statValue}>{totalRatings}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>RATING</Text>
            <Text style={styles.statValue}>{totalRatings > 0 ? avgRating.toFixed(1) : '—'}</Text>
          </View>
        </View>

        <Pressable style={styles.shareBtn} onPress={share}>
          <ShareIcon size={14} color={colors.ink} />
          <Text style={styles.shareText}>Share this seller</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>Tests</Text>
        <View style={{ gap: 11 }}>
          {sellerTests.map((t) => (
            <Pressable key={t.id} style={styles.testRow} onPress={() => router.push(`/test/${t.id}`)}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.testTitle}>{t.title}</Text>
                <Text style={styles.testMeta}>
                  {t.questions.length} Q · {t.duration} min
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.testPrice}>{t.price > 0 ? `₹${t.price}` : 'Free'}</Text>
                {purchasedIds.has(t.id) ? <Pill label="Owned" tone="amber" style={{ marginTop: 6 }} /> : null}
              </View>
            </Pressable>
          ))}
          {sellerTests.length === 0 ? <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>No tests from this seller yet.</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, position: 'relative' },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(246,241,231,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.serif, fontSize: 24, color: colors.onInk },
  sub: { fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(246,241,231,0.7)', marginTop: 5 },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: 18 },
  statTile: { flex: 1, backgroundColor: 'rgba(246,241,231,0.1)', borderRadius: 11, padding: 10 },
  statLabel: { fontFamily: fonts.monoMedium, fontSize: 9.5, color: 'rgba(246,241,231,0.6)' },
  statValue: { fontFamily: fonts.monoMedium, fontSize: 16, color: colors.onInk, marginTop: 5 },
  shareBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 11,
    backgroundColor: colors.marigold,
  },
  shareText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.ink },
  sectionTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  testRow: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14.5, color: colors.ink, lineHeight: 19 },
  testMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.inkSoft, marginTop: 6 },
  testPrice: { fontFamily: fonts.mono, fontSize: 16, color: colors.ink },
});
