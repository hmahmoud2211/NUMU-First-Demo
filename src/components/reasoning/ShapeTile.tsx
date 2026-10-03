import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { SHAPE_COLORS, type Tile } from '@/data/reasoningCheck';
import { gameColors, gameFonts, gameShadow } from '@/theme';

function starPoints(cx: number, cy: number, rOut: number, rIn: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? rOut : rIn;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function SingleShape({
  shape,
  colorHex,
  cx,
  cy,
  radius,
}: {
  shape: Tile['shape'];
  colorHex: string;
  cx: number;
  cy: number;
  radius: number;
}) {
  if (shape === 'circle') {
    return <Circle cx={cx} cy={cy} r={radius} fill={colorHex} />;
  }
  if (shape === 'square') {
    const side = radius * 1.7;
    return (
      <Rect
        x={cx - side / 2}
        y={cy - side / 2}
        width={side}
        height={side}
        rx={Math.max(4, radius * 0.25)}
        fill={colorHex}
      />
    );
  }
  if (shape === 'triangle') {
    const top = `${cx},${cy - radius}`;
    const bRight = `${cx + radius * 0.95},${cy + radius * 0.7}`;
    const bLeft = `${cx - radius * 0.95},${cy + radius * 0.7}`;
    return <Polygon points={`${top} ${bRight} ${bLeft}`} fill={colorHex} />;
  }
  if (shape === 'star') {
    return <Polygon points={starPoints(cx, cy, radius, radius * 0.45)} fill={colorHex} />;
  }
  return null;
}

export function ShapeTile({
  tile,
  size = 64,
  highlight = false,
}: {
  tile: Tile | null;
  size?: number;
  highlight?: boolean;
}) {
  if (!tile) {
    return (
      <View
        style={[
          styles.emptySlot,
          { width: size, height: size, borderRadius: size * 0.22 },
        ]}
      >
        <Text style={[styles.questionMark, { fontSize: size * 0.45 }]}>?</Text>
      </View>
    );
  }

  const count = tile.count ?? 1;
  const colorHex = SHAPE_COLORS[tile.color];
  const isSmall = tile.small ?? false;
  const baseRadius = size * (isSmall ? 0.16 : 0.35);

  let positions: { cx: number; cy: number; r: number }[] = [];

  if (count === 1) {
    positions = [{ cx: size / 2, cy: size / 2, r: baseRadius }];
  } else if (count === 2) {
    const r = baseRadius * 0.85;
    positions = [
      { cx: size * 0.32, cy: size / 2, r },
      { cx: size * 0.68, cy: size / 2, r },
    ];
  } else if (count === 3) {
    const r = baseRadius * 0.75;
    positions = [
      { cx: size / 2, cy: size * 0.32, r },
      { cx: size * 0.3, cy: size * 0.68, r },
      { cx: size * 0.7, cy: size * 0.68, r },
    ];
  } else if (count === 4) {
    const r = baseRadius * 0.7;
    positions = [
      { cx: size * 0.32, cy: size * 0.32, r },
      { cx: size * 0.68, cy: size * 0.32, r },
      { cx: size * 0.32, cy: size * 0.68, r },
      { cx: size * 0.68, cy: size * 0.68, r },
    ];
  } else if (count === 5) {
    const r = baseRadius * 0.62;
    positions = [
      { cx: size * 0.28, cy: size * 0.28, r },
      { cx: size * 0.72, cy: size * 0.28, r },
      { cx: size / 2, cy: size / 2, r },
      { cx: size * 0.28, cy: size * 0.72, r },
      { cx: size * 0.72, cy: size * 0.72, r },
    ];
  } else {
    positions = [{ cx: size / 2, cy: size / 2, r: baseRadius }];
  }

  return (
    <View
      style={[
        styles.tile,
        highlight && styles.tileHighlight,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {positions.map((pos, idx) => (
          <SingleShape
            key={idx}
            shape={tile.shape}
            colorHex={colorHex}
            cx={pos.cx}
            cy={pos.cy}
            radius={pos.r}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: gameColors.white,
    borderWidth: 2,
    borderColor: gameColors.cardEdge,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...gameShadow.soft,
  },
  tileHighlight: {
    borderColor: gameColors.green,
    borderBottomColor: gameColors.greenEdge,
    backgroundColor: '#F0FDF4',
  },
  emptySlot: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(91, 108, 255, 0.45)',
    backgroundColor: 'rgba(233, 235, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontFamily: gameFonts.bold,
    color: gameColors.primary,
  },
});
