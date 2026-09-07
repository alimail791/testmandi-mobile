import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { TestCard } from '../../src/components/TestCard';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useData } from '../../src/lib/DataContext';
import { SearchIcon } from '../../src/components/icons';

export default function SearchScreen() {
  const { tests, purchasedIds } = useData();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');

  useEffect(() => {
    if (q) setQuery(q);
  }, [q]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...tests].sort((a, b) => b.rating - a.rating);
    return tests.filter(
      (t) => t.title.toLowerCase().includes(q) || t.sellerName.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [tests, query]);

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchBar}>
          <SearchIcon size={14} color="rgba(23,21,15,0.45)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tests, sellers, subjects"
            placeholderTextColor="rgba(23,21,15,0.4)"
            style={styles.input}
            autoCorrect={false}
          />
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12 }}
        renderItem={({ item }) => (
          <TestCard
            test={item}
            purchased={purchasedIds.has(item.id)}
            onPress={() => router.push(`/test/${item.id}`)}
            onPressSeller={() => router.push(`/seller/${encodeURIComponent(item.sellerEmail)}`)}
          />
        )}
        ListEmptyComponent={<Text style={{ fontFamily: fonts.sans, color: colors.inkSoft, textAlign: 'center', marginTop: 30 }}>No matches.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  input: { flex: 1, fontFamily: fonts.sans, fontSize: 14.5, color: colors.ink },
});
