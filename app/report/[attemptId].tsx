import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, perfColor, radius } from '../../src/theme/theme';
import { useData } from '../../src/lib/DataContext';
import { api } from '../../src/lib/api';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
import { CheckIcon, CrossIcon } from '../../src/components/icons';
import { formatDuration } from '../../src/lib/utils';

export default function ReportScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const { attempts, testsById } = useData();
  const [myRating, setMyRating] = useState<number | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  const attempt = attempts.find((a) => a.id === attemptId);
  const test = attempt ? testsById[attempt.testId] : undefined;

  const pct = attempt ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const answeredCount = attempt ? Object.keys(attempt.answers).length : 0;
  const wrong = attempt ? answeredCount - attempt.score : 0;
  const skipped = attempt ? attempt.total - answeredCount : 0;

  const priorAttempts = useMemo(
    () => (attempt ? attempts.filter((a) => a.testId === attempt.testId && a.id !== attempt.id) : []),
    [attempts, attempt]
  );
  const bestPriorPct = priorAttempts.length
    ? Math.max(...priorAttempts.map((a) => Math.round((a.score / a.total) * 100)))
    : null;
  const improvement = bestPriorPct === null ? null : pct - bestPriorPct;

  const topics = useMemo(() => {
    if (!attempt) return [];
    return Object.entries(attempt.topicMap)
      .map(([topic, v]) => ({ topic, ...v, pct: Math.round((v.correct / v.total) * 100) }))
      .sort((a, b) => a.pct - b.pct);
  }, [attempt]);

  const weakTopics = topics.filter((t) => t.pct < 70).slice(0, 3);

  if (!attempt || !test) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, padding: 20 }}>
        <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const rate = async (value: number) => {
    setRateError(null);
    try {
      await api.rateTest(test.id, value);
      setMyRating(value);
    } catch (err: any) {
      setRateError(err.message || "Couldn't submit rating.");
    }
  };

  const share = () => {
    Share.share({ message: `I scored ${attempt.score}/${attempt.total} (${pct}%) on "${test.title}" on TestMandi.` }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerLabel}>INSTANT SCORE REPORT</Text>
          <Pressable onPress={share} hitSlop={8}>
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </View>

        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreBig}>{attempt.score}</Text>
            <Text style={styles.scoreSub}>
              of {attempt.total} · {test.title}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.pctBig}>{pct}%</Text>
            <Text style={styles.pctSub}>accuracy</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipLabel}>CORRECT</Text>
            <Text style={styles.statChipValue}>{attempt.score}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipLabel}>WRONG</Text>
            <Text style={styles.statChipValue}>{wrong}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipLabel}>SKIPPED</Text>
            <Text style={styles.statChipValue}>{skipped}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Time taken: {formatDuration(attempt.timeTakenSeconds)}</Text>
          {improvement !== null ? (
            <Text style={[styles.metaText, { color: improvement > 0 ? colors.teal : improvement < 0 ? colors.red : colors.inkSoft }]}>
              {improvement > 0 ? `+${improvement}%` : improvement === 0 ? 'Same as best' : `${improvement}%`} vs your best
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Topic-wise analysis</Text>
        <View style={{ gap: 14, marginBottom: 24 }}>
          {topics.map((t) => (
            <View key={t.topic}>
              <View style={styles.topicHeadRow}>
                <Text style={styles.topicName}>{t.topic}</Text>
                <Text style={[styles.topicPct, { color: perfColor(t.pct) }]}>{t.pct}%</Text>
              </View>
              <ProgressBar pct={t.pct} color={perfColor(t.pct)} />
              <Text style={styles.topicSub}>
                {t.correct}/{t.total} correct
              </Text>
            </View>
          ))}
        </View>

        {weakTopics.length > 0 ? (
          <View style={styles.studyCard}>
            <Text style={styles.studyTitle}>Study next, in this order</Text>
            <View style={{ gap: 11, marginTop: 12 }}>
              {weakTopics.map((t, i) => (
                <View key={t.topic} style={{ flexDirection: 'row', gap: 11 }}>
                  <Text style={styles.studyIndex}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.studyText}>
                    {t.topic} — {t.total - t.correct} of {t.total} lost here.
                  </Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.studyCta} onPress={() => router.push(`/(tabs)/search?q=${encodeURIComponent(weakTopics[0].topic)}`)}>
              <Text style={styles.studyCtaText}>Browse {weakTopics[0].topic} tests</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Question-by-question</Text>
        <View style={{ gap: 10, marginBottom: 24 }}>
          {test.questions.map((qu, i) => {
            const yourAns = attempt.answers[i];
            const correct = yourAns === qu.correct;
            return (
              <View key={i} style={styles.reviewRow}>
                <View style={{ marginTop: 2 }}>{correct ? <CheckIcon size={16} color={colors.teal} /> : <CrossIcon size={14} color={colors.red} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewQ}>
                    {i + 1}. {qu.text}
                  </Text>
                  <Text style={styles.reviewA}>
                    Your answer: <Text style={{ color: correct ? colors.teal : colors.red, fontFamily: fonts.sansSemiBold }}>{yourAns !== undefined ? qu.options[yourAns] : 'Not answered'}</Text>
                    {!correct ? (
                      <Text>
                        {' '}
                        · Correct: <Text style={{ color: colors.teal, fontFamily: fonts.sansSemiBold }}>{qu.options[qu.correct]}</Text>
                      </Text>
                    ) : null}
                  </Text>
                  {qu.explanation ? <Text style={styles.reviewExplain}>{qu.explanation}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Rate this test</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => rate(n)} hitSlop={6}>
              <Text style={{ fontSize: 24, color: colors.amber }}>{myRating && myRating >= n ? '★' : '☆'}</Text>
            </Pressable>
          ))}
        </View>
        {myRating ? <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.teal }}>Thanks — your rating helps other candidates choose.</Text> : null}
        {rateError ? <Text style={{ fontFamily: fonts.sans, fontSize: 12.5, color: colors.red }}>{rateError}</Text> : null}

        <Button label="Back to my tests" variant="outline" onPress={() => router.replace('/(tabs)/my-tests')} style={{ marginTop: 20 }} fullWidth />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.ink, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLabel: { fontFamily: fonts.monoMedium, fontSize: 11.5, letterSpacing: 0.8, color: 'rgba(246,241,231,0.55)' },
  shareText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.marigold },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 },
  scoreBig: { fontFamily: fonts.serif, fontSize: 54, lineHeight: 54, color: colors.onInk },
  scoreSub: { fontFamily: fonts.sans, fontSize: 13, color: 'rgba(246,241,231,0.6)', marginTop: 6, maxWidth: 200 },
  pctBig: { fontFamily: fonts.monoMedium, fontSize: 22, color: colors.marigold },
  pctSub: { fontFamily: fonts.sans, fontSize: 11.5, color: 'rgba(246,241,231,0.5)', marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statChip: { flex: 1, backgroundColor: 'rgba(246,241,231,0.08)', borderRadius: 11, padding: 10 },
  statChipLabel: { fontFamily: fonts.monoMedium, fontSize: 9.5, color: 'rgba(246,241,231,0.5)' },
  statChipValue: { fontFamily: fonts.monoMedium, fontSize: 16, color: colors.onInk, marginTop: 5 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  metaText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, marginBottom: 13 },
  topicHeadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  topicName: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  topicPct: { fontFamily: fonts.mono, fontSize: 13 },
  topicSub: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.inkSoft, marginTop: 6 },
  studyCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 16, marginBottom: 24 },
  studyTitle: { fontFamily: fonts.serif, fontSize: 19, color: colors.onInk },
  studyIndex: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.marigold },
  studyText: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 19, color: 'rgba(246,241,231,0.85)' },
  studyCta: { marginTop: 15, padding: 13, borderRadius: 11, backgroundColor: colors.marigold, alignItems: 'center' },
  studyCtaText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.ink },
  reviewRow: { flexDirection: 'row', gap: 10, backgroundColor: colors.paperCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 },
  reviewQ: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.ink, marginBottom: 4 },
  reviewA: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft },
  reviewExplain: { fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(23,21,15,0.55)', fontStyle: 'italic', marginTop: 4 },
});
