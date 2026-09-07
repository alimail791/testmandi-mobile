import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useData } from '../../src/lib/DataContext';
import { api } from '../../src/lib/api';
import { formatClock } from '../../src/lib/utils';

export default function AttemptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { testsById, refreshBuyerData } = useData();
  const test = testsById[id];

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (test && secondsLeft === null) setSecondsLeft(test.duration * 60);
  }, [test, secondsLeft]);

  const submit = useCallback(async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    let score = 0;
    const topicMap: Record<string, { correct: number; total: number }> = {};
    test.questions.forEach((qu, i) => {
      const topic = qu.topic || 'General';
      topicMap[topic] = topicMap[topic] || { correct: 0, total: 0 };
      topicMap[topic].total += 1;
      if (answers[i] === qu.correct) {
        score += 1;
        topicMap[topic].correct += 1;
      }
    });
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    try {
      const { attempt } = await api.submitAttempt({
        testId: test.id,
        score,
        total: test.questions.length,
        answers,
        topicMap,
        timeTakenSeconds,
      });
      await refreshBuyerData();
      router.replace(`/report/${attempt.id}`);
    } catch (err) {
      setSubmitting(false);
    }
  }, [test, answers, submitting, refreshBuyerData]);

  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    if (!test || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, test]);

  if (!test || secondsLeft === null) return null;

  const total = test.questions.length;
  const qu = test.questions[qIndex];
  const isLast = qIndex === total - 1;
  const shownNum = qIndex + 1;

  const pick = (optIdx: number) => setAnswers((a) => ({ ...a, [qIndex]: optIdx }));
  const goNext = () => (isLast ? submit() : setQIndex((i) => i + 1));

  return (
    <View style={{ flex: 1, backgroundColor: colors.paperCard }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel} numberOfLines={1}>
            {test.category} · {qu.topic}
          </Text>
          <View style={styles.clockPill}>
            <Text style={styles.clockText}>{formatClock(secondsLeft)}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(shownNum / total) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {shownNum}/{total}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.exitBtn} hitSlop={8}>
          <Text style={styles.exitText}>Exit</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={styles.marking}>+1 CORRECT · NO NEGATIVE MARKING</Text>
        <Text style={styles.question}>{qu.text}</Text>

        <View style={{ marginTop: 18, gap: 10 }}>
          {qu.options.map((opt, oi) => {
            const on = answers[qIndex] === oi;
            return (
              <Pressable key={oi} onPress={() => pick(oi)} style={[styles.option, on && styles.optionOn]}>
                <View style={[styles.optionKey, on && styles.optionKeyOn]}>
                  <Text style={[styles.optionKeyText, on && styles.optionKeyTextOn]}>{String.fromCharCode(65 + oi)}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.paletteLabel}>QUESTION PALETTE</Text>
        <View style={styles.paletteGrid}>
          {test.questions.map((_, i) => {
            const answered = answers[i] !== undefined;
            const current = i === qIndex;
            return (
              <Pressable key={i} onPress={() => setQIndex(i)} style={[styles.paletteCell, current ? styles.paletteCurrent : answered ? styles.paletteAnswered : styles.paletteEmpty]}>
                <Text style={[styles.paletteCellText, current && { color: colors.onInk }]}>{i + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable onPress={goNext} style={styles.skipBtn} disabled={submitting}>
          <Text style={styles.skipText}>Mark &amp; skip</Text>
        </Pressable>
        <Pressable onPress={goNext} style={[styles.nextBtn, submitting && { opacity: 0.6 }]} disabled={submitting}>
          <Text style={styles.nextText}>{submitting ? 'Submitting…' : isLast ? 'Submit test' : 'Save & next'}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.ink, paddingHorizontal: 20, paddingBottom: 12, position: 'relative' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 50 },
  headerLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: 'rgba(246,241,231,0.6)', flexShrink: 1 },
  clockPill: { backgroundColor: 'rgba(227,168,87,0.18)', paddingVertical: 6, paddingHorizontal: 9, borderRadius: 8 },
  clockText: { fontFamily: fonts.monoMedium, fontSize: 14, color: colors.marigold },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressTrack: { flex: 1, height: 4, borderRadius: 99, backgroundColor: 'rgba(246,241,231,0.15)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.marigold },
  progressLabel: { fontFamily: fonts.monoMedium, fontSize: 11.5, color: 'rgba(246,241,231,0.7)' },
  exitBtn: { position: 'absolute', top: 8, right: 20 },
  exitText: { fontFamily: fonts.sansMedium, fontSize: 12, color: 'rgba(246,241,231,0.55)' },
  marking: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.8, color: colors.inkFaint },
  question: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 24, color: colors.ink, marginTop: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paperCard,
  },
  optionOn: { borderColor: colors.ink, borderWidth: 2, backgroundColor: colors.paper },
  optionKey: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,21,15,0.07)' },
  optionKeyOn: { backgroundColor: colors.ink },
  optionKeyText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.ink },
  optionKeyTextOn: { color: colors.onInk },
  optionText: { flex: 1, fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 20, color: colors.ink },
  paletteLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.8, color: colors.inkFaint, marginTop: 20 },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  paletteCell: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  paletteCurrent: { backgroundColor: colors.ink },
  paletteAnswered: { backgroundColor: 'rgba(43,85,96,0.16)' },
  paletteEmpty: { backgroundColor: 'rgba(23,21,15,0.06)' },
  paletteCellText: { fontFamily: fonts.monoMedium, fontSize: 10.5, color: 'rgba(23,21,15,0.6)' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
    backgroundColor: 'rgba(255,253,248,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipBtn: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong },
  skipText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  nextBtn: { flex: 1, paddingVertical: 15, borderRadius: radius.lg, backgroundColor: colors.ink, alignItems: 'center' },
  nextText: { fontFamily: fonts.sansSemiBold, fontSize: 14.5, color: colors.onInk },
});
