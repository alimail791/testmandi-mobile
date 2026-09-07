import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius } from '../../../src/theme/theme';
import { useData } from '../../../src/lib/DataContext';
import { useAuth } from '../../../src/lib/AuthContext';
import { api } from '../../../src/lib/api';
import { Button } from '../../../src/components/Button';
import { RazorpayCheckout, RazorpayOrder } from '../../../src/components/RazorpayCheckout';

export default function PayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { testsById, refreshBuyerData } = useData();
  const { session } = useAuth();
  const test = testsById[id];

  const [hasReward, setHasReward] = useState(false);
  const [applyReward, setApplyReward] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{ order: RazorpayOrder; keyId: string; description: string } | null>(null);

  useEffect(() => {
    api
      .getMyReferrals()
      .then((data: any) => setHasReward((data.rewards || []).some((r: any) => !r.used)))
      .catch(() => {});
  }, []);

  if (!test) return null;

  const shownPrice = applyReward && hasReward ? Math.round(test.price * 0.5) : test.price;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const order = await api.createOrder({ kind: 'test', itemId: test.id, applyReward });
      if (order.free) {
        await refreshBuyerData();
        router.replace(`/attempt/${test.id}`);
        return;
      }
      setCheckout({ order: order.order, keyId: order.keyId, description: order.description });
    } catch (err: any) {
      setError(err.message || 'Could not start checkout.');
    } finally {
      setBusy(false);
    }
  };

  const onCheckoutSuccess = async (payload: any) => {
    setCheckout(null);
    setBusy(true);
    try {
      await api.verifyPayment(payload);
      await refreshBuyerData();
      router.replace(`/attempt/${test.id}`);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed — no purchase was recorded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.grip} />
        <Text style={styles.title}>Pay the seller</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{test.title}</Text>
            <Text style={styles.summaryValue}>₹{test.price}</Text>
          </View>
          {applyReward && hasReward ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Referral reward</Text>
              <Text style={[styles.summaryValue, { color: colors.teal }]}>-50%</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mandi fee</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{shownPrice}</Text>
          </View>
        </View>

        {hasReward ? (
          <Pressable style={styles.rewardRow} onPress={() => setApplyReward((v) => !v)}>
            <View style={[styles.checkbox, applyReward && styles.checkboxOn]} />
            <Text style={styles.rewardText}>Apply your referral reward — 50% off this purchase</Text>
          </Pressable>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={shownPrice > 0 ? `Pay ₹${shownPrice} and start` : 'Start test'}
          onPress={pay}
          loading={busy}
          style={{ marginTop: 16 }}
          fullWidth
          size="lg"
        />
        <Pressable onPress={() => router.back()} style={{ marginTop: 11, alignItems: 'center' }}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </SafeAreaView>

      <RazorpayCheckout
        visible={!!checkout}
        order={checkout?.order ?? null}
        keyId={checkout?.keyId ?? ''}
        description={checkout?.description ?? ''}
        buyerName={session?.name ?? ''}
        onSuccess={onCheckoutSuccess}
        onDismiss={() => setCheckout(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(23,21,15,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  grip: { width: 40, height: 4, borderRadius: 99, backgroundColor: 'rgba(23,21,15,0.2)', alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  summaryCard: {
    marginTop: 14,
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontFamily: fonts.sans, fontSize: 13.5, color: 'rgba(23,21,15,0.7)', flexShrink: 1, paddingRight: 8 },
  summaryValue: { fontFamily: fonts.mono, fontSize: 13.5, color: 'rgba(23,21,15,0.7)' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  totalLabel: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink },
  totalValue: { fontFamily: fonts.mono, fontSize: 15, color: colors.ink },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: colors.borderStrong },
  checkboxOn: { backgroundColor: colors.marigold, borderColor: colors.marigold },
  rewardText: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(23,21,15,0.7)' },
  error: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.red, marginTop: 12 },
  cancel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.inkFaint },
});
