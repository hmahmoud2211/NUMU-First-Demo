import { useEffect, useState, type ReactNode } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { gameColors } from '@/theme';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 'bottom' slides up a tall panel; 'center' pops a small dialog. */
  placement?: 'bottom' | 'center';
  style?: StyleProp<ViewStyle>;
};

/** An in-world overlay panel. Stays mounted while it animates out. */
export function Sheet({ visible, onClose, children, placement = 'bottom', style }: SheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [t] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(visible);

  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    const animation = Animated.timing(t, {
      toValue: visible ? 1 : 0,
      duration: reduceMotion ? 0 : visible ? 320 : 220,
      easing: visible ? Easing.out(Easing.back(1.1)) : Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, mounted, t, reduceMotion]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  if (!mounted) return null;

  const panelMotion =
    placement === 'bottom'
      ? { transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }
      : { opacity: t, transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: t }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View
        pointerEvents="box-none"
        style={[
          styles.frame,
          placement === 'bottom' ? styles.bottom : styles.center,
          { paddingTop: insets.top + 24, paddingBottom: placement === 'bottom' ? 0 : insets.bottom + 24 },
        ]}
      >
        <Animated.View
          style={[
            styles.panel,
            placement === 'bottom' ? [styles.panelBottom, { paddingBottom: insets.bottom + 12 }] : styles.panelCenter,
            panelMotion,
            style,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: gameColors.overlay,
  },
  frame: {
    flex: 1,
    paddingHorizontal: 12,
  },
  bottom: {
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: '#F7F5FF',
    boxShadow: '0px -6px 30px rgba(28, 20, 70, 0.3)',
  },
  panelBottom: {
    maxHeight: '100%',
    flexShrink: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
  },
  panelCenter: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 30,
    padding: 20,
    borderBottomWidth: 6,
    borderBottomColor: gameColors.cardEdge,
  },
});
