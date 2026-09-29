import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { ChildProvider } from '@/context/ChildContext';
import { LearningProvider } from '@/context/LearningContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChildProvider>
          <LearningProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                // Calm, predictable transitions.
                animation: 'fade',
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </LearningProvider>
        </ChildProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
