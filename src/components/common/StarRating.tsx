import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

type StarRatingProps = {
  stars: number;
  max?: number;
  size?: number;
};

export function StarRating({ stars, max = 3, size = 44 }: StarRatingProps) {
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel={`${stars} of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => (
        <Ionicons
          key={index}
          name="star"
          size={index === 1 ? size * 1.2 : size}
          color={index < stars ? colors.star : colors.starEmpty}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
