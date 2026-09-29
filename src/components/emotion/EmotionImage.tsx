import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FaceIllustration } from '@/components/face/FaceIllustration';
import { getFaceVariant } from '@/data/emotionFaceConfigurations';
import { colors, emotionColors, radius } from '@/theme';
import type { EmotionImage as EmotionImageData, FacePartCategory } from '@/types/emotion';
import { hashString } from '@/utils/random';

type EmotionImageProps = {
  image: EmotionImageData;
  size: number;
  /** Draws a calm highlight around a facial area (used for hints). */
  highlight?: FacePartCategory | null;
  /** Tint the frame with the emotion colour (only after the answer is known). */
  revealEmotion?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Approximate part positions (fraction of height) for centred, cropped faces. */
const HIGHLIGHT_POSITION: Record<'photo' | 'illustration', Record<FacePartCategory, { top: number; height: number }>> = {
  photo: { brows: { top: 0.2, height: 0.16 }, eyes: { top: 0.32, height: 0.18 }, mouth: { top: 0.64, height: 0.22 } },
  illustration: { brows: { top: 0.27, height: 0.17 }, eyes: { top: 0.4, height: 0.16 }, mouth: { top: 0.66, height: 0.2 } },
};

/**
 * Renders any EmotionImage: a FER2013 photo, a remote image, or an illustrated
 * face. If a photo fails to load, an illustration is shown instead.
 */
export function EmotionImage({ image, size, highlight, revealEmotion = false, style }: EmotionImageProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = image.kind === 'photo' && !failed;
  const variant = image.kind === 'illustration' ? image.variant : hashString(image.id) % 6;
  const frameColor = revealEmotion ? emotionColors[image.emotion].soft : colors.surfaceAlt;
  const position = highlight ? HIGHLIGHT_POSITION[showPhoto ? 'photo' : 'illustration'][highlight] : null;

  return (
    <View
      style={[styles.frame, { width: size, height: size, backgroundColor: frameColor }, style]}
      accessibilityRole="image"
      accessibilityLabel="A face showing a feeling"
    >
      {showPhoto ? (
        <Image
          source={image.source}
          style={styles.photo}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <FaceIllustration parts={getFaceVariant(image.emotion, variant)} variant={variant} size={size * 0.92} />
      )}
      {position ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            { top: size * position.top, height: size * position.height, left: size * 0.16, right: size * 0.16 },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  highlight: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 181, 71, 0.12)',
  },
});
