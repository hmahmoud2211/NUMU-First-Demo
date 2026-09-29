import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { NumuLogo } from '@/components/common/NumuLogo';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { useAuth } from '@/context/AuthContext';
import { useChild } from '@/context/ChildContext';
import { routes } from '@/navigation/routes';
import { colors, radius, spacing, typography } from '@/theme';

type Mode = 'signup' | 'login';

export default function AuthScreen() {
  const { signUp, login, continueAsDemo } = useAuth();
  const { selectDemoChild } = useChild();
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'form' | 'demo' | null>(null);

  const submit = async () => {
    setBusy('form');
    setError(null);
    const result = mode === 'signup' ? await signUp(name, email, password) : await login(email, password);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(routes.childProfile);
  };

  const startDemo = async () => {
    setBusy('demo');
    await continueAsDemo();
    await selectDemoChild();
    setBusy(null);
    router.push(routes.childProfile);
  };

  return (
    <ScreenContainer keyboardAware>
      <View style={styles.brand}>
        <NumuLogo size={64} />
        <Text style={typography.h1}>Welcome to NUMU</Text>
        <Text style={[typography.bodySecondary, styles.center]}>Create a parent account to set up your child’s learning space.</Text>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['signup', 'login'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === item }}
            onPress={() => {
              setMode(item);
              setError(null);
            }}
            style={[styles.tab, mode === item && styles.tabActive]}
          >
            <Text style={[typography.label, mode === item && styles.tabTextActive]}>
              {item === 'signup' ? 'Create Account' : 'Login'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.form}>
        {mode === 'signup' ? (
          <TextField label="Parent Name" value={name} onChangeText={setName} placeholder="e.g. Sara" autoComplete="name" />
        ) : null}
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 4 characters"
          secureTextEntry
          helper="Demo only — accounts are stored on this device and passwords are not saved."
        />
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        <AppButton title={mode === 'signup' ? 'Create Account' : 'Login'} onPress={submit} loading={busy === 'form'} disabled={busy === 'demo'} />
      </Card>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={typography.caption}>or</Text>
        <View style={styles.line} />
      </View>

      <AppButton
        title="Continue as Demo Parent"
        variant="secondary"
        icon="sparkles"
        onPress={startDemo}
        loading={busy === 'demo'}
        disabled={busy === 'form'}
        accessibilityHint="Creates a demo parent with a sample child called Adam"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.xxs,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabTextActive: {
    color: colors.primary,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.bodySecondary,
    color: colors.attention,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
