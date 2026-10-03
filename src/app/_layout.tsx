import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { ChildProvider } from '@/context/ChildContext';
import { LearningProvider } from '@/context/LearningContext';
import { WorldProvider } from '@/context/WorldContext';
import { colors } from '@/theme';

export default function RootLayout() {
  // The game font is small; wait for it (or its failure) so text never jumps.
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChildProvider>
          <LearningProvider>
            <WorldProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  // Calm, predictable transitions.
                  animation: 'fade',
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </WorldProvider>
          </LearningProvider>
        </ChildProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
