import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { NumuLogo } from '@/components/common/NumuLogo';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useChild } from '@/context/ChildContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { enterWorld } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

const BUTTON_DELAY_MS = 900;

export default function SplashScreen() {
  const { parent, onboardingSeen, isReady: authReady } = useAuth();
  const { child, isReady: childReady } = useChild();
  const reduceMotion = useReduceMotion();
  const [logo] = useState(() => new Animated.Value(0));
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    Animated.timing(logo, {
      toValue: 1,
      duration: reduceMotion ? 0 : 900,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => setShowButton(true), reduceMotion ? 0 : BUTTON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [logo, reduceMotion]);

  const ready = authReady && childReady;

  const getStarted = () => {
    if (parent && child?.learningArea) enterWorld();
    else if (parent) router.replace(routes.childProfile);
    else if (onboardingSeen) router.replace(routes.auth);
    else router.replace(routes.onboarding);
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.content}>
      <Animated.View
        style={[
          styles.brand,
          { opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
        ]}
      >
        <NumuLogo size={128} />
        <Text style={[typography.display, styles.name]}>NUMU</Text>
        <Text style={[typography.bodySecondary, styles.center]}>Neurodevelopment Understanding & Monitoring Unit</Text>
        <Text style={[typography.label, styles.slogan]}>Nurture. Understand. Monitor. Unite.</Text>
      </Animated.View>
      <View style={styles.footer}>
        {showButton ? (
          <AppButton title="Get Started" icon="arrow-forward" onPress={getStarted} loading={!ready} />
        ) : null}
        <Text style={[typography.caption, styles.center]}>A learning support tool for families.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxl,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.primaryDark,
    letterSpacing: 6,
    marginTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  slogan: {
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  footer: {
    gap: spacing.md,
    minHeight: 90,
    justifyContent: 'flex-end',
  },
});
