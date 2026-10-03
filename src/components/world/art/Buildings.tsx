/**
 * The four destinations on the world map, drawn in a three-quarter view
 * (front face lit, right side in shade) so they read as solid 3D buildings.
 */
import type { ComponentType } from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { LocationId } from '@/types/world';
import { darken, lighten } from '@/utils/color';

import { heartPath, starPath } from './KidCharacter';
import { Ball, Glow, GroundShadow, Shade, useArtIds, type ArtIds } from './primitives';

export type ViewDef = { width: number; height: number; viewBox: string };

const WOOD = '#B5653A';
const GLASS_WARM = '#FFD36B';
const WHITE = '#FFFFFF';

function FlowerBox({ x, y, width }: { x: number; y: number; width: number }) {
  const colors = ['#FF5C8A', '#FFD43B', '#FF8AB5', '#FFFFFF'];
  const count = Math.max(3, Math.round(width / 7));
  return (
    <G>
      {Array.from({ length: count }, (_, index) => {
        const cx = x + 3 + (index * (width - 6)) / (count - 1);
        return (
          <G key={index}>
            <Ellipse cx={cx} cy={y - 1} rx={3.5} ry={2.5} fill="#4CB44A" />
            <Circle cx={cx} cy={y - 4} r={3} fill={colors[index % colors.length]} />
          </G>
        );
      })}
      <Rect x={x} y={y} width={width} height={7} rx={2.5} fill={darken(WOOD, 0.1)} />
    </G>
  );
}

function ArchWindow({ x, y, width, height, ids }: { x: number; y: number; width: number; height: number; ids: ArtIds }) {
  const r = width / 2;
  const bottom = y + height;
  return (
    <G>
      <Path
        d={`M${x} ${bottom} L${x} ${y + r} C${x} ${y - r * 0.3} ${x + width} ${y - r * 0.3} ${x + width} ${y + r} L${x + width} ${bottom}Z`}
        fill={ids.url('glass')}
        stroke={WHITE}
        strokeWidth={3}
      />
      <Path d={`M${x + r} ${y + 2} L${x + r} ${bottom} M${x} ${y + height * 0.55} L${x + width} ${y + height * 0.55}`} stroke={WHITE} strokeWidth={2.4} />
      <Path d={`M${x + 4} ${y + r} L${x + 9} ${y + r - 6}`} stroke={WHITE} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </G>
  );
}

// ---------------------------------------------------------------------------
// House of Feelings
// ---------------------------------------------------------------------------

export const HOUSE_VIEW: ViewDef = { width: 220, height: 210, viewBox: '0 0 220 210' };

export function HouseOfFeelings() {
  const ids = useArtIds('hof');
  const roof = '#FF6B8B';
  const trim = '#D9426A';
  return (
    <G>
      <Defs>
        <Shade id={ids.id('wall')} color="#FFE6CC" light={0.35} dark={0.06} />
        <Shade id={ids.id('side')} color="#EBBD96" light={0.05} dark={0.18} />
        <Shade id={ids.id('roof')} color={roof} light={0.18} dark={0.18} direction="diag" />
        <Shade id={ids.id('door')} color={WOOD} light={0.2} dark={0.25} />
        <Shade id={ids.id('glass')} color={GLASS_WARM} light={0.55} dark={0.04} />
        <Shade id={ids.id('brick')} color="#D0583F" light={0.15} dark={0.2} direction="right" />
      </Defs>
      <GroundShadow cx={116} cy={198} rx={104} ry={12} />

      {/* side wall */}
      <Path d="M150 112 L198 98 L198 186 L150 198Z" fill={ids.url('side')} />
      <Path d="M163 130 L186 123 L186 152 L163 159Z" fill={ids.url('glass')} stroke={WHITE} strokeWidth={3} />
      <Path d="M174.5 126.5 L174.5 155.5 M163 145 L186 138" stroke={WHITE} strokeWidth={2} />

      {/* front wall and gable */}
      <Rect x={30} y={112} width={120} height={86} fill={ids.url('wall')} />
      <Path d="M30 114 L90 44 L150 114Z" fill={ids.url('wall')} />
      <Path d="M30 112 L150 112" stroke={darken('#FFE6CC', 0.1)} strokeWidth={2} />

      {/* chimney, then the roof slope over its base */}
      <Rect x={160} y={30} width={18} height={44} fill={ids.url('brick')} />
      <Rect x={157} y={26} width={24} height={8} rx={2} fill={darken('#D0583F', 0.25)} />
      <Path d="M90 34 L140 20 L208 100 L156 116Z" fill={ids.url('roof')} />
      {[0.25, 0.45, 0.65, 0.85].map((t) => (
        <Path
          key={t}
          d={`M${90 + 66 * t} ${34 + 82 * t} L${140 + 68 * t} ${20 + 80 * t}`}
          stroke={darken(roof, 0.25)}
          strokeWidth={2}
          opacity={0.35}
        />
      ))}
      <Path d="M18 120 L90 32 L162 120" stroke={trim} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M22 116 L90 34 L158 116" stroke={lighten(trim, 0.35)} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />

      {/* heart window in the gable */}
      <Circle cx={90} cy={84} r={17} fill={WHITE} />
      <Circle cx={90} cy={84} r={13} fill={ids.url('glass')} />
      <Path d={heartPath(90, 86, 15)} fill="#FF4D7A" />

      {/* windows with flower boxes */}
      <ArchWindow x={40} y={140} width={24} height={32} ids={ids} />
      <ArchWindow x={116} y={140} width={24} height={32} ids={ids} />
      <FlowerBox x={38} y={174} width={28} />
      <FlowerBox x={114} y={174} width={28} />

      {/* door */}
      <Path d="M74 198 L74 158 C74 140 106 140 106 158 L106 198Z" fill={ids.url('door')} />
      <Path d="M82 146 L82 198 M90 143 L90 198 M98 146 L98 198" stroke={darken(WOOD, 0.3)} strokeWidth={1.5} />
      <Path d="M74 198 L74 158 C74 140 106 140 106 158 L106 198" stroke={trim} strokeWidth={4} fill="none" />
      <Path d={heartPath(90, 160, 13)} fill="#FF8FB0" />
      <Circle cx={100} cy={176} r={2.6} fill="#FFC83D" />

      {/* foundation and step */}
      <Rect x={28} y={190} width={124} height={9} rx={2} fill="#D8C3AE" />
      <Path d="M150 190 L198 178 L198 186 L150 199Z" fill="#C4AD96" />
      <Rect x={68} y={196} width={44} height={7} rx={2} fill="#EDE2D2" />
    </G>
  );
}

// ---------------------------------------------------------------------------
// Learning Center
// ---------------------------------------------------------------------------

export const LEARNING_VIEW: ViewDef = { width: 240, height: 230, viewBox: '0 0 240 230' };

export function LearningCenter() {
  const ids = useArtIds('lc');
  const roof = '#4C7DFF';
  const roofDark = darken(roof, 0.25);
  const gold = '#FFC83D';
  const stone = '#ECE6F7';
  return (
    <G>
      <Defs>
        <Shade id={ids.id('wall')} color="#FFF6EA" light={0.4} dark={0.06} />
        <Shade id={ids.id('side')} color="#E3D3BC" light={0.05} dark={0.18} />
        <Shade id={ids.id('roof')} color={roof} light={0.2} dark={0.15} />
        <Shade id={ids.id('glass')} color="#8ED0FF" light={0.45} dark={0.1} />
        <Shade id={ids.id('stone')} color={stone} light={0.3} dark={0.12} direction="right" />
        <Shade id={ids.id('door')} color="#5B6CFF" light={0.2} dark={0.2} />
        <Shade id={ids.id('gold')} color={gold} light={0.45} dark={0.15} />
      </Defs>
      <GroundShadow cx={124} cy={218} rx={114} ry={12} />

      {/* side wall */}
      <Path d="M190 124 L222 112 L222 206 L190 216Z" fill={ids.url('side')} />
      <Path d="M197 142 L215 136 L215 162 L197 168Z" fill={ids.url('glass')} stroke={WHITE} strokeWidth={2.5} />
      <Path d="M197 180 L215 174 L215 196 L197 202Z" fill={ids.url('glass')} stroke={WHITE} strokeWidth={2.5} />

      {/* front wall */}
      <Rect x={30} y={122} width={160} height={94} fill={ids.url('wall')} />

      {/* roof */}
      <Path d="M18 128 L202 128 L176 90 L44 90Z" fill={ids.url('roof')} />
      <Path d="M202 128 L230 116 L204 84 L176 90Z" fill={roofDark} />
      {[102, 115].map((y) => {
        const t = (y - 90) / 38;
        return <Path key={y} d={`M${44 - 26 * t} ${y} L${176 + 26 * t} ${y}`} stroke={lighten(roof, 0.35)} strokeWidth={2} opacity={0.45} />;
      })}
      <Path d="M18 128 L202 128" stroke={gold} strokeWidth={5} strokeLinecap="round" />

      {/* tower */}
      <Path d="M140 46 L152 42 L152 104 L140 108Z" fill={ids.url('side')} />
      <Rect x={100} y={46} width={40} height={62} fill={ids.url('wall')} />
      <Path d="M94 50 L120 6 L146 50Z" fill={ids.url('roof')} />
      <Path d="M120 6 L146 50 L156 44Z" fill={roofDark} />
      <Path d="M92 51 L148 51" stroke={gold} strokeWidth={4} strokeLinecap="round" />
      <Path d={starPath(120, 6, 8)} fill={ids.url('gold')} />
      <Circle cx={120} cy={76} r={15} fill={WHITE} stroke={gold} strokeWidth={3} />
      {[0, 90, 180, 270].map((deg) => (
        <Circle key={deg} cx={120 + 11 * Math.cos((deg * Math.PI) / 180)} cy={76 + 11 * Math.sin((deg * Math.PI) / 180)} r={1.4} fill="#6A6390" />
      ))}
      <Path d="M120 76 L120 67 M120 76 L127 80" stroke="#2B2350" strokeWidth={2.5} strokeLinecap="round" />

      {/* windows */}
      <ArchWindow x={42} y={148} width={24} height={44} ids={ids} />
      <ArchWindow x={154} y={148} width={24} height={44} ids={ids} />

      {/* entrance: columns, pediment with a book, door */}
      <Path d="M104 210 L104 174 C104 160 136 160 136 174 L136 210Z" fill={ids.url('door')} />
      <Rect x={108} y={176} width={10} height={26} rx={3} fill={lighten('#5B6CFF', 0.45)} opacity={0.8} />
      <Rect x={122} y={176} width={10} height={26} rx={3} fill={lighten('#5B6CFF', 0.45)} opacity={0.8} />
      <Path d="M120 164 L120 210" stroke={darken('#5B6CFF', 0.3)} strokeWidth={1.5} />
      {[88, 152].map((x) => (
        <G key={x}>
          <Rect x={x - 5} y={150} width={10} height={60} fill={ids.url('stone')} />
          <Rect x={x - 7} y={148} width={14} height={5} rx={1.5} fill={stone} />
          <Rect x={x - 7} y={207} width={14} height={5} rx={1.5} fill={darken(stone, 0.08)} />
        </G>
      ))}
      <Path d="M80 150 L120 126 L160 150Z" fill={ids.url('stone')} stroke={gold} strokeWidth={2.5} strokeLinejoin="round" />
      <Path d="M108 140 Q114 136 120 140 Q126 136 132 140 L132 147 Q126 144 120 147 Q114 144 108 147Z" fill={WHITE} stroke={roofDark} strokeWidth={1.4} />

      {/* steps */}
      <Rect x={82} y={209} width={76} height={6} rx={2} fill="#E3DCEF" />
      <Rect x={76} y={214} width={88} height={6} rx={2} fill="#D6CEE6" />
    </G>
  );
}

// ---------------------------------------------------------------------------
// Market
// ---------------------------------------------------------------------------

export const MARKET_VIEW: ViewDef = { width: 230, height: 200, viewBox: '0 0 230 200' };

const PRODUCE: [string, number][] = [
  ['#F2363F', 30],
  ['#FF9F1C', 88],
  ['#7BD34A', 146],
];

export function MarketStall() {
  const ids = useArtIds('mk');
  const wood = '#C98A4B';
  const red = '#FF4D5E';
  const stripes = 10;
  return (
    <G>
      <Defs>
        <Shade id={ids.id('wood')} color={wood} light={0.2} dark={0.2} />
        <Shade id={ids.id('back')} color="#8A5A3C" light={0.1} dark={0.3} />
        <Shade id={ids.id('sign')} color="#E0A868" light={0.3} dark={0.15} />
        <Shade id={ids.id('awningShade')} color="#000000" light={1} dark={0} />
        {PRODUCE.map(([color]) => (
          <Ball key={color} id={ids.id(color.slice(1))} color={color} light={0.5} />
        ))}
        <Glow id={ids.id('lamp')} color="#FFE08A" opacity={0.8} />
      </Defs>
      <GroundShadow cx={118} cy={190} rx={110} ry={11} />

      {/* stall interior */}
      <Rect x={30} y={84} width={172} height={60} fill={ids.url('back')} />
      <Path d="M30 106 L202 106 M30 126 L202 126" stroke={darken('#8A5A3C', 0.35)} strokeWidth={3} />
      {[44, 62, 80, 136, 154, 172, 188].map((x, index) => (
        <Rect
          key={x}
          x={x}
          y={index % 2 === 0 ? 92 : 112}
          width={10}
          height={13}
          rx={3}
          fill={['#FFD43B', '#FF8A5C', '#7FD0FF', '#B48CFF'][index % 4]}
          opacity={0.9}
        />
      ))}

      {/* posts */}
      <Rect x={24} y={70} width={9} height={118} rx={2} fill={ids.url('wood')} />
      <Rect x={198} y={70} width={9} height={118} rx={2} fill={ids.url('wood')} />

      {/* counter */}
      <Path d="M206 134 L222 128 L222 180 L206 188Z" fill={darken(wood, 0.3)} />
      <Rect x={22} y={134} width={186} height={54} rx={4} fill={ids.url('wood')} />
      {[45, 68, 91, 114, 137, 160, 183].map((x) => (
        <Path key={x} d={`M${x} 140 L${x} 186`} stroke={darken(wood, 0.25)} strokeWidth={1.5} opacity={0.6} />
      ))}
      <Rect x={18} y={128} width={192} height={10} rx={3} fill={lighten(wood, 0.25)} />

      {/* produce crates */}
      {PRODUCE.map(([color, x]) => (
        <G key={x}>
          {[
            [x + 10, 112],
            [x + 22, 110],
            [x + 34, 111],
            [x + 45, 113],
            [x + 16, 103],
            [x + 29, 102],
            [x + 41, 104],
            [x + 23, 95],
            [x + 35, 96],
          ].map(([cx, cy]) => (
            <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={7} fill={ids.url(color.slice(1))} />
          ))}
          <Rect x={x} y={112} width={54} height={18} rx={3} fill="#E0A868" stroke={darken('#E0A868', 0.25)} strokeWidth={1.5} />
          <Path d={`M${x + 3} 121 L${x + 51} 121`} stroke={darken('#E0A868', 0.25)} strokeWidth={1.2} />
        </G>
      ))}

      {/* striped awning with a scalloped edge */}
      {Array.from({ length: stripes }, (_, index) => {
        const top = (i: number) => 20 + i * 19;
        const bottom = (i: number) => 10 + i * 21;
        return (
          <Path
            key={index}
            d={`M${top(index)} 52 L${top(index + 1)} 52 L${bottom(index + 1)} 90 L${bottom(index)} 90Z`}
            fill={index % 2 === 0 ? red : WHITE}
          />
        );
      })}
      {Array.from({ length: stripes }, (_, index) => {
        const cx = 10 + (index + 0.5) * 21;
        return <Path key={`s${index}`} d={`M${cx - 10.5} 89 A10.5 10.5 0 0 0 ${cx + 10.5} 89Z`} fill={index % 2 === 0 ? red : WHITE} />;
      })}
      <Path d="M20 52 L210 52 L220 90 L10 90Z" fill={ids.url('awningShade')} opacity={0.12} />
      <Rect x={16} y={46} width={198} height={8} rx={4} fill={darken(wood, 0.2)} />

      {/* sign */}
      <Rect x={84} y={38} width={5} height={10} fill={darken(wood, 0.3)} />
      <Rect x={141} y={38} width={5} height={10} fill={darken(wood, 0.3)} />
      <Rect x={70} y={10} width={90} height={32} rx={9} fill={ids.url('sign')} stroke={darken('#E0A868', 0.35)} strokeWidth={2.5} />
      <Path d="M90 18 L95 18 L99 33 L120 33" stroke="#5A3A20" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M96 21 L124 21 L121 30 L99 30Z" fill="#FF8A1F" />
      <Circle cx={102} cy={37} r={2.6} fill="#5A3A20" />
      <Circle cx={117} cy={37} r={2.6} fill="#5A3A20" />
      <Circle cx={136} cy={24} r={6} fill={ids.url('F2363F')} />
      <Path d="M136 18 Q137 14 140 13" stroke="#6B3A1E" strokeWidth={1.8} fill="none" />
      <Circle cx={148} cy={30} r={5} fill={ids.url('7BD34A')} />

      {/* ground baskets */}
      <Path d="M2 172 L42 172 L38 192 L6 192Z" fill="#D9A15B" stroke={darken('#D9A15B', 0.3)} strokeWidth={1.5} />
      <Path d="M6 172 C10 160 24 158 30 170 M14 172 C20 158 34 158 40 170" stroke="#FFD43B" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Rect x={198} y={166} width={30} height={24} rx={3} fill="#E0A868" stroke={darken('#E0A868', 0.3)} strokeWidth={1.5} />
      <Ellipse cx={213} cy={162} rx={13} ry={9} fill="#3FA14A" />
      <Path d="M203 160 Q213 155 223 160 M205 165 Q213 161 221 165" stroke="#9BE07A" strokeWidth={1.6} fill="none" />
    </G>
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export const PLAYGROUND_VIEW: ViewDef = { width: 240, height: 180, viewBox: '0 0 240 180' };

export function PlaygroundArea() {
  const ids = useArtIds('pg');
  const blue = '#38B0FF';
  const purple = '#9B5CFF';
  const slide = '#FFC83D';
  return (
    <G>
      <Defs>
        <Shade id={ids.id('ground')} color="#FFD9A8" light={0.25} dark={0.08} />
        <Shade id={ids.id('roof')} color="#FF5C7A" light={0.2} dark={0.15} direction="diag" />
        <Shade id={ids.id('slide')} color={slide} light={0.35} dark={0.15} direction="diag" />
        <Shade id={ids.id('post')} color={blue} light={0.25} dark={0.2} direction="right" />
        <Ball id={ids.id('ball')} color="#FF5C7A" />
      </Defs>
      <GroundShadow cx={122} cy={156} rx={118} ry={22} opacity={0.18} />
      <Ellipse cx={120} cy={150} rx={114} ry={26} fill={ids.url('ground')} stroke="#E8B27A" strokeWidth={4} />

      {/* swing set */}
      <Path d="M146 150 L164 56 L182 150 M200 150 L218 56 L236 150" stroke={purple} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M160 56 L222 56" stroke={darken(purple, 0.2)} strokeWidth={7} strokeLinecap="round" />
      <Path d="M176 59 L176 118 M190 59 L190 118" stroke="#8C8FB0" strokeWidth={2} />
      <Rect x={171} y={116} width={24} height={6} rx={3} fill="#FF9F1C" />
      <Path d="M199 59 L194 110 M213 59 L208 110" stroke="#8C8FB0" strokeWidth={2} />
      <Rect x={189} y={108} width={24} height={6} rx={3} fill="#3CCB7F" transform="rotate(-6 201 111)" />

      {/* slide tower */}
      <Path d="M30 94 L18 150 M42 94 L30 150" stroke="#FF9F1C" strokeWidth={4} strokeLinecap="round" />
      {[106, 118, 130, 142].map((y) => {
        const t = (y - 94) / 56;
        return <Path key={y} d={`M${30 - 12 * t} ${y} L${42 - 12 * t} ${y}`} stroke="#FF9F1C" strokeWidth={3} />;
      })}
      <Rect x={30} y={64} width={7} height={88} rx={2} fill={ids.url('post')} />
      <Rect x={74} y={64} width={7} height={88} rx={2} fill={ids.url('post')} />
      <Rect x={26} y={84} width={60} height={10} rx={3} fill={slide} />
      <Path d="M31 84 L31 72 M45 84 L45 72 M59 84 L59 72 M73 84 L73 72 M29 72 L81 72" stroke={blue} strokeWidth={3} strokeLinecap="round" />
      <Path d="M22 66 L56 30 L90 66Z" fill={ids.url('roof')} />
      <Path d="M56 30 L90 66 L98 60Z" fill={darken('#FF5C7A', 0.25)} />
      <Path d="M20 67 L92 67" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      <Path d={starPath(56, 50, 6)} fill="#FFD43B" />

      {/* slide */}
      <Path d="M80 84 C110 86 116 132 152 140 L156 154 C114 148 102 104 78 100Z" fill={ids.url('slide')} />
      <Path d="M80 84 C110 86 116 132 152 140" stroke={darken(slide, 0.2)} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M86 92 C108 96 112 128 140 140" stroke="#FFFFFF" strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />

      {/* ball and bucket */}
      <Circle cx={118} cy={158} r={9} fill={ids.url('ball')} />
      <Path d="M109 158 Q118 150 127 158" stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
      <Path d="M58 150 L74 150 L71 164 L61 164Z" fill="#38B0FF" />
      <Path d="M58 150 Q66 140 74 150" stroke="#2B2350" strokeWidth={1.4} fill="none" />
    </G>
  );
}

export const BUILDING_ART: Record<LocationId, { view: ViewDef; Art: ComponentType }> = {
  feelings: { view: HOUSE_VIEW, Art: HouseOfFeelings },
  learning: { view: LEARNING_VIEW, Art: LearningCenter },
  market: { view: MARKET_VIEW, Art: MarketStall },
  playground: { view: PLAYGROUND_VIEW, Art: PlaygroundArea },
};
