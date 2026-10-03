/**
 * The child avatar and the other children in the world. One rig, many looks:
 * skin, hair style, clothes, expression, pose and any equipped rewards.
 * Drawn in a 160 × 200 box with the feet at (80, 192).
 */
import { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Equipment } from '@/types/world';
import { darken, lighten } from '@/utils/color';

import { Ball, GroundShadow, Shade, useArtIds, type ArtIds } from './primitives';

export type HairStyle = 'short' | 'ponytail' | 'curly' | 'bob';

export type KidLook = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  bottom: 'shorts' | 'skirt';
  bottomColor: string;
  shoes: string;
  emblem?: 'star' | 'heart' | 'none';
};

export type Expression = 'happy' | 'excited' | 'calm' | 'sad' | 'angry' | 'worried' | 'surprised' | 'thinking';

export type Pose = 'rest' | 'wave' | 'cheer';

export const KID_VIEW = { width: 160, height: 200, viewBox: '0 0 160 200' } as const;

/** Shows only the head, for profile badges. */
export const KID_HEAD_VIEWBOX = '30 6 100 100';

export const PLAYER_LOOK: KidLook = {
  skin: '#F2C29B',
  hair: '#4A2C1C',
  hairStyle: 'short',
  shirt: '#38A6F5',
  bottom: 'shorts',
  bottomColor: '#2F3C8F',
  shoes: '#FF5A5F',
  emblem: 'star',
};

export const FRIEND_LOOKS = {
  mia: {
    skin: '#C98E62',
    hair: '#2A1A12',
    hairStyle: 'ponytail',
    shirt: '#FF7AA8',
    bottom: 'skirt',
    bottomColor: '#7B5CFF',
    shoes: '#FFFFFF',
    emblem: 'heart',
  },
  leo: {
    skin: '#F7D5B5',
    hair: '#E3A33F',
    hairStyle: 'short',
    shirt: '#FFB020',
    bottom: 'shorts',
    bottomColor: '#3366CC',
    shoes: '#3CCB7F',
    emblem: 'none',
  },
  sam: {
    skin: '#8D5A3B',
    hair: '#1F1512',
    hairStyle: 'curly',
    shirt: '#22B8A7',
    bottom: 'shorts',
    bottomColor: '#4B3A8C',
    shoes: '#FF9F1C',
    emblem: 'star',
  },
  zara: {
    skin: '#E8B48A',
    hair: '#7A3A1A',
    hairStyle: 'bob',
    shirt: '#9B5CFF',
    bottom: 'skirt',
    bottomColor: '#FF8A3D',
    shoes: '#FF5C8A',
    emblem: 'none',
  },
} satisfies Record<string, KidLook>;

export type FriendId = keyof typeof FRIEND_LOOKS;

const INK = '#2A1A14';
const MOUTH = '#8E2C3B';
const TONGUE = '#FF7A8A';

export function starPath(cx: number, cy: number, outer: number, inner = outer * 0.48): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join(' L')}Z`;
}

export function heartPath(cx: number, cy: number, size: number): string {
  const s = size / 10;
  return `M${cx} ${cy + 4 * s} C${cx - 9 * s} ${cy - 2 * s} ${cx - 5 * s} ${cy - 9 * s} ${cx} ${cy - 5 * s} C${cx + 5 * s} ${cy - 9 * s} ${cx + 9 * s} ${cy - 2 * s} ${cx} ${cy + 4 * s}Z`;
}

type EyeKind = 'open' | 'wide' | 'narrowed' | 'happyClosed' | 'relaxed' | 'blink';
type BrowKind = 'neutral' | 'raised' | 'sad' | 'angry';
type MouthKind = 'smile' | 'grin' | 'calm' | 'frown' | 'angry' | 'wavy' | 'o' | 'side';

const EXPRESSIONS: Record<Expression, { eyes: EyeKind; brows: BrowKind; mouth: MouthKind; tear?: boolean; sweat?: boolean }> = {
  happy: { eyes: 'open', brows: 'neutral', mouth: 'smile' },
  excited: { eyes: 'happyClosed', brows: 'raised', mouth: 'grin' },
  calm: { eyes: 'relaxed', brows: 'neutral', mouth: 'calm' },
  sad: { eyes: 'open', brows: 'sad', mouth: 'frown', tear: true },
  angry: { eyes: 'narrowed', brows: 'angry', mouth: 'angry' },
  worried: { eyes: 'open', brows: 'sad', mouth: 'wavy', sweat: true },
  surprised: { eyes: 'wide', brows: 'raised', mouth: 'o' },
  thinking: { eyes: 'open', brows: 'raised', mouth: 'side' },
};

// Brow strokes for the left eye; the right brow is mirrored around x = 80.
const BROWS: Record<BrowKind, [number, number, number, number, number, number]> = {
  neutral: [59, 54, 66, 50, 73, 53],
  raised: [59, 50, 66, 45, 73, 49],
  sad: [59, 54, 67, 52, 73, 48],
  angry: [59, 50, 67, 52, 73, 57],
};

const EYE_Y = 68;

function Eye({ cx, kind, side, ids }: { cx: number; kind: EyeKind; side: 'left' | 'right'; ids: ArtIds }) {
  const stroke = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round' as const, fill: 'none' };
  if (kind === 'happyClosed') return <Path d={`M${cx - 7} ${EYE_Y + 2} Q${cx} ${EYE_Y - 6} ${cx + 7} ${EYE_Y + 2}`} {...stroke} />;
  if (kind === 'relaxed') return <Path d={`M${cx - 7} ${EYE_Y - 1} Q${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y - 1}`} {...stroke} />;
  if (kind === 'blink') return <Path d={`M${cx - 6.5} ${EYE_Y + 1} Q${cx} ${EYE_Y + 3.5} ${cx + 6.5} ${EYE_Y + 1}`} {...stroke} />;
  const wide = kind === 'wide';
  const inner = side === 'left' ? 1 : -1;
  return (
    <G>
      <Ellipse cx={cx} cy={EYE_Y} rx={wide ? 7.8 : 6.8} ry={wide ? 9.8 : 8.6} fill={ids.url('eye')} />
      <Circle cx={cx - 2.4} cy={EYE_Y - 3.6} r={wide ? 3.3 : 2.8} fill="#FFFFFF" />
      <Circle cx={cx + 2.3} cy={EYE_Y + 3.4} r={1.3} fill="#FFFFFF" opacity={0.85} />
      {kind === 'narrowed' ? (
        <Path
          d={`M${cx - 9 * inner} ${EYE_Y - 12} L${cx + 9 * inner} ${EYE_Y - 12} L${cx + 9 * inner} ${EYE_Y - 1} L${cx - 9 * inner} ${EYE_Y - 6}Z`}
          fill={ids.url('skin')}
        />
      ) : null}
    </G>
  );
}

function Brow({ kind, side, color }: { kind: BrowKind; side: 'left' | 'right'; color: string }) {
  const [x1, y1, cx, cy, x2, y2] = BROWS[kind];
  const m = (x: number) => (side === 'left' ? x : 160 - x);
  return (
    <Path
      d={`M${m(x1)} ${y1} Q${m(cx)} ${cy} ${m(x2)} ${y2}`}
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Mouth({ kind }: { kind: MouthKind }) {
  const line = { stroke: MOUTH, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };
  switch (kind) {
    case 'smile':
      return (
        <G>
          <Path d="M69 85 Q80 97 91 85 Q80 89 69 85Z" fill={MOUTH} />
          <Path d="M74 90.5 Q80 95.5 86 90.5 Q80 88.5 74 90.5Z" fill={TONGUE} />
        </G>
      );
    case 'grin':
      return (
        <G>
          <Path d="M66 83 Q80 102 94 83 Q80 88 66 83Z" fill={MOUTH} />
          <Path d="M68 84 Q80 88.5 92 84 L91.2 86.4 Q80 90.6 68.8 86.4Z" fill="#FFFFFF" />
          <Path d="M72 93 Q80 99.5 88 93 Q80 90 72 93Z" fill={TONGUE} />
        </G>
      );
    case 'calm':
      return <Path d="M71 87 Q80 93 89 87" {...line} />;
    case 'frown':
      return <Path d="M71 92 Q80 85 89 92" {...line} />;
    case 'angry':
      return <Path d="M70 91 Q80 86 90 91" {...line} strokeWidth={3.6} />;
    case 'wavy':
      return <Path d="M69 90 Q72.5 87 76 90 Q80 93 84 90 Q87.5 87 91 90" {...line} />;
    case 'o':
      return (
        <G>
          <Ellipse cx={80} cy={90} rx={5.2} ry={6.6} fill={MOUTH} />
          <Ellipse cx={80} cy={93.5} rx={3} ry={2} fill={TONGUE} />
        </G>
      );
    case 'side':
      return <Path d="M73 90 Q81 89 88 86" {...line} />;
  }
}

function HairBack({ look, ids }: { look: KidLook; ids: ArtIds }) {
  const fill = ids.url('hair');
  switch (look.hairStyle) {
    case 'bob':
      return <Path d="M34 70 C30 30 52 11 80 11 C108 11 130 30 126 70 C126 86 121 95 113 97 L47 97 C39 95 34 86 34 70Z" fill={fill} />;
    case 'ponytail':
      return (
        <G>
          <Path d="M114 34 C138 30 150 52 144 76 C140 92 128 100 122 94 C132 80 132 58 116 46Z" fill={fill} />
          <Path d="M38 64 C34 30 54 11 80 11 C106 11 126 30 122 64Z" fill={fill} />
          <Circle cx={117} cy={40} r={5.5} fill="#FF5C8A" />
          <Circle cx={115.5} cy={38.5} r={1.8} fill="#FFFFFF" opacity={0.6} />
        </G>
      );
    case 'curly':
      return (
        <G>
          {[
            [42, 56, 14],
            [48, 36, 15],
            [62, 22, 15],
            [80, 17, 16],
            [98, 22, 15],
            [112, 36, 15],
            [118, 56, 14],
            [36, 70, 9],
            [124, 70, 9],
          ].map(([cx, cy, r]) => (
            <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} />
          ))}
        </G>
      );
    default:
      return null;
  }
}

function HairFront({ look, ids }: { look: KidLook; ids: ArtIds }) {
  const fill = ids.url('hair');
  const shine = lighten(look.hair, 0.4);
  switch (look.hairStyle) {
    case 'short':
      return (
        <G>
          <Path
            d="M37 62 C33 32 52 13 81 13 C110 13 127 31 123 61 C121 52 117 45 111 40 C104 46 92 47 81 43 C70 47 58 47 50 39 C44 46 40 54 37 62Z"
            fill={fill}
          />
          <Path d="M55 24 C66 17 86 16 99 21" stroke={shine} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55} />
        </G>
      );
    case 'curly':
      return (
        <G>
          {[
            [50, 40, 9],
            [62, 33, 9.5],
            [76, 30, 9.5],
            [90, 31, 9.5],
            [103, 35, 9],
            [112, 44, 8],
            [44, 50, 7],
          ].map(([cx, cy, r]) => (
            <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} />
          ))}
          <Path d="M58 27 C66 22 80 21 90 24" stroke={shine} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.45} />
        </G>
      );
    default:
      return (
        <G>
          <Path
            d="M39 60 C39 30 58 15 80 15 C102 15 121 30 121 60 C114 48 102 41 92 44 C86 38 74 38 68 44 C58 41 46 47 39 60Z"
            fill={fill}
          />
          <Path d="M56 25 C66 18 86 17 100 23" stroke={shine} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.5} />
        </G>
      );
  }
}

function Arm({ side, angle, look, ids }: { side: 'left' | 'right'; angle: number; look: KidLook; ids: ArtIds }) {
  const m = (x: number) => (side === 'left' ? x : 160 - x);
  const shoulderX = m(59);
  return (
    <G transform={`rotate(${angle} ${shoulderX} 108)`}>
      <Path d={`M${m(52)} 116 L${m(50.5)} 133`} stroke={darken(look.skin, 0.06)} strokeWidth={9.5} strokeLinecap="round" />
      <Path d={`M${m(59)} 107 Q${m(53.5)} 110 ${m(52)} 117`} stroke={ids.url('shirt')} strokeWidth={13} strokeLinecap="round" fill="none" />
      <Circle cx={m(50.5)} cy={137} r={6.6} fill={ids.url('skin')} />
    </G>
  );
}

const POSES: Record<Pose, { left: number; right: number }> = {
  rest: { left: 0, right: 0 },
  wave: { left: 0, right: -125 },
  cheer: { left: 115, right: -115 },
};

function Backpack({ ids }: { ids: ArtIds }) {
  return (
    <Path
      d="M46 108 C46 101 52 98 60 98 L100 98 C108 98 114 101 114 108 L116 141 C116 147 110 149 102 149 L58 149 C50 149 44 147 44 141Z"
      fill={ids.url('pack')}
    />
  );
}

function Bike() {
  const frame = '#FF4D5E';
  const tire = '#2C2A4A';
  return (
    <G>
      {[34, 126].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={170} r={21} stroke={tire} strokeWidth={5} fill="none" />
          <Circle cx={cx} cy={170} r={17} stroke="#C9CCE0" strokeWidth={1.5} fill="none" />
          {[0, 45, 90, 135].map((deg) => (
            <Line
              key={deg}
              x1={cx + 16 * Math.cos((deg * Math.PI) / 180)}
              y1={170 + 16 * Math.sin((deg * Math.PI) / 180)}
              x2={cx - 16 * Math.cos((deg * Math.PI) / 180)}
              y2={170 - 16 * Math.sin((deg * Math.PI) / 180)}
              stroke="#C9CCE0"
              strokeWidth={1.2}
            />
          ))}
          <Circle cx={cx} cy={170} r={3} fill="#8C8FB0" />
        </G>
      ))}
      <Path
        d="M34 170 L60 136 L104 136 L126 170 M60 136 L80 170 L104 136 M34 170 L80 170"
        stroke={frame}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M60 131 L60 137" stroke={tire} strokeWidth={4} />
      <Path d="M50 128 L70 128" stroke={tire} strokeWidth={6} strokeLinecap="round" />
      <Path d="M104 136 L110 120 M103 118 L119 118" stroke={tire} strokeWidth={4.5} strokeLinecap="round" />
    </G>
  );
}

function Skateboard() {
  return (
    <G>
      <Path
        d="M28 189 C24 185 28 181 35 181 L125 181 C132 181 136 185 132 189 C130 191 126 193 121 193 L39 193 C34 193 30 191 28 189Z"
        fill="#7B5CFF"
      />
      <Path d="M36 183.5 L124 183.5" stroke="#B9A6FF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      <Path d={starPath(80, 187, 4)} fill="#FFD23F" />
      {[46, 114].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={195.5} r={4.5} fill="#FFD23F" />
          <Circle cx={cx} cy={195.5} r={1.6} fill="#5A4A1A" />
        </G>
      ))}
    </G>
  );
}

function HeadGear({ item, ids }: { item: Equipment['head']; ids: ArtIds }) {
  if (item === 'cap') {
    return (
      <G>
        <Path d="M41 55 C41 27 59 14 80 14 C101 14 119 27 119 55 C107 49 94 47 80 47 C66 47 53 49 41 55Z" fill={ids.url('cap')} />
        <Path d="M80 16 C77 27 75 37 75 48" stroke="#B3122A" strokeWidth={1.3} fill="none" opacity={0.5} />
        <Path d="M43 53 C31 54 21 60 24 65 C38 63 58 55 84 49 C70 46 55 48 43 53Z" fill="#C8102E" />
        <Circle cx={80} cy={15} r={3.3} fill="#C8102E" />
        <Path d={starPath(99, 33, 6)} fill="#FFFFFF" />
      </G>
    );
  }
  if (item === 'crown') {
    return (
      <G>
        <Path d="M55 36 L57 12 L68 24 L80 6 L92 24 L103 12 L105 36Z" fill={ids.url('gold')} />
        <Rect x={54} y={30} width={52} height={10} rx={4} fill="#E59A00" />
        <Circle cx={80} cy={35} r={3.6} fill="#FF4D6D" />
        <Circle cx={66} cy={35} r={2.6} fill="#38B0FF" />
        <Circle cx={94} cy={35} r={2.6} fill="#3CCB7F" />
        {[
          [57, 12],
          [80, 6],
          [103, 12],
        ].map(([cx, cy]) => (
          <Circle key={cx} cx={cx} cy={cy} r={3.2} fill="#FFE58A" />
        ))}
      </G>
    );
  }
  if (item === 'headphones') {
    return (
      <G>
        <Path d="M38 66 C36 21 56 9 80 9 C104 9 124 21 122 66" stroke="#3D3B63" strokeWidth={7} fill="none" />
        <Path d="M44 40 C50 20 64 14 80 14" stroke="#7D7AA8" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Rect x={29} y={54} width={17} height={27} rx={8} fill={ids.url('phones')} />
        <Rect x={114} y={54} width={17} height={27} rx={8} fill={ids.url('phones')} />
      </G>
    );
  }
  return null;
}

function Sunglasses() {
  const frame = '#FF4D8A';
  return (
    <G>
      <Path d="M54 65 L42 63 M106 65 L118 63" stroke={frame} strokeWidth={2.6} strokeLinecap="round" />
      <Rect x={54} y={60} width={24} height={17} rx={7} fill="#1E2A4A" stroke={frame} strokeWidth={2.6} />
      <Rect x={82} y={60} width={24} height={17} rx={7} fill="#1E2A4A" stroke={frame} strokeWidth={2.6} />
      <Path d="M78 66 Q80 63 82 66" stroke={frame} strokeWidth={2.6} fill="none" />
      <Path d="M58 66 L63 62 M86 66 L91 62" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </G>
  );
}

function Scarf() {
  return (
    <G>
      <Path d="M88 108 L95 129 C96 131 94 133 92 133 L85 133 C83 133 82 131 82.5 129 L82 110Z" fill="#D92E45" />
      <Path d="M61 99 C70 107 90 107 99 99 L101 107 C91 116 69 116 59 107Z" fill="#FF4D5E" />
      <Path d="M67 104 L65 111 M75 106 L74 113 M86 106 L87 113 M94 104 L96 111" stroke="#FFFFFF" strokeWidth={2} opacity={0.75} />
    </G>
  );
}

type KidCharacterProps = {
  look: KidLook;
  expression?: Expression;
  pose?: Pose;
  blink?: boolean;
  equipped?: Equipment;
  shadow?: boolean;
};

/** An SVG group; place it inside an Svg using KID_VIEW.viewBox. */
export function KidCharacter({
  look,
  expression = 'happy',
  pose = 'rest',
  blink = false,
  equipped = {},
  shadow = true,
}: KidCharacterProps) {
  const ids = useArtIds('kid');
  const face = EXPRESSIONS[expression];
  const eyes: EyeKind = blink && face.eyes !== 'happyClosed' && face.eyes !== 'relaxed' ? 'blink' : face.eyes;
  const arms = POSES[pose];
  const ride = equipped.ride;
  const browColor = darken(look.hair, 0.15);
  const skinDark = darken(look.skin, 0.18);

  return (
    <G>
      <Defs>
        <RadialGradient id={ids.id('skin')} gradientUnits="userSpaceOnUse" cx={72} cy={52} r={62} fx={62} fy={40}>
          <Stop offset="0" stopColor={lighten(look.skin, 0.28)} />
          <Stop offset="0.55" stopColor={look.skin} />
          <Stop offset="1" stopColor={skinDark} />
        </RadialGradient>
        <RadialGradient id={ids.id('eye')} cx="50%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#6B4226" />
          <Stop offset="1" stopColor="#1E120C" />
        </RadialGradient>
        <Ball id={ids.id('hair')} color={look.hair} light={0.3} dark={0.3} />
        <Shade id={ids.id('shirt')} color={look.shirt} light={0.2} dark={0.22} direction="diag" />
        <Shade id={ids.id('bottom')} color={look.bottomColor} light={0.15} dark={0.25} />
        <Shade id={ids.id('shoe')} color={look.shoes} light={0.3} dark={0.25} />
        <Shade id={ids.id('pack')} color="#FFB300" light={0.3} dark={0.25} direction="diag" />
        <Ball id={ids.id('cap')} color="#FF3B4E" light={0.35} />
        <Shade id={ids.id('gold')} color="#FFC83D" light={0.45} dark={0.15} />
        <Shade id={ids.id('phones')} color="#22B8A7" light={0.35} dark={0.25} />
      </Defs>

      {shadow ? <GroundShadow cx={80} cy={193} rx={ride === 'bike' ? 66 : 36} ry={7} opacity={0.32} /> : null}
      {ride === 'bike' ? <Bike /> : null}
      {ride === 'skateboard' ? <Skateboard /> : null}

      <G transform={ride === 'skateboard' ? 'translate(0 -10)' : undefined}>
        {equipped.back === 'backpack' ? <Backpack ids={ids} /> : null}
        <HairBack look={look} ids={ids} />

        {/* legs, socks and shoes */}
        <Path d="M68 158 L68 181 M92 158 L92 181" stroke={ids.url('skin')} strokeWidth={11} strokeLinecap="round" />
        <Path d="M68 176 L68 181 M92 176 L92 181" stroke="#FFFFFF" strokeWidth={11.5} strokeLinecap="round" />
        <Path d="M57 186 C57 179 62 177 68 177 C74 177 79 180 79 186 C79 190 75 191 68 191 C61 191 57 190 57 186Z" fill={ids.url('shoe')} />
        <Path d="M81 186 C81 179 86 177 92 177 C98 177 103 180 103 186 C103 190 99 191 92 191 C85 191 81 190 81 186Z" fill={ids.url('shoe')} />
        <Path d="M57 187.5 C64 190.5 73 190.5 79 187.5 M81 187.5 C88 190.5 97 190.5 103 187.5" stroke="#FFFFFF" strokeWidth={2.4} fill="none" />

        {look.bottom === 'shorts' ? (
          <Path d="M56 139 L104 139 L106 160 C106 164 97 166 87 164 L83 152 L77 152 L73 164 C63 166 54 164 54 160Z" fill={ids.url('bottom')} />
        ) : (
          <G>
            <Path d="M56 139 L104 139 L113 166 C98 172 62 172 47 166Z" fill={ids.url('bottom')} />
            <Path d="M68 145 L64 168 M80 145 L80 170 M92 145 L96 168" stroke={darken(look.bottomColor, 0.2)} strokeWidth={1.5} opacity={0.5} />
          </G>
        )}

        {/* torso */}
        <Path
          d="M54 117 C54 107 64 101 80 101 C96 101 106 107 106 117 L108 143 C108 148 99 151 80 151 C61 151 52 148 52 143Z"
          fill={ids.url('shirt')}
        />
        <Path d="M71 102 Q80 109 89 102" stroke={darken(look.shirt, 0.25)} strokeWidth={2.5} fill="none" />
        {look.emblem === 'star' ? <Path d={starPath(80, 126, 8)} fill="#FFFFFF" opacity={0.92} /> : null}
        {look.emblem === 'heart' ? <Path d={heartPath(80, 126, 9)} fill="#FFFFFF" opacity={0.92} /> : null}
        {equipped.back === 'backpack' ? (
          <Path d="M66 103 C63 116 63 128 65 141 M94 103 C97 116 97 128 95 141" stroke="#D98200" strokeWidth={6} strokeLinecap="round" fill="none" />
        ) : null}
        {equipped.neck === 'scarf' ? <Scarf /> : null}
        <Ellipse cx={80} cy={103} rx={13} ry={4} fill={darken(look.shirt, 0.45)} opacity={0.22} />

        {/* head */}
        <Ellipse cx={40} cy={66} rx={7} ry={9} fill={ids.url('skin')} />
        <Ellipse cx={120} cy={66} rx={7} ry={9} fill={ids.url('skin')} />
        <Ellipse cx={120.5} cy={66} rx={3.5} ry={5} fill={skinDark} opacity={0.5} />
        <Ellipse cx={39.5} cy={66} rx={3.5} ry={5} fill={skinDark} opacity={0.5} />
        <Path d="M40 60 C40 31 58 20 80 20 C102 20 120 31 120 60 C120 86 103 100 80 100 C57 100 40 86 40 60Z" fill={ids.url('skin')} />
        <Ellipse cx={58} cy={81} rx={7.5} ry={4.5} fill="#FF6B81" opacity={0.35} />
        <Ellipse cx={102} cy={81} rx={7.5} ry={4.5} fill="#FF6B81" opacity={0.35} />
        <Eye cx={66} kind={eyes} side="left" ids={ids} />
        <Eye cx={94} kind={eyes} side="right" ids={ids} />
        <Brow kind={face.brows} side="left" color={browColor} />
        <Brow kind={face.brows} side="right" color={browColor} />
        <Path d="M77 78 Q80 81 83 78" stroke={darken(look.skin, 0.35)} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Mouth kind={face.mouth} />
        {face.tear ? (
          <G>
            <Path d="M61 78 C58 83 58 87 61 88 C64 87 64 83 61 78Z" fill="#7CC8FF" />
            <Circle cx={60.2} cy={84.5} r={0.9} fill="#FFFFFF" />
          </G>
        ) : null}
        {face.sweat ? <Path d="M122 40 C118 46 118 50 122 51 C126 50 126 46 122 40Z" fill="#8FD3FF" /> : null}

        <HairFront look={look} ids={ids} />
        <HeadGear item={equipped.head} ids={ids} />
        {equipped.face === 'sunglasses' ? <Sunglasses /> : null}

        <Arm side="left" angle={arms.left} look={look} ids={ids} />
        <Arm side="right" angle={arms.right} look={look} ids={ids} />
      </G>
    </G>
  );
}
