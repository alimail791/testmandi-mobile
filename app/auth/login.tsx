import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, radius } from '../../src/theme/theme';
import { useAuth } from '../../src/lib/AuthContext';
import { api } from '../../src/lib/api';
import { Button } from '../../src/components/Button';
import { CrossIcon } from '../../src/components/icons';

type Mode = 'login' | 'register' | 'forgot';
type AccType = 'buyer' | 'seller' | 'advertiser';

export default function LoginScreen() {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [accType, setAccType] = useState<AccType>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const close = () => router.back();

  const submitLogin = async () => {
    if (!email.trim() || !password.trim()) return setLocalError('Enter your email and password.');
    setLocalError('');
    clearError();
    setBusy(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.back();
    } catch {
      /* error state already set by AuthContext */
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || ((accType === 'seller' || accType === 'advertiser') && !businessName.trim())) {
      setLocalError('Please fill in every field.');
      return;
    }
    setLocalError('');
    clearError();
    setBusy(true);
    try {
      await register({
        role: accType,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        businessName: businessName.trim(),
        referralCodeUsed: referralCode.trim().toUpperCase(),
      });
      router.back();
    } catch {
      /* error state already set by AuthContext */
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async () => {
    if (!email.trim()) return setLocalError('Enter your email.');
    setLocalError('');
    setBusy(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setForgotSent(true);
    } catch (err: any) {
      setLocalError(err.message || 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{mode === 'login' ? 'Log in' : mode === 'register' ? 'Create an account' : 'Reset your password'}</Text>
          <Pressable onPress={close} hitSlop={8}>
            <CrossIcon size={16} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {mode === 'forgot' ? (
            forgotSent ? (
              <Text style={styles.info}>If that email is registered, a reset link has been sent — check your inbox for it.</Text>
            ) : (
              <>
                <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
                {localError ? <Text style={styles.error}>{localError}</Text> : null}
                <Button label={busy ? 'Sending…' : 'Send reset link'} onPress={submitForgot} loading={busy} style={{ marginTop: 16 }} fullWidth />
              </>
            )
          ) : (
            <>
              {mode === 'register' ? (
                <View style={styles.roleRow}>
                  {(['buyer', 'seller', 'advertiser'] as AccType[]).map((r) => (
                    <Pressable key={r} onPress={() => setAccType(r)} style={[styles.roleChip, accType === r && styles.roleChipActive]}>
                      <Text style={[styles.roleChipText, accType === r && styles.roleChipTextActive]}>{r[0].toUpperCase() + r.slice(1)}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {mode === 'register' ? (
                <Field label={accType === 'buyer' ? 'Full name' : 'Contact person name'} value={name} onChangeText={setName} placeholder="e.g. Priya Nair" />
              ) : null}
              {mode === 'register' && accType !== 'buyer' ? (
                <Field
                  label={accType === 'seller' ? 'Institute / brand name' : 'Advertiser / business name'}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g. Apex Physics Institute"
                />
              ) : null}
              <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
              {mode === 'register' ? (
                <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="10-digit mobile number" />
              ) : null}
              <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
              {mode === 'register' && accType === 'buyer' ? (
                <Field label="Referral code (optional)" value={referralCode} onChangeText={(v) => setReferralCode(v.toUpperCase())} placeholder="Got a code from a friend?" />
              ) : null}

              {(localError || error) ? <Text style={styles.error}>{localError || error}</Text> : null}

              <Button
                label={busy ? (mode === 'login' ? 'Logging in…' : 'Registering…') : mode === 'login' ? 'Log in' : 'Register'}
                onPress={mode === 'login' ? submitLogin : submitRegister}
                loading={busy}
                style={{ marginTop: 16 }}
                fullWidth
                size="lg"
              />

              {mode === 'login' ? (
                <Pressable onPress={() => { setMode('forgot'); setLocalError(''); }} style={{ marginTop: 10, alignItems: 'center' }}>
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError(''); clearError(); }}
                style={{ marginTop: 14, alignItems: 'center' }}
              >
                <Text style={styles.switchText}>
                  {mode === 'login' ? "New here? " : 'Already registered? '}
                  <Text style={styles.link}>{mode === 'login' ? 'Create an account' : 'Log in'}</Text>
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="rgba(23,21,15,0.35)"
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleChip: { flex: 1, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center' },
  roleChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleChipText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ink },
  roleChipTextActive: { color: colors.onInk },
  fieldLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.inkSoft, marginBottom: 6 },
  input: {
    backgroundColor: colors.paperCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
  },
  error: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.red, marginTop: 4 },
  info: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.ink, lineHeight: 20 },
  link: { fontFamily: fonts.sansSemiBold, color: colors.amber },
  switchText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.inkSoft },
});
