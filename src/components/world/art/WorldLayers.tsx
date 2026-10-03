/**
 * Static scenery for the world map, split into parallax layers. All layers
 * share world coordinates (600 × 1000) and draw an extra 80 units on each side
 * so panning never reveals an edge.
 */
import { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { darken, lighten } from '@/utils/color';

import { Shade, useArtIds, type ArtIds } from './primitives';

export const WORLD = { width: 600, height: 1000, margin: 80 } as const;
export const LAYER_VIEWBOX = `${-WORLD.margin} 0 ${WORLD.width + WORLD.margin * 2} ${WORLD.height}`;

function VerticalGradient({ id, y1, y2, stops }: { id: string; y1: number; y2: number; stops: [number, string][] }) {
  return (
    <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={y1} x2={0} y2={y2}>
      {stops.map(([offset, color]) => (
        <Stop key={offset} offset={offset} stopColor={color} />
      ))}
    </LinearGradient>
  );
}

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

export function SkyLayer() {
  const ids = useArtIds('sky');
  return (
    <G>
      <Defs>
        <VerticalGradient
          id={ids.id('sky')}
          y1={0}
          y2={470}
          stops={[
            [0, '#3E9BF0'],
            [0.45, '#7CC7FA'],
            [0.8, '#C9EDFF'],
            [1, '#FFF1D2'],
          ]}
        />
        <RadialGradient id={ids.id('sun')} gradientUnits="userSpaceOnUse" cx={110} cy={196} r={200}>
          <Stop offset="0" stopColor="#FFF8D0" stopOpacity={0.95} />
          <Stop offset="0.25" stopColor="#FFF1B0" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#FFF1B0" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={-WORLD.margin} y={0} width={WORLD.width + WORLD.margin * 2} height={WORLD.height} fill={ids.url('sky')} />
      <Circle cx={110} cy={196} r={200} fill={ids.url('sun')} />
      <Circle cx={110} cy={196} r={32} fill="#FFF3B8" />
      <Circle cx={110} cy={196} r={24} fill="#FFFBE6" />
    </G>
  );
}

// ---------------------------------------------------------------------------
// Distant mountains
// ---------------------------------------------------------------------------

const PEAKS: [number, number][] = [
  [80, 226],
  [320, 216],
  [440, 230],
  [580, 236],
];

export function MountainLayer() {
  const ids = useArtIds('mtn');
  return (
    <G>
      <Defs>
        <VerticalGradient id={ids.id('far')} y1={210} y2={420} stops={[[0, '#AEBDF0'], [1, '#E6ECFC']]} />
        <VerticalGradient id={ids.id('near')} y1={280} y2={430} stops={[[0, '#93AAEA'], [1, '#D5DFF9']]} />
      </Defs>
      <Path
        d="M-80 300 L-30 254 L20 282 L80 226 L140 272 L200 240 L250 264 L320 216 L380 260 L440 230 L500 270 L580 236 L640 266 L680 250 L680 430 L-80 430Z"
        fill={ids.url('far')}
      />
      {PEAKS.map(([px, py]) => (
        <Path
          key={px}
          d={`M${px - 15} ${py + 15} L${px} ${py} L${px + 15} ${py + 14} L${px + 8} ${py + 11} L${px + 1} ${py + 17} L${px - 6} ${py + 11}Z`}
          fill="#FFFFFF"
          opacity={0.9}
        />
      ))}
      <Path
        d="M-80 332 C-30 302 20 290 70 308 C110 288 150 292 190 314 C230 302 260 306 290 320 C340 298 400 294 440 314 C480 296 530 292 580 310 C620 298 650 302 680 312 L680 440 L-80 440Z"
        fill={ids.url('near')}
      />
    </G>
  );
}

// ---------------------------------------------------------------------------
// Hills with the castle and a distant village
// ---------------------------------------------------------------------------

function Tower({
  x,
  top,
  width,
  bottom,
  roofHeight,
  flag,
  ids,
}: {
  x: number;
  top: number;
  width: number;
  bottom: number;
  roofHeight: number;
  flag?: string;
  ids: ArtIds;
}) {
  const mid = x + width / 2;
  const peak = top - roofHeight;
  return (
    <G>
      <Rect x={x} y={top} width={width} height={bottom - top} fill={ids.url('wall')} />
      <Rect x={x + width * 0.7} y={top} width={width * 0.3} height={bottom - top} fill="#CFC3F0" opacity={0.75} />
      {flag ? (
        <G>
          <Path d={`M${mid} ${peak} L${mid} ${peak - 13}`} stroke="#6A6390" strokeWidth={1.5} />
          <Path d={`M${mid} ${peak - 13} L${mid + 11} ${peak - 9} L${mid} ${peak - 5}Z`} fill={flag} />
        </G>
      ) : null}
      <Path d={`M${x - 4} ${top + 2} L${mid} ${peak} L${x + width + 4} ${top + 2}Z`} fill={ids.url('roof')} />
      <Path d={`M${mid} ${peak} L${x + width + 4} ${top + 2} L${mid + 2} ${top + 2}Z`} fill="#4B55C9" opacity={0.5} />
      <Path
        d={`M${mid - 3.5} ${top + 24} L${mid - 3.5} ${top + 15} Q${mid} ${top + 10} ${mid + 3.5} ${top + 15} L${mid + 3.5} ${top + 24}Z`}
        fill="#5B4FB5"
      />
      <Circle cx={mid} cy={top + 19} r={1.6} fill="#FFE08A" />
    </G>
  );
}

function Castle({ ids }: { ids: ArtIds }) {
  const merlons = Array.from({ length: 13 }, (_, index) => 224 + index * 12);
  return (
    <G>
      <Tower x={289} top={222} width={22} bottom={330} roofHeight={46} flag="#FF5C8A" ids={ids} />
      <Tower x={246} top={252} width={22} bottom={344} roofHeight={36} flag="#FFC83D" ids={ids} />
      <Tower x={332} top={248} width={22} bottom={344} roofHeight={38} flag="#FFC83D" ids={ids} />
      <Rect x={262} y={272} width={76} height={74} fill={ids.url('wall')} />
      <Path d="M256 276 L300 246 L344 276Z" fill={ids.url('roof')} />
      <Path d="M300 246 L344 276 L300 276Z" fill="#4B55C9" opacity={0.45} />
      {[274, 296, 318].map((x) => (
        <Path key={x} d={`M${x} 304 L${x} 292 Q${x + 4} 286 ${x + 8} 292 L${x + 8} 304Z`} fill="#5B4FB5" />
      ))}
      <Rect x={222} y={314} width={156} height={44} fill={ids.url('wall')} />
      {merlons.map((x) => (
        <Rect key={x} x={x} y={306} width={7} height={9} fill={ids.url('wall')} />
      ))}
      <Path d="M286 358 L286 338 Q300 322 314 338 L314 358Z" fill="#5B4FB5" />
      <Path d="M292 334 L292 358 M300 330 L300 358 M308 334 L308 358 M287 344 L313 344" stroke="#8C80D8" strokeWidth={1.4} />
      <Path d="M250 318 L262 318 L262 336 L256 332 L250 336Z M338 318 L350 318 L350 336 L344 332 L338 336Z" fill="#FF7AA8" />
      <Tower x={210} top={298} width={20} bottom={360} roofHeight={26} ids={ids} />
      <Tower x={370} top={298} width={20} bottom={360} roofHeight={26} ids={ids} />
    </G>
  );
}

const VILLAGE: [number, number, string][] = [
  [30, 394, '#FF6B6B'],
  [58, 400, '#FF9F1C'],
  [86, 390, '#FF6B8B'],
  [470, 386, '#FF6B6B'],
  [500, 394, '#4C7DFF'],
  [532, 388, '#FF9F1C'],
];

const HILL_TREES: [number, number, number][] = [
  [-40, 400, 9],
  [8, 388, 8],
  [120, 384, 9],
  [150, 392, 7],
  [196, 382, 8],
  [410, 380, 8],
  [440, 372, 9],
  [570, 380, 9],
  [610, 392, 8],
  [650, 386, 9],
  [-20, 432, 11],
  [60, 426, 10],
  [180, 428, 11],
  [240, 432, 9],
  [370, 426, 10],
  [420, 422, 11],
  [520, 420, 10],
  [600, 428, 11],
];

export function HillsLayer() {
  const ids = useArtIds('hill');
  return (
    <G>
      <Defs>
        <VerticalGradient id={ids.id('back')} y1={356} y2={520} stops={[[0, '#AEE08C'], [1, '#86CC68']]} />
        <VerticalGradient id={ids.id('front')} y1={404} y2={540} stops={[[0, '#9AD878'], [1, '#6CBF55']]} />
        <VerticalGradient id={ids.id('castleHill')} y1={320} y2={392} stops={[[0, '#B4E2A4'], [1, '#97D584']]} />
        <Shade id={ids.id('wall')} color="#F1ECFD" light={0.3} dark={0.06} />
        <Shade id={ids.id('roof')} color="#6C7CF0" light={0.25} dark={0.15} direction="diag" />
      </Defs>
      <Path
        d="M-80 404 C0 366 90 368 170 388 C200 376 220 368 240 364 C300 352 360 354 410 382 C480 360 560 364 680 392 L680 640 L-80 640Z"
        fill={ids.url('back')}
      />
      <Path d="M168 392 C214 330 386 330 432 392Z" fill={ids.url('castleHill')} />
      <Castle ids={ids} />
      {VILLAGE.map(([x, y, roof]) => (
        <G key={x}>
          <Rect x={x - 9} y={y - 8} width={18} height={12} fill="#FFF3E2" />
          <Path d={`M${x - 12} ${y - 7} L${x} ${y - 18} L${x + 12} ${y - 7}Z`} fill={roof} />
          <Rect x={x - 2} y={y - 4} width={4} height={8} fill="#B5653A" />
        </G>
      ))}
      <Path
        d="M-80 436 C40 410 140 418 230 428 C330 414 470 408 680 432 L680 640 L-80 640Z"
        fill={ids.url('front')}
      />
      <Path d="M300 446 C318 428 284 412 300 394 C310 384 298 372 300 360" stroke="#F3E2BC" strokeWidth={7} strokeLinecap="round" fill="none" />
      {HILL_TREES.map(([x, y, r]) => (
        <G key={`${x}-${y}`}>
          <Rect x={x - 1.5} y={y} width={3} height={r * 0.8} fill="#7A4A2A" />
          <Circle cx={x} cy={y - r * 0.3} r={r} fill="#4FA84A" />
          <Circle cx={x - r * 0.3} cy={y - r * 0.6} r={r * 0.45} fill="#7CCB62" opacity={0.7} />
        </G>
      ))}
    </G>
  );
}

// ---------------------------------------------------------------------------
// Town ground: river, bridge, grass, paths and plaza
// ---------------------------------------------------------------------------

const PATH_FILL = '#F7E2B5';
const PATH_EDGE = '#DDBB86';

const PATH_SHAPES = [
  'M206 1000 C236 900 258 820 264 744 L336 744 C342 820 364 900 394 1000Z',
  'M274 670 L284 560 L289 494 L311 494 L316 560 L326 670Z',
];

const PATH_STROKES: [string, number][] = [
  ['M232 716 C200 716 160 706 142 684', 30],
  ['M366 702 C400 694 432 682 446 658', 30],
  ['M352 744 C390 770 424 808 438 852', 34],
];

const STONES: [number, number][] = [
  [292, 960],
  [324, 922],
  [270, 890],
  [310, 850],
  [286, 812],
  [318, 780],
  [298, 610],
  [306, 540],
  [150, 700],
  [190, 712],
  [420, 690],
  [400, 772],
  [430, 815],
  [226, 760],
  [372, 760],
  [250, 676],
  [350, 676],
];

const GRASS_PATCHES: [number, number, number][] = [
  [80, 560, 40],
  [520, 560, 36],
  [60, 860, 50],
  [540, 920, 44],
  [170, 920, 30],
  [430, 960, 34],
  [180, 560, 26],
  [420, 560, 28],
];

const TUFTS: [number, number][] = [
  [40, 520],
  [120, 600],
  [210, 620],
  [380, 610],
  [560, 640],
  [520, 780],
  [80, 760],
  [150, 860],
  [460, 900],
  [560, 860],
  [30, 940],
  [230, 960],
  [370, 980],
  [580, 520],
];

const FLOWER_BEDS: [number, number][] = [
  [184, 776],
  [416, 776],
  [212, 650],
  [390, 650],
];

const BANK_BUSHES = Array.from({ length: 30 }, (_, index) => -70 + index * 25).filter((x) => x < 262 || x > 340);

export function TownGroundLayer() {
  const ids = useArtIds('town');
  return (
    <G>
      <Defs>
        <VerticalGradient
          id={ids.id('grass')}
          y1={470}
          y2={1000}
          stops={[
            [0, '#A6E276'],
            [0.5, '#76C955'],
            [1, '#56B443'],
          ]}
        />
        <VerticalGradient id={ids.id('water')} y1={444} y2={496} stops={[[0, '#8EDCFA'], [1, '#3C9FE0']]} />
        <RadialGradient id={ids.id('plaza')} cx="45%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#FFF3D6" />
          <Stop offset="1" stopColor={PATH_FILL} />
        </RadialGradient>
      </Defs>

      {/* far bank with a hedge */}
      <Path d="M-80 440 C60 428 170 452 300 442 C430 432 540 454 680 440 L680 472 L-80 472Z" fill="#86CF62" />
      {BANK_BUSHES.map((x, index) => (
        <G key={x}>
          <Circle cx={x} cy={444 + (index % 3) * 2} r={11 + (index % 2) * 3} fill="#5DAE4A" />
          <Circle cx={x - 3} cy={440 + (index % 3) * 2} r={5} fill="#86CF62" opacity={0.7} />
        </G>
      ))}

      {/* river */}
      <Path
        d="M-80 452 C60 440 170 466 300 456 C430 446 540 468 680 452 L680 488 C540 502 430 480 300 492 C170 502 60 478 -80 490Z"
        fill={ids.url('water')}
      />
      {[
        'M-40 466 q14 -4 28 0',
        'M60 472 q12 -4 24 0',
        'M150 478 q14 -4 28 0',
        'M400 470 q14 -4 28 0',
        'M500 476 q12 -4 24 0',
        'M590 466 q14 -4 28 0',
      ].map((d) => (
        <Path key={d} d={d} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.7} />
      ))}

      {/* grass */}
      <Path d="M-80 484 C60 474 170 498 300 488 C430 478 540 500 680 484 L680 1000 L-80 1000Z" fill={ids.url('grass')} />
      <Path d="M-80 484 C60 474 170 498 300 488 C430 478 540 500 680 484" stroke="#5FB84A" strokeWidth={4} fill="none" />
      {GRASS_PATCHES.map(([cx, cy, r]) => (
        <Ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.35} fill="#C2EE96" opacity={0.35} />
      ))}
      {TUFTS.map(([x, y]) => (
        <Path key={`${x}-${y}`} d={`M${x - 6} ${y} L${x - 3} ${y - 8} L${x} ${y} L${x + 3} ${y - 9} L${x + 6} ${y}`} stroke="#4C9F3C" strokeWidth={2} fill="none" strokeLinejoin="round" />
      ))}

      {/* bridge */}
      <Path d="M272 436 L328 436 L336 498 L264 498Z" fill={PATH_FILL} />
      <Path d="M264 434 L273 434 L266 500 L256 500Z" fill="#D9CDB5" />
      <Path d="M327 434 L336 434 L344 500 L334 500Z" fill="#C9BCA2" />
      <Path d="M264 434 L273 434 M327 434 L336 434" stroke="#F2EBDD" strokeWidth={2} />

      {/* paths: an edge stroke first, then the fill */}
      {PATH_STROKES.map(([d, width]) => (
        <Path key={`e${d}`} d={d} stroke={PATH_EDGE} strokeWidth={width + 6} strokeLinecap="round" fill="none" />
      ))}
      {PATH_SHAPES.map((d) => (
        <Path key={`e${d}`} d={d} fill={PATH_FILL} stroke={PATH_EDGE} strokeWidth={6} strokeLinejoin="round" />
      ))}
      {PATH_STROKES.map(([d, width]) => (
        <Path key={d} d={d} stroke={PATH_FILL} strokeWidth={width} strokeLinecap="round" fill="none" />
      ))}
      {PATH_SHAPES.map((d) => (
        <Path key={d} d={d} fill={PATH_FILL} />
      ))}
      <Ellipse cx={300} cy={712} rx={134} ry={56} fill={ids.url('plaza')} stroke={PATH_EDGE} strokeWidth={6} />
      <Ellipse cx={300} cy={712} rx={104} ry={43} fill="none" stroke="#EBCB91" strokeWidth={3} />
      <Ellipse cx={300} cy={712} rx={78} ry={32} fill="none" stroke="#F2D8A6" strokeWidth={2.5} />
      {STONES.map(([cx, cy]) => (
        <Ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={7} ry={3.2} fill={darken(PATH_FILL, 0.08)} opacity={0.75} />
      ))}

      {/* flower beds around the plaza */}
      {FLOWER_BEDS.map(([cx, cy], bed) => (
        <G key={`${cx}-${cy}`}>
          <Ellipse cx={cx} cy={cy} rx={26} ry={9} fill="#4FA63E" />
          {[-16, -8, 0, 8, 16, -12, 4, 12].map((dx, index) => (
            <Circle
              key={index}
              cx={cx + dx}
              cy={cy - 2 + (index > 4 ? -4 : 0)}
              r={3.2}
              fill={['#FF5C8A', '#FFD43B', '#FFFFFF', '#B48CFF'][(index + bed) % 4]}
            />
          ))}
        </G>
      ))}
    </G>
  );
}

// ---------------------------------------------------------------------------
// Foreground framing (moves faster than the town for depth)
// ---------------------------------------------------------------------------

const FRONT_LEAVES: [number, number, number][] = [
  [-40, 980, 56],
  [30, 1004, 44],
  [96, 1010, 34],
  [-10, 930, 30],
  [560, 1000, 50],
  [630, 970, 48],
  [500, 1016, 34],
  [640, 918, 28],
];

export function ForegroundLayer() {
  const ids = useArtIds('front');
  const leaf = '#3FA548';
  return (
    <G>
      <Defs>
        <RadialGradient id={ids.id('leaf')} cx="40%" cy="30%" r="75%">
          <Stop offset="0" stopColor={lighten(leaf, 0.35)} />
          <Stop offset="1" stopColor={darken(leaf, 0.35)} />
        </RadialGradient>
      </Defs>
      {FRONT_LEAVES.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ids.url('leaf')} />
      ))}
      {[
        [10, 950],
        [60, 968],
        [120, 990],
        [540, 966],
        [600, 944],
        [470, 992],
      ].map(([cx, cy], index) => (
        <G key={`${cx}-${cy}`}>
          <Circle cx={cx} cy={cy} r={5} fill={['#FF5C8A', '#FFD43B', '#FFFFFF'][index % 3]} />
          <Circle cx={cx} cy={cy} r={1.8} fill="#FFB800" />
        </G>
      ))}
    </G>
  );
}
