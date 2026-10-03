/**
 * Grown-up helpers in the world: the market grocer and the Learning Center owl.
 */
import { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { darken, lighten } from '@/utils/color';

import { Ball, GroundShadow, Shade, useArtIds } from './primitives';

export type HelperMood = 'happy' | 'excited' | 'thinking';

/** Grocer, waist up (180 × 220). The bottom edge is meant to hide behind a counter. */
export const GROCER_VIEW = { width: 180, height: 220, viewBox: '0 0 180 220' } as const;

const GROCER = {
  skin: '#E9AE84',
  hair: '#3B2418',
  shirt: '#FFF4E2',
  apron: '#2FB673',
  cap: '#2E7D5B',
};

export function Grocer({ mood = 'happy', waving = false }: { mood?: HelperMood; waving?: boolean }) {
  const ids = useArtIds('grocer');
  const skinDark = darken(GROCER.skin, 0.2);
  const eyesClosed = mood === 'excited';
  return (
    <G>
      <Defs>
        <RadialGradient id={ids.id('skin')} gradientUnits="userSpaceOnUse" cx={80} cy={82} r={70} fx={70} fy={70}>
          <Stop offset="0" stopColor={lighten(GROCER.skin, 0.28)} />
          <Stop offset="0.55" stopColor={GROCER.skin} />
          <Stop offset="1" stopColor={skinDark} />
        </RadialGradient>
        <Shade id={ids.id('shirt')} color={GROCER.shirt} light={0.3} dark={0.12} direction="diag" />
        <Shade id={ids.id('apron')} color={GROCER.apron} light={0.2} dark={0.2} direction="diag" />
        <Ball id={ids.id('cap')} color={GROCER.cap} light={0.35} />
        <Ball id={ids.id('nose')} color="#F09A7A" light={0.4} dark={0.15} />
      </Defs>

      {/* body */}
      <Path d="M28 220 C28 172 50 146 90 146 C130 146 152 172 152 220Z" fill={ids.url('shirt')} />
      <Path d="M62 150 L118 150 L122 178 L134 220 L46 220 L58 178Z" fill={ids.url('apron')} />
      <Path d="M66 152 Q80 132 90 132 Q100 132 114 152" stroke={darken(GROCER.apron, 0.15)} strokeWidth={5} fill="none" />
      <Rect x={74} y={186} width={32} height={22} rx={6} fill={darken(GROCER.apron, 0.18)} />
      <Path d="M84 186 L80 172 M90 186 L92 170" stroke="#3CCB7F" strokeWidth={4} strokeLinecap="round" />
      <Path d="M80 188 L88 188 L86 202 Z" fill="#FF8A2B" />

      {/* left arm resting on the counter */}
      <Path d="M44 170 C34 186 32 204 38 220" stroke={ids.url('shirt')} strokeWidth={24} strokeLinecap="round" fill="none" />
      {/* right arm: waving or resting */}
      {waving ? (
        <G>
          <Path d="M136 170 C146 156 150 146 152 138" stroke={ids.url('shirt')} strokeWidth={22} strokeLinecap="round" fill="none" />
          <Path d="M153 136 L158 116" stroke={GROCER.skin} strokeWidth={15} strokeLinecap="round" />
          <Circle cx={159} cy={110} r={11} fill={ids.url('skin')} />
          <Path d="M152 104 L150 96 M158 101 L158 92 M164 103 L166 95" stroke={GROCER.skin} strokeWidth={5} strokeLinecap="round" />
        </G>
      ) : (
        <Path d="M136 170 C146 186 148 204 142 220" stroke={ids.url('shirt')} strokeWidth={24} strokeLinecap="round" fill="none" />
      )}

      {/* neck and head */}
      <Rect x={78} y={124} width={24} height={26} rx={8} fill={skinDark} />
      <Ellipse cx={52} cy={96} rx={8} ry={11} fill={ids.url('skin')} />
      <Ellipse cx={128} cy={96} rx={8} ry={11} fill={ids.url('skin')} />
      <Path d="M52 92 C52 60 68 48 90 48 C112 48 128 60 128 92 C128 120 112 134 90 134 C68 134 52 120 52 92Z" fill={ids.url('skin')} />
      <Path d="M52 84 C50 94 52 104 57 108 L60 86Z M128 84 C130 94 128 104 123 108 L120 86Z" fill={GROCER.hair} />
      <Path d="M48 76 C48 50 68 36 92 36 C118 36 134 52 132 72 C120 66 104 64 90 64 C74 64 60 68 48 76Z" fill={ids.url('cap')} />
      <Path d="M46 74 C60 64 80 62 100 64 C86 68 66 74 50 82 C44 82 42 78 46 74Z" fill={darken(GROCER.cap, 0.25)} />
      <Circle cx={92} cy={38} r={3.5} fill={darken(GROCER.cap, 0.25)} />

      {/* face */}
      <Ellipse cx={66} cy={108} rx={8} ry={5} fill="#FF6B81" opacity={0.35} />
      <Ellipse cx={114} cy={108} rx={8} ry={5} fill="#FF6B81" opacity={0.35} />
      {eyesClosed ? (
        <Path d="M69 93 Q76 85 83 93 M97 93 Q104 85 111 93" stroke="#2A1A14" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      ) : (
        <G>
          <Ellipse cx={76} cy={92} rx={5} ry={6.2} fill="#2A1A14" />
          <Ellipse cx={104} cy={92} rx={5} ry={6.2} fill="#2A1A14" />
          <Circle cx={74.2} cy={89.5} r={2} fill="#FFFFFF" />
          <Circle cx={102.2} cy={89.5} r={2} fill="#FFFFFF" />
        </G>
      )}
      <Path
        d={mood === 'thinking' ? 'M67 80 Q75 77 84 81 M96 76 Q104 71 113 75' : 'M67 81 Q75 76 84 80 M96 80 Q105 76 113 81'}
        stroke={GROCER.hair}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={90} cy={104} rx={8.5} ry={7.5} fill={ids.url('nose')} />
      {mood === 'excited' ? (
        <Path d="M78 119 Q90 136 102 119 Q90 124 78 119Z" fill="#8E2C3B" />
      ) : mood === 'thinking' ? (
        <Path d="M84 123 Q91 121 97 124" stroke="#8E2C3B" strokeWidth={3} strokeLinecap="round" fill="none" />
      ) : (
        <Path d="M80 120 Q90 129 100 120" stroke="#8E2C3B" strokeWidth={3.2} strokeLinecap="round" fill="none" />
      )}
      <Path
        d="M90 111 C82 107 70 109 66 117 C64 121 68 123 70 119 C74 113 84 115 90 117 C96 115 106 113 110 119 C112 123 116 121 114 117 C110 109 98 107 90 111Z"
        fill={GROCER.hair}
      />
    </G>
  );
}

/** Professor owl for the Learning Center (160 × 180). */
export const OWL_VIEW = { width: 160, height: 180, viewBox: '0 0 160 180' } as const;

export function OwlTeacher({ mood = 'happy', wingsUp = false }: { mood?: HelperMood; wingsUp?: boolean }) {
  const ids = useArtIds('owl');
  const body = '#8C6CF0';
  const eyeY = mood === 'thinking' ? 72 : 76;
  return (
    <G>
      <Defs>
        <Ball id={ids.id('body')} color={body} light={0.35} dark={0.35} />
        <Shade id={ids.id('belly')} color="#EDE4FF" light={0.4} dark={0.08} />
        <Shade id={ids.id('wing')} color={darken(body, 0.12)} light={0.1} dark={0.25} direction="diag" />
        <Shade id={ids.id('beak')} color="#FFA62B" light={0.3} dark={0.2} />
        <Shade id={ids.id('cap')} color="#2B2D6E" light={0.2} dark={0.25} />
      </Defs>
      <GroundShadow cx={80} cy={172} rx={44} ry={7} />
      {/* feet */}
      <Path d="M62 164 l-6 8 M66 165 l0 9 M70 164 l6 8 M90 164 l-6 8 M94 165 l0 9 M98 164 l6 8" stroke="#FF9F1C" strokeWidth={4} strokeLinecap="round" />
      {/* wings */}
      <G transform={wingsUp ? 'rotate(55 30 104)' : undefined}>
        <Path d="M30 98 C10 114 10 146 34 154 C42 136 42 114 30 98Z" fill={ids.url('wing')} />
      </G>
      <G transform={wingsUp ? 'rotate(-55 130 104)' : undefined}>
        <Path d="M130 98 C150 114 150 146 126 154 C118 136 118 114 130 98Z" fill={ids.url('wing')} />
      </G>
      {/* body and belly */}
      <Path d="M80 38 C120 38 140 80 138 120 C136 156 112 170 80 170 C48 170 24 156 22 120 C20 80 40 38 80 38Z" fill={ids.url('body')} />
      <Path d="M80 92 C104 92 118 112 116 134 C114 156 98 164 80 164 C62 164 46 156 44 134 C42 112 56 92 80 92Z" fill={ids.url('belly')} />
      {[110, 124, 138, 152].map((y, row) => (
        <G key={y}>
          {[-24, -8, 8, 24].slice(row === 3 ? 1 : 0, row === 3 ? 3 : 4).map((dx) => (
            <Path key={dx} d={`M${80 + dx - 6} ${y} Q${80 + dx} ${y + 6} ${80 + dx + 6} ${y}`} stroke="#C8B6FF" strokeWidth={2} fill="none" />
          ))}
        </G>
      ))}
      {/* ear tufts and face disc */}
      <Path d="M46 50 L34 24 L62 42Z M114 50 L126 24 L98 42Z" fill={darken(body, 0.2)} />
      <Circle cx={62} cy={76} r={23} fill="#F6F0FF" />
      <Circle cx={98} cy={76} r={23} fill="#F6F0FF" />
      {mood === 'excited' ? (
        <Path d="M53 79 Q62 68 71 79 M89 79 Q98 68 107 79" stroke="#2A1A3A" strokeWidth={4} strokeLinecap="round" fill="none" />
      ) : (
        <G>
          <Circle cx={62} cy={eyeY} r={13} fill="#FFFFFF" />
          <Circle cx={98} cy={eyeY} r={13} fill="#FFFFFF" />
          <Circle cx={mood === 'thinking' ? 66 : 64} cy={eyeY - (mood === 'thinking' ? 3 : -1)} r={8} fill="#2A1A3A" />
          <Circle cx={mood === 'thinking' ? 102 : 96} cy={eyeY - (mood === 'thinking' ? 3 : -1)} r={8} fill="#2A1A3A" />
          <Circle cx={61} cy={eyeY - 3} r={3} fill="#FFFFFF" />
          <Circle cx={93} cy={eyeY - 3} r={3} fill="#FFFFFF" />
        </G>
      )}
      {/* glasses */}
      <Circle cx={62} cy={76} r={17} stroke="#F5B800" strokeWidth={3.5} fill="none" />
      <Circle cx={98} cy={76} r={17} stroke="#F5B800" strokeWidth={3.5} fill="none" />
      <Path d="M78 73 Q80 69 82 73" stroke="#F5B800" strokeWidth={3.5} fill="none" />
      {/* beak */}
      {mood === 'excited' ? (
        <G>
          <Path d="M72 94 L88 94 L80 101Z" fill={ids.url('beak')} />
          <Path d="M74 102 L86 102 L80 110Z" fill={darken('#FFA62B', 0.15)} />
        </G>
      ) : (
        <Path d="M72 94 L88 94 L80 107Z" fill={ids.url('beak')} />
      )}
      {/* graduation cap */}
      <Path d="M56 40 C56 32 104 32 104 40 L104 48 C104 52 56 52 56 48Z" fill={ids.url('cap')} />
      <Path d="M28 32 L80 14 L132 32 L80 50Z" fill={ids.url('cap')} />
      <Path d="M28 32 L80 14 L132 32" stroke={lighten('#2B2D6E', 0.3)} strokeWidth={1.5} fill="none" />
      <Circle cx={80} cy={32} r={3.2} fill="#FFC83D" />
      <Path d="M80 32 Q110 36 112 54" stroke="#FFC83D" strokeWidth={2.5} fill="none" />
      <Rect x={108} y={52} width={8} height={12} rx={3} fill="#FFC83D" />
    </G>
  );
}
