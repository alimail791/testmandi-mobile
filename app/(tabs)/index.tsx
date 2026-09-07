import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useAuth } from '../../src/lib/AuthContext';
import { useData } from '../../src/lib/DataContext';
import { computeStreakDays, lastAttempt, sellerSummaries } from '../../src/lib/utils';
import { TestCard } from '../../src/components/TestCard';
import { Avatar, initialsFor } from '../../src/components/Avatar';
import { SearchIcon } from '../../src/components/icons';
import { StatTile } from '../../src/components/StatTile';
import { Button } from '../../src/components/Button';

export default function BazaarScreen() {
  const { session } = useAuth();
  const { tests, categories, purchasedIds, attempts, loading, refreshAll } = useData();
  const [activeCat, setActiveCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const streak = useMemo(() => computeStreakDays(attempts), [attempts]);
  const last = useMemo(() => lastAttempt(attempts), [attempts]);
  const topSellers = useMemo(() => sellerSummaries(tests).slice(0, 2), [tests]);

  const filtered = useMemo(() => {
    const list = activeCat === 'All' ? tests : tests.filter((t) => t.category === activeCat);
    return [...list].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [tests, activeCat]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
            <Text style={styles.wordmark}>TestMandi</Text>
            <Text style={styles.devanagari}>मंडी</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.roundBtn} onPress={() => router.push('/(tabs)/my-tests')}>
              <Text style={styles.roundBtnText}>₹</Text>
            </Pressable>
            <Pressable
              style={[styles.roundBtn, { backgroundColor: colors.marigold }]}
              onPress={() => router.push(session ? '/(tabs)/profile' : '/auth/login')}
            >
              <Text style={[styles.roundBtnText, { color: colors.ink }]}>{session ? initialsFor(session.name) : '?'}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
          <SearchIcon size={14} color="rgba(23,21,15,0.45)" />
          <Text style={styles.searchPlaceholder}>Search tests, sellers, subjects</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 13 }} contentContainerStyle={{ gap: 7 }}>
          {['All', ...categories].map((cat) => {
            const active = cat === activeCat;
            return (
              <Pressable key={cat} onPress={() => setActiveCat(cat)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        {session?.role === 'buyer' && (streak > 0 || last) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <StatTile label="STREAK" value={`${streak} day${streak === 1 ? '' : 's'}`} />
            {last ? <StatTile label="LAST SCORE" value={`${last.score}`} suffix={`/${last.total}`} /> : null}
          </View>
        ) : null}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today in the mandi</Text>
          <Pressable onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.sectionAction}>See all {tests.length}</Text>
          </Pressable>
        </View>

        {loading && tests.length === 0 ? (
          <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft, marginBottom: 16 }}>Loading tests…</Text>
        ) : (
          <View style={{ gap: 12, marginBottom: 20 }}>
            {filtered.map((t) => (
              <TestCard
                key={t.id}
                test={t}
                purchased={purchasedIds.has(t.id)}
                onPress={() => router.push(`/test/${t.id}`)}
                onPressSeller={() => router.push(`/seller/${encodeURIComponent(t.sellerEmail)}`)}
              />
            ))}
            {filtered.length === 0 ? <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>No tests in this category yet.</Text> : null}
          </View>
        )}

        {session?.role === 'buyer' ? (
          <View style={styles.promoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Refer & earn</Text>
              <Text style={styles.promoBody}>Invite a friend — when they buy their first test, you get 50% off yours.</Text>
            </View>
            <Button label="View" variant="marigold" onPress={() => router.push('/(tabs)/my-tests')} />
          </View>
        ) : null}

        {topSellers.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { marginBottom: 11 }]}>Top sellers</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {topSellers.map((s) => (
                <Pressable
                  key={s.sellerEmail}
                  style={styles.sellerCard}
                  onPress={() => router.push(`/seller/${encodeURIComponent(s.sellerEmail)}`)}
                >
                  <Avatar name={s.sellerName} size={26} />
                  <Text style={styles.sellerCardName} numberOfLines={1}>
                    {s.sellerName}
                  </Text>
                  <Text style={styles.sellerCardMeta}>{s.testCount} tests live</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.ink,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  wordmark: { fontFamily: fonts.serif, fontSize: 27, color: colors.onInk },
  devanagari: { fontFamily: fonts.devanagari, fontSize: 15, color: colors.marigold },
  roundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(246,241,231,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.onInk },
  searchBar: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  searchPlaceholder: { fontFamily: fonts.sans, fontSize: 14.5, color: 'rgba(23,21,15,0.45)' },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: 'rgba(246,241,231,0.12)' },
  chipActive: { backgroundColor: colors.marigold },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.onInk },
  chipTextActive: { fontFamily: fonts.sansSemiBold, color: colors.ink },
  body: { padding: 20, paddingBottom: 40 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  sectionAction: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.amber },
  promoCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: 15,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.onInk },
  promoBody: { fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(246,241,231,0.6)', marginTop: 6, lineHeight: 17 },
  sellerCard: {
    flex: 1,
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  sellerCardName: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.ink, marginTop: 9 },
  sellerCardMeta: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.inkFaint, marginTop: 4 },
});
