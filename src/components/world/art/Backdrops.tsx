/**
 * Full-screen scene backdrops for the mini-games. Drawn in screen pixels and
 * laid out around the scene's floor line, so they fit any phone or tablet.
 */
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { SceneSize } from '@/components/world/scene/SceneScreen';
import { darken, lighten } from '@/utils/color';

import { heartPath } from './KidCharacter';
import { Cloud, RoundTree } from './Nature';
import { PlaygroundArea } from './Buildings';
import { Glow, Shade, useArtIds, type ArtIds } from './primitives';

function unit(width: number): number {
  return Math.min(width / 390, 1.5);
}

function VGrad({ id, y1, y2, from, to }: { id: string; y1: number; y2: number; from: string; to: string }) {
  return (
    <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={y1} x2={0} y2={y2}>
      <Stop offset="0" stopColor={from} />
      <Stop offset="1" stopColor={to} />
    </LinearGradient>
  );
}

function WoodFloor({ ids, width, height, floorY, color = '#E3A170' }: { ids: ArtIds; width: number; height: number; floorY: number; color?: string }) {
  const rows = 12;
  return (
    <G>
      <Rect x={0} y={floorY} width={width} height={height - floorY} fill={ids.url('floor')} />
      {Array.from({ length: rows }, (_, index) => {
        const y = floorY + (height - floorY) * Math.pow((index + 1) / rows, 1.5);
        return <Path key={index} d={`M0 ${y} L${width} ${y}`} stroke={darken(color, 0.3)} strokeWidth={1.4} opacity={0.3} />;
      })}
      {Array.from({ length: 18 }, (_, index) => {
        const row = index % 6;
        const y1 = floorY + (height - floorY) * Math.pow(row / rows, 1.5);
        const y2 = floorY + (height - floorY) * Math.pow((row + 1) / rows, 1.5);
        const x = ((index * 97) % 100) / 100 * width;
        return <Path key={`v${index}`} d={`M${x} ${y1} L${x} ${y2}`} stroke={darken(color, 0.3)} strokeWidth={1.2} opacity={0.22} />;
      })}
    </G>
  );
}

function ArchedWindow({ x, y, w, h, ids, u }: { x: number; y: number; w: number; h: number; ids: ArtIds; u: number }) {
  const r = w / 2;
  const glass = `M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h}Z`;
  return (
    <G>
      <Path d={glass} fill={ids.url('sky')} />
      <G opacity={0.95}>
        <Ellipse cx={x + w * 0.32} cy={y + h * 0.45} rx={w * 0.18} ry={h * 0.06} fill="#FFFFFF" />
        <Ellipse cx={x + w * 0.42} cy={y + h * 0.42} rx={w * 0.12} ry={h * 0.07} fill="#FFFFFF" />
      </G>
      <Path d={`M${x} ${y + h} L${x} ${y + h * 0.78} Q${x + w * 0.5} ${y + h * 0.66} ${x + w} ${y + h * 0.8} L${x + w} ${y + h}Z`} fill="#7FD06A" />
      <Path d={glass} fill="none" stroke="#FFFFFF" strokeWidth={7 * u} />
      <Path d={`M${x + r} ${y + 3 * u} L${x + r} ${y + h} M${x} ${y + h * 0.58} L${x + w} ${y + h * 0.58}`} stroke="#FFFFFF" strokeWidth={4.5 * u} />
      <Rect x={x - 10 * u} y={y + h} width={w + 20 * u} height={9 * u} rx={3 * u} fill="#FFFFFF" />
    </G>
  );
}

// ---------------------------------------------------------------------------
// House of Feelings: a cosy living room
// ---------------------------------------------------------------------------

export function CozyRoomBackdrop({ width, height, floorY, groundY }: SceneSize) {
  const ids = useArtIds('room');
  const u = unit(width);
  const cx = width / 2;
  const win = { x: cx - 168 * u, y: floorY - 252 * u, w: 116 * u, h: 150 * u };
  const sofaX = cx + 44 * u;
  const sofaW = 168 * u;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <VGrad id={ids.id('wall')} y1={0} y2={floorY} from="#FFE7DC" to="#FFCFC6" />
        <VGrad id={ids.id('floor')} y1={floorY} y2={height} from="#EDB083" to="#C27A4C" />
        <VGrad id={ids.id('sky')} y1={win.y} y2={win.y + win.h} from="#7CC7FA" to="#D7F1FF" />
        <RadialGradient id={ids.id('light')} gradientUnits="userSpaceOnUse" cx={win.x + win.w / 2} cy={win.y + win.h / 2} r={260 * u}>
          <Stop offset="0" stopColor="#FFF6D8" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#FFF6D8" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={ids.id('rug')} cx="50%" cy="45%" r="60%">
          <Stop offset="0" stopColor="#D8CBFF" />
          <Stop offset="1" stopColor="#A58CF5" />
        </RadialGradient>
        <Shade id={ids.id('sofa')} color="#41B9AC" light={0.25} dark={0.18} />
        <Shade id={ids.id('curtain')} color="#FF7A9C" light={0.2} dark={0.2} direction="right" />
        <Glow id={ids.id('lamp')} color="#FFE7A0" opacity={0.85} />
      </Defs>

      {/* wall with heart wallpaper */}
      <Rect x={0} y={0} width={width} height={floorY} fill={ids.url('wall')} />
      {Array.from({ length: Math.ceil(width / (38 * u)) + 1 }, (_, col) =>
        Array.from({ length: Math.ceil(floorY / (46 * u)) }, (_, row) => (
          <Path
            key={`${col}-${row}`}
            d={heartPath(col * 38 * u + (row % 2 ? 19 * u : 0), row * 46 * u + 24 * u, 8 * u)}
            fill="#FFB0B4"
            opacity={0.32}
          />
        )),
      )}
      <Circle cx={win.x + win.w / 2} cy={win.y + win.h / 2} r={260 * u} fill={ids.url('light')} />

      {/* window and curtains */}
      <ArchedWindow {...win} ids={ids} u={u} />
      <Path
        d={`M${win.x - 26 * u} ${win.y - 12 * u} Q${win.x - 4 * u} ${win.y + win.h * 0.5} ${win.x - 18 * u} ${win.y + win.h + 30 * u} L${win.x - 36 * u} ${win.y + win.h + 30 * u} L${win.x - 36 * u} ${win.y - 12 * u}Z`}
        fill={ids.url('curtain')}
      />
      <Path
        d={`M${win.x + win.w + 26 * u} ${win.y - 12 * u} Q${win.x + win.w + 4 * u} ${win.y + win.h * 0.5} ${win.x + win.w + 18 * u} ${win.y + win.h + 30 * u} L${win.x + win.w + 36 * u} ${win.y + win.h + 30 * u} L${win.x + win.w + 36 * u} ${win.y - 12 * u}Z`}
        fill={ids.url('curtain')}
      />
      <Rect x={win.x - 44 * u} y={win.y - 18 * u} width={win.w + 88 * u} height={8 * u} rx={4 * u} fill="#B5653A" />

      {/* pictures and a shelf */}
      <Rect x={cx + 60 * u} y={floorY - 246 * u} width={76 * u} height={58 * u} rx={6 * u} fill="#B5653A" />
      <Rect x={cx + 66 * u} y={floorY - 240 * u} width={64 * u} height={46 * u} rx={3 * u} fill="#BFE8FF" />
      <Path d={`M${cx + 66 * u} ${floorY - 200 * u} Q${cx + 90 * u} ${floorY - 222 * u} ${cx + 130 * u} ${floorY - 204 * u} L${cx + 130 * u} ${floorY - 194 * u} L${cx + 66 * u} ${floorY - 194 * u}Z`} fill="#7FD06A" />
      <Circle cx={cx + 112 * u} cy={floorY - 226 * u} r={7 * u} fill="#FFD43B" />
      <Rect x={cx + 150 * u} y={floorY - 236 * u} width={48 * u} height={48 * u} rx={24 * u} fill="#FFFFFF" stroke="#FF9AB5" strokeWidth={4 * u} />
      <Path d={heartPath(cx + 174 * u, floorY - 211 * u, 20 * u)} fill="#FF5C8A" />
      <Rect x={cx + 56 * u} y={floorY - 150 * u} width={150 * u} height={8 * u} rx={3 * u} fill="#B5653A" />
      {['#FF7A9C', '#4C7DFF', '#FFC83D', '#3CCB7F'].map((color, index) => (
        <Rect key={color} x={cx + (66 + index * 13) * u} y={floorY - (182 - (index % 2) * 4) * u} width={11 * u} height={(32 - (index % 2) * 4) * u} rx={2 * u} fill={color} />
      ))}
      <Path d={`M${cx + 150 * u} ${floorY - 150 * u} L${cx + 154 * u} ${floorY - 168 * u} L${cx + 176 * u} ${floorY - 168 * u} L${cx + 180 * u} ${floorY - 150 * u}Z`} fill="#FF9F6B" />
      <Circle cx={cx + 158 * u} cy={floorY - 178 * u} r={9 * u} fill="#4FB548" />
      <Circle cx={cx + 172 * u} cy={floorY - 182 * u} r={10 * u} fill="#5CC15A" />

      {/* wainscot and skirting */}
      <Rect x={0} y={floorY - 64 * u} width={width} height={64 * u} fill="#F7B5BC" />
      {Array.from({ length: Math.ceil(width / (74 * u)) }, (_, index) => (
        <Rect key={index} x={index * 74 * u + 10 * u} y={floorY - 54 * u} width={54 * u} height={40 * u} rx={5 * u} fill="none" stroke="#FFD3D8" strokeWidth={2.5 * u} />
      ))}
      <Rect x={0} y={floorY - 70 * u} width={width} height={7 * u} fill="#FFFFFF" opacity={0.9} />

      <WoodFloor ids={ids} width={width} height={height} floorY={floorY} />
      <Rect x={0} y={floorY - 4 * u} width={width} height={10 * u} fill="#FFFFFF" />

      {/* rug */}
      <Ellipse cx={cx} cy={groundY - 4 * u} rx={width * 0.46} ry={38 * u} fill={ids.url('rug')} />
      <Ellipse cx={cx} cy={groundY - 4 * u} rx={width * 0.36} ry={26 * u} fill="none" stroke="#F2EDFF" strokeWidth={3 * u} strokeDasharray={`${6 * u} ${6 * u}`} />

      {/* sofa with a teddy */}
      <Rect x={sofaX} y={floorY - 74 * u} width={sofaW} height={72 * u} rx={24 * u} fill={ids.url('sofa')} />
      <Rect x={sofaX + 14 * u} y={floorY - 62 * u} width={64 * u} height={46 * u} rx={16 * u} fill={lighten('#41B9AC', 0.2)} />
      <Rect x={sofaX + 88 * u} y={floorY - 62 * u} width={64 * u} height={46 * u} rx={16 * u} fill={lighten('#41B9AC', 0.2)} />
      <Rect x={sofaX - 8 * u} y={floorY - 14 * u} width={sofaW + 16 * u} height={36 * u} rx={14 * u} fill={darken('#41B9AC', 0.1)} />
      <Rect x={sofaX - 22 * u} y={floorY - 44 * u} width={30 * u} height={66 * u} rx={14 * u} fill={ids.url('sofa')} />
      <Rect x={sofaX + sofaW - 8 * u} y={floorY - 44 * u} width={30 * u} height={66 * u} rx={14 * u} fill={ids.url('sofa')} />
      <Rect x={sofaX} y={floorY + 22 * u} width={8 * u} height={10 * u} fill="#6B3A1E" />
      <Rect x={sofaX + sofaW - 8 * u} y={floorY + 22 * u} width={8 * u} height={10 * u} fill="#6B3A1E" />
      <Path d={heartPath(sofaX + 40 * u, floorY - 26 * u, 30 * u)} fill="#FF7A9C" />
      <G>
        <Circle cx={sofaX + 120 * u} cy={floorY - 22 * u} r={17 * u} fill="#C8874E" />
        <Circle cx={sofaX + 120 * u} cy={floorY - 50 * u} r={14 * u} fill="#D99A5E" />
        <Circle cx={sofaX + 109 * u} cy={floorY - 62 * u} r={6 * u} fill="#C8874E" />
        <Circle cx={sofaX + 131 * u} cy={floorY - 62 * u} r={6 * u} fill="#C8874E" />
        <Ellipse cx={sofaX + 120 * u} cy={floorY - 45 * u} rx={6 * u} ry={4.5 * u} fill="#F2D2AE" />
        <Circle cx={sofaX + 115 * u} cy={floorY - 53 * u} r={1.8 * u} fill="#2A1A14" />
        <Circle cx={sofaX + 125 * u} cy={floorY - 53 * u} r={1.8 * u} fill="#2A1A14" />
        <Circle cx={sofaX + 120 * u} cy={floorY - 46 * u} r={1.8 * u} fill="#2A1A14" />
      </G>

      {/* floor lamp and plant */}
      <Circle cx={30 * u} cy={floorY - 196 * u} r={60 * u} fill={ids.url('lamp')} />
      <Rect x={27 * u} y={floorY - 186 * u} width={6 * u} height={200 * u} fill="#6A5A8A" />
      <Ellipse cx={30 * u} cy={floorY + 14 * u} rx={20 * u} ry={6 * u} fill="#6A5A8A" />
      <Path d={`M${8 * u} ${floorY - 180 * u} L${52 * u} ${floorY - 180 * u} L${42 * u} ${floorY - 214 * u} L${18 * u} ${floorY - 214 * u}Z`} fill="#FFD36B" />
      <Path d={`M${width - 54 * u} ${floorY + 18 * u} L${width - 14 * u} ${floorY + 18 * u} L${width - 20 * u} ${floorY - 16 * u} L${width - 48 * u} ${floorY - 16 * u}Z`} fill="#FF9F6B" />
      {[
        [-14, -60, -40],
        [8, -66, 30],
        [-2, -80, 0],
        [16, -44, 60],
        [-22, -40, -70],
      ].map(([dx, dy, rot], index) => (
        <Ellipse
          key={index}
          cx={width - 34 * u + dx * u}
          cy={floorY - 16 * u + dy * u * 0.6}
          rx={9 * u}
          ry={22 * u}
          fill={index % 2 ? '#3E9E3E' : '#5CC15A'}
          transform={`rotate(${rot} ${width - 34 * u + dx * u} ${floorY - 16 * u + dy * u * 0.6})`}
        />
      ))}

      {/* toy blocks */}
      {[
        ['#FF5C7A', 22, 40],
        ['#38B0FF', 48, 44],
        ['#FFD43B', 34, 18],
      ].map(([color, dx, dy]) => (
        <G key={String(color)}>
          <Rect x={Number(dx) * u} y={groundY - Number(dy) * u - 20 * u} width={22 * u} height={22 * u} rx={4 * u} fill={String(color)} />
          <Rect x={Number(dx) * u + 4 * u} y={groundY - Number(dy) * u - 16 * u} width={14 * u} height={6 * u} rx={2 * u} fill="#FFFFFF" opacity={0.35} />
        </G>
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Market: a sunny street stall
// ---------------------------------------------------------------------------

const FACADES = ['#FFD3A1', '#C9E7FF', '#FFC6D9', '#D7F2C2', '#E6D8FF'];

export function MarketBackdrop({ width, height, groundY, stageTop, stageHeight }: SceneSize) {
  const ids = useArtIds('mkt');
  const u = unit(width);
  const counterTop = groundY - 8;
  const awningTop = stageTop + stageHeight * 0.24;
  const awningBottom = awningTop + 62 * u;
  const stripes = Math.ceil(width / (34 * u)) + 1;
  const stripeW = width / (stripes - 1);
  return (
    <Svg width={width} height={height}>
      <Defs>
        <VGrad id={ids.id('sky')} y1={0} y2={counterTop} from="#6FC0FA" to="#FFF1D2" />
        <VGrad id={ids.id('back')} y1={awningBottom} y2={counterTop} from="#A26B44" to="#7A4B2D" />
        <VGrad id={ids.id('counter')} y1={counterTop} y2={height} from="#D49A5C" to="#A8693A" />
        <Shade id={ids.id('post')} color="#C98A4B" light={0.2} dark={0.25} direction="right" />
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={ids.url('sky')} />

      {/* street facades behind the stall */}
      {FACADES.map((color, index) => {
        const w = width / 4;
        const x = index * w - w * 0.4;
        const top = awningTop - 150 * u + (index % 2) * 30 * u;
        return (
          <G key={color}>
            <Rect x={x} y={top} width={w - 4 * u} height={counterTop - top} fill={color} />
            <Path d={`M${x - 6 * u} ${top + 2 * u} L${x + w / 2 - 2 * u} ${top - 26 * u} L${x + w + 2 * u} ${top + 2 * u}Z`} fill={darken(color, 0.25)} />
            {[0, 1].map((col) => (
              <Rect key={col} x={x + 12 * u + col * (w / 2 - 6 * u)} y={top + 18 * u} width={w / 2 - 24 * u} height={26 * u} rx={5 * u} fill="#FFFFFF" opacity={0.75} />
            ))}
          </G>
        );
      })}

      {/* bunting */}
      <Path d={`M0 ${awningTop - 46 * u} Q${width / 2} ${awningTop - 18 * u} ${width} ${awningTop - 46 * u}`} stroke="#8C6C4C" strokeWidth={1.5} fill="none" />
      {Array.from({ length: 9 }, (_, index) => {
        const t = (index + 0.5) / 9;
        const x = t * width;
        const y = awningTop - 46 * u + 4 * t * (1 - t) * 28 * u - 4 * u;
        return (
          <Path key={index} d={`M${x - 9 * u} ${y} L${x + 9 * u} ${y} L${x} ${y + 16 * u}Z`} fill={['#FF5C8A', '#FFD43B', '#38B0FF', '#3CCB7F'][index % 4]} />
        );
      })}

      {/* stall back with shelves */}
      <Rect x={0} y={awningBottom} width={width} height={counterTop - awningBottom} fill={ids.url('back')} />
      {[0.35, 0.7].map((t) => {
        const y = awningBottom + (counterTop - awningBottom) * t;
        return (
          <G key={t}>
            <Rect x={0} y={y} width={width} height={7 * u} fill="#5E3A22" />
            {Array.from({ length: Math.ceil(width / (30 * u)) }, (_, index) => (
              <G key={index}>
                <Rect
                  x={index * 30 * u + 6 * u}
                  y={y - 24 * u}
                  width={18 * u}
                  height={24 * u}
                  rx={5 * u}
                  fill={['#FFD43B', '#FF8A5C', '#7FD0FF', '#B48CFF', '#7BD34A'][(index + (t > 0.5 ? 2 : 0)) % 5]}
                  opacity={0.9}
                />
                <Rect x={index * 30 * u + 8 * u} y={y - 28 * u} width={14 * u} height={6 * u} rx={2 * u} fill="#E6E6F0" />
              </G>
            ))}
          </G>
        );
      })}

      {/* hanging peppers and a chalk price board */}
      {[0.16, 0.5, 0.84].map((t, index) => (
        <G key={t}>
          <Path d={`M${t * width} ${awningBottom} L${t * width} ${awningBottom + 26 * u}`} stroke="#6B4A2A" strokeWidth={1.5} />
          {[0, 1, 2].map((k) => (
            <Ellipse
              key={k}
              cx={t * width + (k - 1) * 6 * u}
              cy={awningBottom + (32 + k * 9) * u}
              rx={5 * u}
              ry={9 * u}
              fill={['#FF4D3B', '#FFB020', '#3CCB7F'][(index + k) % 3]}
            />
          ))}
        </G>
      ))}
      <G>
        <Rect x={width * 0.58} y={awningBottom + (counterTop - awningBottom) * 0.4} width={width * 0.34} height={78 * u} rx={8 * u} fill="#8C5A32" />
        <Rect x={width * 0.58 + 6 * u} y={awningBottom + (counterTop - awningBottom) * 0.4 + 6 * u} width={width * 0.34 - 12 * u} height={66 * u} rx={5 * u} fill="#2F5B45" />
        {[0, 1, 2].map((row) => (
          <G key={row}>
            <Circle cx={width * 0.58 + 22 * u} cy={awningBottom + (counterTop - awningBottom) * 0.4 + (22 + row * 18) * u} r={5.5 * u} fill={['#FF5C5C', '#FFD43B', '#7BD34A'][row]} />
            <Path
              d={`M${width * 0.58 + 34 * u} ${awningBottom + (counterTop - awningBottom) * 0.4 + (22 + row * 18) * u} L${width * 0.58 + width * 0.34 - 20 * u} ${awningBottom + (counterTop - awningBottom) * 0.4 + (22 + row * 18) * u}`}
              stroke="#FFFFFF"
              strokeWidth={2.5 * u}
              strokeLinecap="round"
              strokeDasharray={`${8 * u} ${5 * u}`}
              opacity={0.8}
            />
          </G>
        ))}
      </G>

      {/* posts and awning */}
      <Rect x={6 * u} y={awningTop} width={12 * u} height={counterTop - awningTop} fill={ids.url('post')} />
      <Rect x={width - 18 * u} y={awningTop} width={12 * u} height={counterTop - awningTop} fill={ids.url('post')} />
      <Rect x={0} y={awningTop} width={width} height={awningBottom - awningTop} fill="#FFFFFF" />
      {Array.from({ length: stripes }, (_, index) => (
        <Rect key={index} x={index * stripeW - stripeW / 2} y={awningTop} width={stripeW / 2} height={awningBottom - awningTop} fill="#FF4D5E" />
      ))}
      {Array.from({ length: stripes * 2 }, (_, index) => {
        const w = stripeW / 2;
        const x = index * w - w;
        return (
          <Path key={`s${index}`} d={`M${x} ${awningBottom - 1} A${w / 2} ${w / 2} 0 0 0 ${x + w} ${awningBottom - 1}Z`} fill={index % 2 ? '#FFFFFF' : '#FF4D5E'} />
        );
      })}
      <Rect x={0} y={awningTop} width={width} height={(awningBottom - awningTop) * 0.4} fill="#FFFFFF" opacity={0.18} />
      <Rect x={0} y={awningTop - 8 * u} width={width} height={10 * u} rx={4 * u} fill="#8C5A32" />

      {/* counter */}
      <Rect x={0} y={counterTop} width={width} height={height - counterTop} fill={ids.url('counter')} />
      <Rect x={0} y={counterTop - 6 * u} width={width} height={14 * u} fill="#E6B37A" />
      {Array.from({ length: Math.ceil(width / (46 * u)) }, (_, index) => (
        <Path key={index} d={`M${index * 46 * u + 23 * u} ${counterTop + 10 * u} L${index * 46 * u + 23 * u} ${height}`} stroke="#8F5630" strokeWidth={2} opacity={0.4} />
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Playground: a park in the sun
// ---------------------------------------------------------------------------

export function ParkBackdrop({ width, height, floorY, groundY }: SceneSize) {
  const ids = useArtIds('park');
  const u = unit(width);
  const cx = width / 2;
  const playScale = 1.45 * u;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <VGrad id={ids.id('sky')} y1={0} y2={floorY} from="#4FAAF2" to="#DDF3FF" />
        <VGrad id={ids.id('grass')} y1={floorY} y2={height} from="#9EDB72" to="#5CB847" />
        <RadialGradient id={ids.id('sun')} gradientUnits="userSpaceOnUse" cx={width - 60 * u} cy={floorY - 230 * u} r={150 * u}>
          <Stop offset="0" stopColor="#FFF8D0" stopOpacity={0.9} />
          <Stop offset="1" stopColor="#FFF8D0" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={floorY + 10} fill={ids.url('sky')} />
      <Circle cx={width - 60 * u} cy={floorY - 230 * u} r={150 * u} fill={ids.url('sun')} />
      <Circle cx={width - 60 * u} cy={floorY - 230 * u} r={26 * u} fill="#FFF6C4" />
      <G transform={`translate(${20 * u} ${floorY - 250 * u}) scale(${0.7 * u})`}>
        <Cloud />
      </G>
      <G transform={`translate(${cx + 20 * u} ${floorY - 190 * u}) scale(${0.5 * u})`}>
        <Cloud />
      </G>

      {/* tree line and fence */}
      {Array.from({ length: Math.ceil(width / (34 * u)) + 1 }, (_, index) => (
        <Circle key={index} cx={index * 34 * u} cy={floorY - 10 * u - (index % 3) * 6 * u} r={(26 + (index % 2) * 8) * u} fill={index % 2 ? '#4FA84A' : '#5DB955'} />
      ))}
      <Rect x={0} y={floorY - 4 * u} width={width} height={height - floorY} fill={ids.url('grass')} />
      {Array.from({ length: Math.ceil(width / (22 * u)) + 1 }, (_, index) => (
        <Path
          key={index}
          d={`M${index * 22 * u} ${floorY + 16 * u} L${index * 22 * u} ${floorY - 18 * u} L${index * 22 * u + 7 * u} ${floorY - 26 * u} L${index * 22 * u + 14 * u} ${floorY - 18 * u} L${index * 22 * u + 14 * u} ${floorY + 16 * u}Z`}
          fill="#FFFFFF"
        />
      ))}
      <Rect x={0} y={floorY - 8 * u} width={width} height={6 * u} fill="#F1EEF8" />
      <Rect x={0} y={floorY + 6 * u} width={width} height={6 * u} fill="#F1EEF8" />

      {/* play equipment and trees */}
      <G transform={`translate(${cx - 120 * playScale} ${floorY + 56 * u - 172 * playScale}) scale(${playScale})`}>
        <PlaygroundArea />
      </G>
      <G transform={`translate(${-40 * u} ${floorY + 30 * u - 160 * u}) scale(${u})`}>
        <RoundTree color="#45B04A" />
      </G>
      <G transform={`translate(${width - 70 * u} ${floorY + 40 * u - 176 * u}) scale(${1.1 * u})`}>
        <RoundTree color="#52B947" fruit="#FF6B6B" />
      </G>

      {/* sandy play patch */}
      <Ellipse cx={cx} cy={groundY - 6 * u} rx={width * 0.5} ry={34 * u} fill="#FFDDB0" />
      <Ellipse cx={cx} cy={groundY - 6 * u} rx={width * 0.5} ry={34 * u} fill="none" stroke="#F0BE85" strokeWidth={3 * u} />
      {[
        [0.12, 0.92],
        [0.85, 0.9],
        [0.06, 0.7],
        [0.92, 0.72],
      ].map(([fx, fy], index) => (
        <G key={index}>
          {[0, 1, 2].map((petal) => (
            <Circle key={petal} cx={fx * width + petal * 9 * u} cy={floorY + (height - floorY) * fy - (petal % 2) * 6 * u} r={4.5 * u} fill={['#FF5C8A', '#FFD43B', '#FFFFFF'][petal]} />
          ))}
        </G>
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Learning Center: a bright classroom
// ---------------------------------------------------------------------------

/** Chalkboard rectangle in screen pixels, shared with the puzzle overlay. */
export function classroomBoard({ width, stageTop, stageHeight }: SceneSize) {
  const u = unit(width);
  const w = Math.min(width - 28 * u, 400 * u);
  const h = Math.min(stageHeight * 0.5, 230 * u);
  return { x: (width - w) / 2, y: stageTop + 14 * u, w, h, u };
}

export function ClassroomBackdrop(size: SceneSize) {
  const { width, height, floorY, groundY } = size;
  const ids = useArtIds('class');
  const u = unit(width);
  const board = classroomBoard(size);
  return (
    <Svg width={width} height={height}>
      <Defs>
        <VGrad id={ids.id('wall')} y1={0} y2={floorY} from="#E3EEFF" to="#C8DBFF" />
        <VGrad id={ids.id('floor')} y1={floorY} y2={height} from="#E8B07E" to="#BE7B4A" />
        <VGrad id={ids.id('board')} y1={board.y} y2={board.y + board.h} from="#2F7A57" to="#24634A" />
        <Shade id={ids.id('desk')} color="#D99A5E" light={0.2} dark={0.25} />
        <RadialGradient id={ids.id('globe')} cx="40%" cy="35%" r="65%">
          <Stop offset="0" stopColor="#9FE0FF" />
          <Stop offset="1" stopColor="#2F8FD6" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={floorY} fill={ids.url('wall')} />
      {Array.from({ length: Math.ceil(width / (30 * u)) }, (_, index) => (
        <Rect key={index} x={index * 30 * u} y={0} width={14 * u} height={floorY} fill="#FFFFFF" opacity={0.18} />
      ))}

      {/* bookshelves at the edges */}
      {[0, width - 54 * u].map((x, side) => (
        <G key={x}>
          <Rect x={x} y={floorY - 190 * u} width={54 * u} height={190 * u} fill="#B5653A" />
          {[0, 1, 2].map((shelf) => (
            <G key={shelf}>
              <Rect x={x + 4 * u} y={floorY - (182 - shelf * 60) * u} width={46 * u} height={52 * u} fill="#8A4F2B" />
              {[0, 1, 2, 3].map((book) => (
                <Rect
                  key={book}
                  x={x + (7 + book * 11) * u}
                  y={floorY - (174 - shelf * 60 - (book % 2) * 6) * u}
                  width={9 * u}
                  height={(44 - (book % 2) * 6) * u}
                  rx={2 * u}
                  fill={['#FF5C7A', '#4C7DFF', '#FFC83D', '#3CCB7F', '#9B5CFF'][(book + shelf + side) % 5]}
                />
              ))}
            </G>
          ))}
        </G>
      ))}

      {/* chalkboard */}
      <Rect x={board.x - 10 * u} y={board.y - 10 * u} width={board.w + 20 * u} height={board.h + 20 * u} rx={14 * u} fill="#B5653A" />
      <Rect x={board.x - 10 * u} y={board.y - 10 * u} width={board.w + 20 * u} height={6 * u} rx={3 * u} fill="#D99A5E" />
      <Rect x={board.x} y={board.y} width={board.w} height={board.h} rx={8 * u} fill={ids.url('board')} />
      <Ellipse cx={board.x + board.w * 0.25} cy={board.y + board.h * 0.7} rx={board.w * 0.2} ry={board.h * 0.12} fill="#FFFFFF" opacity={0.05} />
      <Ellipse cx={board.x + board.w * 0.75} cy={board.y + board.h * 0.3} rx={board.w * 0.18} ry={board.h * 0.1} fill="#FFFFFF" opacity={0.05} />
      <Rect x={board.x + board.w * 0.15} y={board.y + board.h + 4 * u} width={board.w * 0.7} height={8 * u} rx={3 * u} fill="#8A4F2B" />
      <Rect x={board.x + board.w * 0.22} y={board.y + board.h} width={22 * u} height={5 * u} rx={2 * u} fill="#FFFFFF" />
      <Rect x={board.x + board.w * 0.3} y={board.y + board.h} width={16 * u} height={5 * u} rx={2 * u} fill="#FFD43B" />

      {/* floor, rug and desk with a globe */}
      <WoodFloor ids={ids} width={width} height={height} floorY={floorY} color="#E8B07E" />
      <Rect x={0} y={floorY - 6 * u} width={width} height={9 * u} fill="#FFFFFF" />
      <Ellipse cx={width / 2} cy={groundY - 4 * u} rx={width * 0.44} ry={32 * u} fill="#FFC86B" />
      <Ellipse cx={width / 2} cy={groundY - 4 * u} rx={width * 0.34} ry={22 * u} fill="none" stroke="#FFE3A6" strokeWidth={3 * u} />
      <Rect x={width - 132 * u} y={floorY - 10 * u} width={110 * u} height={14 * u} rx={4 * u} fill={ids.url('desk')} />
      <Rect x={width - 124 * u} y={floorY + 4 * u} width={10 * u} height={40 * u} fill="#A8693A" />
      <Rect x={width - 40 * u} y={floorY + 4 * u} width={10 * u} height={40 * u} fill="#A8693A" />
      <Rect x={width - 100 * u} y={floorY - 18 * u} width={14 * u} height={10 * u} fill="#8C8FB0" />
      <Circle cx={width - 93 * u} cy={floorY - 40 * u} r={22 * u} fill={ids.url('globe')} />
      <Path
        d={`M${width - 104 * u} ${floorY - 52 * u} q${8 * u} ${-4 * u} ${14 * u} ${4 * u} q${-4 * u} ${10 * u} ${-12 * u} ${8 * u}Z M${width - 86 * u} ${floorY - 34 * u} q${8 * u} ${2 * u} ${6 * u} ${10 * u} q${-8 * u} ${2 * u} ${-10 * u} ${-4 * u}Z`}
        fill="#7BD34A"
      />
      <Circle cx={width - 52 * u} cy={floorY - 20 * u} r={10 * u} fill="#F2363F" />
      <Path d={`M${width - 52 * u} ${floorY - 30 * u} q${2 * u} ${-6 * u} ${6 * u} ${-7 * u}`} stroke="#6B3A1E" strokeWidth={2 * u} fill="none" />
    </Svg>
  );
}
