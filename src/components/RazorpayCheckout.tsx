import React from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';
import { Button } from './Button';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface RazorpayCheckoutProps {
  visible: boolean;
  order: RazorpayOrder | null;
  keyId: string;
  description: string;
  buyerName: string;
  onSuccess: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
}

// checkout.js posts a `postMessage` back to the WebView with the payment
// response on success, and calls ondismiss when the sheet is closed manually.
function buildHtml(order: RazorpayOrder, keyId: string, description: string, buyerName: string) {
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#F6F1E7;font-family:sans-serif">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  function post(type, payload) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
  }
  var options = {
    key: ${JSON.stringify(keyId)},
    amount: ${order.amount},
    currency: ${JSON.stringify(order.currency)},
    order_id: ${JSON.stringify(order.id)},
    name: "TestMandi",
    description: ${JSON.stringify(description)},
    prefill: { name: ${JSON.stringify(buyerName)} },
    theme: { color: "#17150F" },
    handler: function (response) { post('success', response); },
    modal: { ondismiss: function () { post('dismiss', null); } },
  };
  try {
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) { post('failed', resp.error); });
    rzp.open();
  } catch (e) {
    post('error', String(e));
  }
</script>
</body></html>`;
}

export function RazorpayCheckout({ visible, order, keyId, description, buyerName, onSuccess, onDismiss }: RazorpayCheckoutProps) {
  if (!visible || !order) return null;

  if (Platform.OS === 'web') {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.webFallback}>
          <View style={styles.webCard}>
            <Text style={styles.webTitle}>Razorpay checkout</Text>
            <Text style={styles.webBody}>
              The native Razorpay checkout opens in-app on iOS/Android. It isn't available in this web preview.
            </Text>
            <Button label="Close" variant="outline" onPress={onDismiss} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    );
  }

  // Native: lazy-require so the web bundle never touches react-native-webview.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WebView } = require('react-native-webview');

  return (
    <Modal visible animationType="slide" onRequestClose={onDismiss}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHtml(order, keyId, description, buyerName) }}
        onMessage={(event: any) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'success') onSuccess(msg.payload);
            else if (msg.type === 'dismiss' || msg.type === 'failed' || msg.type === 'error') onDismiss();
          } catch {
            onDismiss();
          }
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  webFallback: { flex: 1, backgroundColor: 'rgba(23,21,15,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  webCard: { backgroundColor: colors.paperCard, borderRadius: 16, padding: 20, maxWidth: 360 },
  webTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, marginBottom: 8 },
  webBody: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
});
