import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts as useInstrumentSerif, InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { useFonts as useFamiljenGrotesk, FamiljenGrotesk_400Regular, FamiljenGrotesk_500Medium, FamiljenGrotesk_600SemiBold, FamiljenGrotesk_700Bold } from '@expo-google-fonts/familjen-grotesk';
import { useFonts as useJetBrainsMono, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { useFonts as useNotoSerifDevanagari, NotoSerifDevanagari_600SemiBold } from '@expo-google-fonts/noto-serif-devanagari';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/lib/AuthContext';
import { DataProvider } from '../src/lib/DataContext';
import { colors } from '../src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [serifLoaded] = useInstrumentSerif({ InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic });
  const [sansLoaded] = useFamiljenGrotesk({
    FamiljenGrotesk_400Regular,
    FamiljenGrotesk_500Medium,
    FamiljenGrotesk_600SemiBold,
    FamiljenGrotesk_700Bold,
  });
  const [monoLoaded] = useJetBrainsMono({ JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold });
  const [devanagariLoaded] = useNotoSerifDevanagari({ NotoSerifDevanagari_600SemiBold });

  const fontsLoaded = serifLoaded && sansLoaded && monoLoaded && devanagariLoaded;

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <View style={{ flex: 1, backgroundColor: colors.ground }} onLayout={onLayout}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="test/[id]" options={{ presentation: 'card' }} />
              <Stack.Screen name="test/[id]/pay" options={{ presentation: 'modal' }} />
              <Stack.Screen name="attempt/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
              <Stack.Screen name="report/[attemptId]" options={{ presentation: 'card' }} />
              <Stack.Screen name="seller/[email]" options={{ presentation: 'card' }} />
              <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
