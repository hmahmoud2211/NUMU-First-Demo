import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

type NumuLogoProps = {
  size?: number;
};

/** A sprout in a circle — "numu" means growth in Arabic. */
export function NumuLogo({ size = 96 }: NumuLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="NUMU logo">
      <Circle cx={50} cy={50} r={48} fill={colors.primary} />
      <Circle cx={50} cy={50} r={40} fill={colors.primarySoft} />
      <Path d="M50 80 C50 66 50 58 50 48" stroke={colors.avatarLeafDark} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M50 52 C34 52 26 42 26 28 C40 28 50 36 50 52 Z" fill={colors.avatarLeaf} />
      <Path d="M50 46 C62 46 72 38 74 24 C60 24 50 32 50 46 Z" fill={colors.secondary} />
      <Circle cx={50} cy={80} r={6} fill={colors.accent} />
    </Svg>
  );
}
