/**
 * Vector face made from interchangeable parts. Used by the Face Builder,
 * as illustrated fallback examples when no FER2013 photo exists, and in
 * coaching comparisons.
 */
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { colors, illustrationPalette } from '@/theme';
import type { BrowShape, EyeShape, FacePartCategory, FaceParts, MouthShape } from '@/types/emotion';

const EYE_CENTERS = [72, 128];
const EYE_Y = 100;

function Eyes({ shape }: { shape: EyeShape }) {
  const size = { relaxed: { rx: 11, ry: 9, pupil: 5.5 }, wide: { rx: 13, ry: 14, pupil: 5 }, narrowed: { rx: 11, ry: 4.5, pupil: 3.5 } }[shape];
  return (
    <G>
      {EYE_CENTERS.map((cx) => (
        <G key={cx}>
          <Ellipse cx={cx} cy={EYE_Y} rx={size.rx} ry={size.ry} fill={colors.faceEyeWhite} stroke={colors.faceStroke} strokeWidth={2.5} />
          <Circle cx={cx} cy={EYE_Y + (shape === 'relaxed' ? 1 : 0)} r={size.pupil} fill={colors.faceStroke} />
        </G>
      ))}
    </G>
  );
}

const BROW_PATHS: Record<BrowShape, [string, string]> = {
  neutral: ['M58 78 Q72 74 86 78', 'M114 78 Q128 74 142 78'],
  raised: ['M58 70 Q72 58 86 66', 'M114 66 Q128 58 142 70'],
  lowered: ['M58 74 Q72 78 88 86', 'M112 86 Q128 78 142 74'],
  worried: ['M58 82 Q72 80 86 70', 'M114 70 Q128 80 142 82'],
};

function Brows({ shape }: { shape: BrowShape }) {
  return (
    <G>
      {BROW_PATHS[shape].map((d) => (
        <Path key={d} d={d} stroke={colors.faceStroke} strokeWidth={5} strokeLinecap="round" fill="none" />
      ))}
    </G>
  );
}

function Mouth({ shape }: { shape: MouthShape }) {
  const stroke = { stroke: colors.faceStroke, strokeWidth: 4.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'smile':
      return <Path d="M76 142 Q100 174 124 142 Q100 152 76 142 Z" fill={colors.faceMouthInside} {...stroke} />;
    case 'frown':
      return <Path d="M80 160 Q100 140 120 160" fill="none" {...stroke} />;
    case 'open':
      return <Path d="M76 148 Q100 140 124 148 Q124 166 100 166 Q76 166 76 148 Z" fill={colors.faceMouthInside} {...stroke} />;
    case 'round':
      return <Ellipse cx={100} cy={154} rx={10} ry={13} fill={colors.faceMouthInside} {...stroke} />;
    case 'neutral':
      return <Path d="M84 152 L116 152" {...stroke} />;
    case 'scrunch':
      return (
        <G>
          <Path d="M80 152 Q90 142 100 148 Q110 154 120 144" fill="none" {...stroke} />
          <Path d="M90 114 L95 118 M110 114 L105 118" {...stroke} strokeWidth={2.5} />
        </G>
      );
  }
}

function Hair({ style, color }: { style: number; color: string }) {
  switch (style % 4) {
    case 0:
      return <Path d="M28 104 C24 30 176 30 172 104 C160 50 120 44 100 50 C80 44 44 50 28 104 Z" fill={color} />;
    case 1:
      return <Path d="M30 96 C30 30 170 30 170 96 C150 52 110 46 100 56 C90 46 50 52 30 96 Z" fill={color} />;
    case 2:
      return (
        <G>
          <Circle cx={100} cy={30} r={20} fill={color} />
          <Path d="M30 98 C30 34 170 34 170 98 C150 44 50 44 30 98 Z" fill={color} />
        </G>
      );
    default:
      return (
        <G>
          {[40, 62, 86, 112, 136, 158].map((cx, i) => (
            <Circle key={cx} cx={cx} cy={i === 0 || i === 5 ? 62 : 40} r={20} fill={color} />
          ))}
        </G>
      );
  }
}

type FaceIllustrationProps = {
  parts: FaceParts;
  /** Varies skin tone and hair so examples look like different people. */
  variant?: number;
  size?: number;
  accessibilityLabel?: string;
};

export function FaceIllustration({ parts, variant = 0, size = 200, accessibilityLabel }: FaceIllustrationProps) {
  const skin = illustrationPalette.skinTones[variant % illustrationPalette.skinTones.length];
  const hair = illustrationPalette.hairColors[variant % illustrationPalette.hairColors.length];
  const longHair = variant % 4 === 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel={accessibilityLabel}>
      {longHair ? <Rect x={30} y={70} width={140} height={120} rx={40} fill={hair} /> : null}
      <Circle cx={28} cy={112} r={12} fill={skin} />
      <Circle cx={172} cy={112} r={12} fill={skin} />
      <Circle cx={100} cy={110} r={74} fill={skin} />
      <Hair style={variant} color={hair} />
      {parts.mouth === 'smile' ? (
        <G opacity={0.55}>
          <Ellipse cx={58} cy={130} rx={11} ry={6} fill={colors.faceBlush} />
          <Ellipse cx={142} cy={130} rx={11} ry={6} fill={colors.faceBlush} />
        </G>
      ) : null}
      <Eyes shape={parts.eyes} />
      <Brows shape={parts.brows} />
      <Path d="M100 110 Q93 126 101 128" stroke={colors.faceStroke} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Mouth shape={parts.mouth} />
    </Svg>
  );
}

/** Crop regions used to preview a single face part (viewBox strings). */
const PART_VIEWBOX: Record<FacePartCategory, string> = {
  eyes: '50 80 100 40',
  brows: '50 52 100 40',
  mouth: '70 132 60 40',
};

type FacePartPreviewProps = {
  category: FacePartCategory;
  parts: FaceParts;
  width?: number;
};

/** Shows only one part of the face — used on Face Builder option buttons. */
export function FacePartPreview({ category, parts, width = 64 }: FacePartPreviewProps) {
  const [, , w, h] = PART_VIEWBOX[category].split(' ').map(Number);
  return (
    <Svg width={width} height={(width * h) / w} viewBox={PART_VIEWBOX[category]}>
      <Rect x={0} y={0} width={200} height={200} fill={illustrationPalette.skinTones[0]} />
      {category === 'eyes' ? <Eyes shape={parts.eyes} /> : null}
      {category === 'brows' ? <Brows shape={parts.brows} /> : null}
      {category === 'mouth' ? <Mouth shape={parts.mouth} /> : null}
    </Svg>
  );
}
