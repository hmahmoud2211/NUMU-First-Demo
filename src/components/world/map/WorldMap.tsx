/**
 * The explorable town. Scenery is split into parallax layers; the town layer
 * holds depth-sorted sprites (buildings, trees, the avatar). A camera wrapper
 * zooms towards a building before its mini-game opens and back out on return.
 */
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, Ellipse, Path } from 'react-native-svg';

import { BUILDING_ART } from '@/components/world/art/Buildings';
import { GameIcon, LOCATION_ICONS } from '@/components/world/art/Icons';
import { starPath, type Expression, type Pose } from '@/components/world/art/KidCharacter';
import {
  BUSH_VIEW,
  Bush,
  CLOUD_VIEW,
  Cloud,
  FOUNTAIN_VIEW,
  FountainBase,
  FountainWater,
  LAMP_VIEW,
  LampPost,
  PINE_VIEW,
  PineTree,
  ROUND_TREE_VIEW,
  RoundTree,
} from '@/components/world/art/Nature';
import { Glow } from '@/components/world/art/primitives';
import {
  ForegroundLayer,
  HillsLayer,
  LAYER_VIEWBOX,
  MountainLayer,
  SkyLayer,
  TownGroundLayer,
  WORLD,
} from '@/components/world/art/WorldLayers';
import { Bob, Drift, Rise, Sway, Twinkle } from '@/components/world/motion/Motion';
import { LivingKid } from '@/components/world/motion/LivingKid';
import { PLAYER_LOOK } from '@/components/world/art/KidCharacter';
import { LOCATION_ORDER, LOCATIONS } from '@/config/worldConfig';
import { useLoop } from '@/hooks/useLoop';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { Equipment, LocationId, QuestId } from '@/types/world';

import {
  AVATAR,
  CHIMNEY,
  DECOR,
  FOUNTAIN,
  PARALLAX,
  SPOTS,
  clampToWalkable,
  depthScale,
  spotHeight,
} from './worldLayout';

const W = WORLD.width;
const H = WORLD.height;
const M = WORLD.margin;
const ZOOM = 2.6;
/** How far (world units) the town starts below its resting place in the intro. */
const INTRO_LIFT = 330;

export type WorldMapHandle = {
  travelTo: (id: LocationId) => void;
  returnFrom: (id: LocationId, celebrate: boolean) => void;
  playIntro: () => void;
};

type WorldMapProps = {
  ref?: Ref<WorldMapHandle>;
  equipped: Equipment;
  questsDone: QuestId[];
  /** Start with the camera tilted up at the sky, waiting for playIntro(). */
  introPending: boolean;
  interactive: boolean;
  onEnter: (id: LocationId) => void;
};

type Layout = {
  s: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  maxPanX: number;
  maxPanY: number;
  viewW: number;
  viewH: number;
};

const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

function useBuildingScales() {
  const [scales] = useState(
    () => Object.fromEntries(LOCATION_ORDER.map((id) => [id, new Animated.Value(1)])) as Record<LocationId, Animated.Value>,
  );
  return scales;
}

function FountainSprite({ s }: { s: number }) {
  const width = FOUNTAIN.width * s;
  const height = (width * FOUNTAIN_VIEW.height) / FOUNTAIN_VIEW.width;
  const pulse = useLoop(700);
  const ripple = useLoop(2200, { pingPong: false });
  const ripple2 = useLoop(2200, { pingPong: false, delay: 1100 });
  const scaleY = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.04] });
  const ring = (t: Animated.Value) => ({
    opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] }),
    transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.15] }) }],
  });
  return (
    <View style={{ width, height }} pointerEvents="none">
      <Svg width={width} height={height} viewBox={FOUNTAIN_VIEW.viewBox}>
        <FountainBase />
      </Svg>
      {[ripple, ripple2].map((t, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ripple,
            { left: width * 0.2, top: height * 0.7, width: width * 0.6, height: height * 0.2, borderRadius: width },
            ring(t),
          ]}
        />
      ))}
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: '50% 75%', transform: [{ scaleY }] }]}>
        <Svg width={width} height={height} viewBox={FOUNTAIN_VIEW.viewBox}>
          <FountainWater />
        </Svg>
      </Animated.View>
      {[0, 500, 1000].map((delay, index) => (
        <Rise
          key={delay}
          delay={delay}
          duration={1500}
          distance={height * 0.18}
          style={[styles.droplet, { left: width * (0.42 + index * 0.06), top: height * 0.2 }]}
        >
          <View style={[styles.dropletDot, { width: 4 * s + 2, height: 4 * s + 2 }]} />
        </Rise>
      ))}
    </View>
  );
}

function RiverShimmer({ s }: { s: number }) {
  const t = useLoop(2600);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-8 * s, 8 * s] });
  const opacity = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.9, 0.3] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, transform: [{ translateX }] }]}>
      <Svg width={W * s} height={H * s} viewBox={`0 0 ${W} ${H}`}>
        {['M40 470 q12 -4 24 0', 'M210 482 q12 -4 24 0', 'M360 462 q14 -4 28 0', 'M470 480 q12 -4 24 0', 'M560 470 q10 -3 20 0'].map((d) => (
          <Path key={d} d={d} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Butterfly({ color }: { color: string }) {
  const flap = useLoop(180);
  const scaleX = flap.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] });
  return (
    <Animated.View style={{ transform: [{ scaleX }] }}>
      <Svg width={18} height={14} viewBox="0 0 18 14">
        <Ellipse cx={5} cy={5} rx={4.5} ry={4} fill={color} />
        <Ellipse cx={13} cy={5} rx={4.5} ry={4} fill={color} />
        <Ellipse cx={6} cy={10} rx={3} ry={2.6} fill={color} opacity={0.8} />
        <Ellipse cx={12} cy={10} rx={3} ry={2.6} fill={color} opacity={0.8} />
        <Path d="M9 2 L9 13" stroke="#2B2350" strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

function SelectionGlow({ width }: { width: number }) {
  return (
    <Twinkle duration={700} style={[styles.glow, { width: width * 1.2, height: width * 0.42, left: -width * 0.1, bottom: -width * 0.12 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 40">
        <Defs>
          <Glow id="numu-select-glow" color="#FFE45C" opacity={0.95} />
        </Defs>
        <Ellipse cx={50} cy={20} rx={50} ry={20} fill="url(#numu-select-glow)" />
      </Svg>
    </Twinkle>
  );
}

function RewardBurst({ s }: { s: number }) {
  return (
    <View pointerEvents="none" style={styles.burst}>
      {[-36, -12, 12, 36, 0].map((dx, index) => (
        <Rise key={dx} delay={index * 180} duration={1600} distance={90 * s} style={{ position: 'absolute', left: dx * s - 14 }}>
          <GameIcon name="star" size={28} />
        </Rise>
      ))}
    </View>
  );
}

function place(s: number, x: number, base: number, width: number, height: number, z = base): ViewStyle {
  return {
    position: 'absolute',
    left: (x - width / 2) * s,
    top: (base - height) * s,
    width: width * s,
    height: height * s,
    zIndex: Math.round(z),
  };
}

const LAYER_ART = {
  sky: SkyLayer,
  mountains: MountainLayer,
  hills: HillsLayer,
  town: TownGroundLayer,
  front: ForegroundLayer,
};

/** One static parallax layer. Memoised: it only redraws when the screen size changes. */
const SceneryLayer = memo(function SceneryLayer({ s, layer }: { s: number; layer: keyof typeof LAYER_ART }) {
  const Art = LAYER_ART[layer];
  return (
    <Svg width={(W + M * 2) * s} height={H * s} viewBox={LAYER_VIEWBOX} style={{ position: 'absolute', left: -M * s, top: 0 }}>
      <Art />
    </Svg>
  );
});

const CLOUDS = [
  { y: 150, w: 150, phase: 0.15, duration: 90000 },
  { y: 236, w: 110, phase: 0.55, duration: 70000 },
  { y: 300, w: 90, phase: 0.85, duration: 80000 },
];

const Clouds = memo(function Clouds({ s }: { s: number }) {
  return CLOUDS.map((cloud) => (
    <Drift
      key={cloud.y}
      from={-260 * s}
      to={(W + 120) * s}
      phase={cloud.phase}
      duration={cloud.duration}
      style={{ position: 'absolute', left: 0, top: cloud.y * s }}
    >
      <Svg width={cloud.w * s} height={(cloud.w * s * CLOUD_VIEW.height) / CLOUD_VIEW.width} viewBox={CLOUD_VIEW.viewBox}>
        <Cloud />
      </Svg>
    </Drift>
  ));
});

const SPARKLES = [
  [300, 600],
  [120, 470],
  [480, 500],
  [470, 690],
  [210, 770],
];

/** Ground, trees, fountain and ambient life in the town layer (everything that never changes). */
const TownDecor = memo(function TownDecor({ s }: { s: number }) {
  return (
    <>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <SceneryLayer s={s} layer="town" />
        <RiverShimmer s={s} />
      </View>

      {DECOR.map((item, index) => {
        const view = item.kind === 'tree' ? ROUND_TREE_VIEW : item.kind === 'pine' ? PINE_VIEW : item.kind === 'bush' ? BUSH_VIEW : LAMP_VIEW;
        const height = (item.width * view.height) / view.width;
        const art =
          item.kind === 'tree' ? (
            <RoundTree color={item.color} fruit={item.fruit} />
          ) : item.kind === 'pine' ? (
            <PineTree color={item.color} />
          ) : item.kind === 'bush' ? (
            <Bush color={item.color} flowers={item.flowers} />
          ) : (
            <LampPost />
          );
        const sprite = (
          <Svg width={item.width * s} height={height * s} viewBox={view.viewBox}>
            {art}
          </Svg>
        );
        return item.kind === 'tree' || item.kind === 'pine' ? (
          <Sway key={index} pointerEvents="none" style={place(s, item.x, item.base, item.width, height)} duration={2800 + index * 230} delay={index * 170} degrees={1.6}>
            {sprite}
          </Sway>
        ) : (
          <View key={index} pointerEvents="none" style={place(s, item.x, item.base, item.width, height)}>
            {sprite}
          </View>
        );
      })}

      <View pointerEvents="none" style={place(s, FOUNTAIN.x, FOUNTAIN.base, FOUNTAIN.width, (FOUNTAIN.width * FOUNTAIN_VIEW.height) / FOUNTAIN_VIEW.width)}>
        <FountainSprite s={s} />
      </View>

      {/* chimney smoke */}
      {[0, 1000, 2000].map((delay) => (
        <Rise
          key={delay}
          pointerEvents="none"
          delay={delay}
          duration={3000}
          distance={46 * s}
          style={{ position: 'absolute', left: (CHIMNEY.x - 8) * s, top: (CHIMNEY.y - 12) * s, zIndex: 600 }}
        >
          <View style={[styles.smoke, { width: 16 * s, height: 16 * s, borderRadius: 8 * s }]} />
        </Rise>
      ))}

      {/* butterflies over the flower beds */}
      <Bob duration={1300} distance={10 * s} pointerEvents="none" style={{ position: 'absolute', left: 236 * s, top: 588 * s, zIndex: 900 }}>
        <Butterfly color="#FF8AB5" />
      </Bob>
      <Bob duration={1500} delay={400} distance={12 * s} pointerEvents="none" style={{ position: 'absolute', left: 528 * s, top: 640 * s, zIndex: 900 }}>
        <Butterfly color="#FFD43B" />
      </Bob>

      {SPARKLES.map(([x, y], index) => (
        <Twinkle key={`${x}-${y}`} delay={index * 260} duration={1100 + index * 120} pointerEvents="none" style={{ position: 'absolute', left: x * s, top: y * s, zIndex: 2500 }}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4Z" fill="#FFFBE0" />
          </Svg>
        </Twinkle>
      ))}
    </>
  );
});

export function WorldMap({ ref, equipped, questsDone, introPending, interactive, onEnter }: WorldMapProps) {
  const rootRef = useRef<View>(null);
  const rootOffset = useRef({ x: 0, y: 0 });
  const [layout, setLayout] = useState<Layout | null>(null);
  const layoutRef = useRef<Layout | null>(null);

  const [pan] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const panRef = useRef({ x: 0, y: 0 });
  const [zoom] = useState(() => new Animated.Value(0));
  const [flash] = useState(() => new Animated.Value(0));
  const [intro] = useState(() => new Animated.Value(introPending ? 1 : 0));
  const [pos] = useState(() => new Animated.ValueXY(AVATAR.start));
  const posRef = useRef<{ x: number; y: number }>({ ...AVATAR.start });
  const scales = useBuildingScales();

  const busyRef = useRef(false);
  const interactiveRef = useRef(interactive);
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  const [focus, setFocus] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<LocationId | null>(null);
  const [walking, setWalking] = useState(false);
  const [walkDir, setWalkDir] = useState(1);
  const [avatarZ, setAvatarZ] = useState<number>(AVATAR.start.y);
  const [pose, setPose] = useState<Pose>('rest');
  const [expression, setExpression] = useState<Expression>('happy');
  const [hopKey, setHopKey] = useState(0);
  const [burst, setBurst] = useState<{ id: LocationId; key: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: viewW, height: viewH } = event.nativeEvent.layout;
    const s = Math.max(viewH / H, viewW / W);
    const width = W * s;
    const height = H * s;
    const offsetX = (viewW - width) / 2;
    const offsetY = (viewH - height) / 2;
    const next = { s, width, height, offsetX, offsetY, maxPanX: Math.max(0, -offsetX), maxPanY: Math.max(0, -offsetY), viewW, viewH };
    layoutRef.current = next;
    setLayout(next);
    rootRef.current?.measureInWindow((x, y) => {
      rootOffset.current = { x, y };
    });
  }, []);

  // --- avatar movement ------------------------------------------------------

  const walkTo = useCallback(
    (target: { x: number; y: number }, onArrive?: () => void, arriveIfInterrupted = false) => {
      pos.stopAnimation((from) => {
        const dx = target.x - from.x;
        const distance = Math.hypot(dx, target.y - from.y);
        posRef.current = target;
        setAvatarZ(Math.round(target.y));
        if (distance < 4) {
          onArrive?.();
          return;
        }
        setWalkDir(dx < 0 ? -1 : 1);
        setWalking(true);
        Animated.timing(pos, {
          toValue: target,
          duration: Math.min(850, Math.max(300, distance * 3)),
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          setWalking(false);
          if (finished) {
            onArrive?.();
          } else if (arriveIfInterrupted) {
            pos.setValue(target);
            onArrive?.();
          }
        });
      });
    },
    [pos],
  );

  const focusOn = useCallback((id: LocationId) => {
    const L = layoutRef.current;
    if (!L) return;
    const spot = SPOTS[id];
    const centerY = spot.base - spotHeight(id) * 0.55;
    setFocus({
      x: L.offsetX + panRef.current.x + spot.x * L.s - L.viewW / 2,
      y: L.offsetY + panRef.current.y + centerY * L.s - L.viewH * 0.48,
    });
  }, []);

  const travelTo = useCallback(
    (id: LocationId) => {
      if (busyRef.current || !layoutRef.current) return;
      busyRef.current = true;
      setSelected(id);
      setHopKey((key) => key + 1);
      Animated.spring(scales[id], { toValue: 1.12, friction: 5, tension: 160, useNativeDriver: true }).start();
      // A child should never be left stuck on the map: if travel stalls for
      // any reason, put everything back so they can tap again.
      const watchdog = setTimeout(() => {
        if (!busyRef.current) return;
        busyRef.current = false;
        setSelected(null);
        scales[id].setValue(1);
        zoom.setValue(0);
        flash.setValue(0);
      }, 4000);
      timers.current.push(watchdog);
      walkTo(
        SPOTS[id].approach,
        () => {
          focusOn(id);
          // Start on the next frame so the zoom uses the new focus point.
          requestAnimationFrame(() => {
            Animated.parallel([
              Animated.timing(zoom, { toValue: 1, duration: 750, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
              Animated.sequence([
                Animated.delay(380),
                Animated.timing(flash, { toValue: 1, duration: 370, useNativeDriver: true }),
              ]),
            ]).start(() => {
              clearTimeout(watchdog);
              onEnter(id);
            });
          });
        },
        true,
      );
    },
    [flash, focusOn, onEnter, scales, walkTo, zoom],
  );

  const returnFrom = useCallback(
    (id: LocationId, celebrate: boolean) => {
      busyRef.current = true;
      const approach = SPOTS[id].approach;
      pos.setValue(approach);
      posRef.current = { ...approach };
      setAvatarZ(approach.y);
      setSelected(null);
      scales[id].setValue(1);
      focusOn(id);
      zoom.setValue(1);
      flash.setValue(1);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(zoom, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start(() => {
          busyRef.current = false;
          if (!celebrate) return;
          setPose('cheer');
          setExpression('excited');
          setHopKey((key) => key + 1);
          setBurst({ id, key: Date.now() });
          later(2200, () => {
            setPose('rest');
            setExpression('happy');
            setBurst(null);
          });
        });
      });
    },
    [flash, focusOn, later, pos, scales, zoom],
  );

  const playIntro = useCallback(() => {
    busyRef.current = true;
    Animated.timing(intro, { toValue: 0, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      busyRef.current = false;
      setPose('wave');
      setHopKey((key) => key + 1);
      later(1600, () => setPose('rest'));
    });
  }, [intro, later]);

  useImperativeHandle(ref, () => ({ travelTo, returnFrom, playIntro }), [travelTo, returnFrom, playIntro]);

  // --- gestures: drag to look around, tap the ground to walk --------------------

  const panStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const canDrag = () => interactiveRef.current && !busyRef.current;
  const movedFromStart = (event: GestureResponderEvent) => ({
    dx: event.nativeEvent.pageX - touchStart.current.x,
    dy: event.nativeEvent.pageY - touchStart.current.y,
  });
  const responderProps = {
    // Remember where every touch starts, without claiming it, so drags that
    // begin on a building can still pan the map.
    onStartShouldSetResponderCapture: (event: GestureResponderEvent) => {
      touchStart.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
      return false;
    },
    onStartShouldSetResponder: canDrag,
    onMoveShouldSetResponderCapture: (event: GestureResponderEvent) => {
      const { dx, dy } = movedFromStart(event);
      return canDrag() && (Math.abs(dx) > 10 || Math.abs(dy) > 10);
    },
    onResponderGrant: () => {
      panStart.current = { ...panRef.current };
    },
    onResponderMove: (event: GestureResponderEvent) => {
      const L = layoutRef.current;
      if (!L) return;
      const { dx, dy } = movedFromStart(event);
      const next = { x: clamp(panStart.current.x + dx, L.maxPanX), y: clamp(panStart.current.y + dy, L.maxPanY) };
      panRef.current = next;
      pan.setValue(next);
    },
    onResponderRelease: (event: GestureResponderEvent) => {
      const L = layoutRef.current;
      const { dx, dy } = movedFromStart(event);
      if (!L || Math.abs(dx) > 6 || Math.abs(dy) > 6) return;
      // A tap on open ground: walk there.
      const wx = (event.nativeEvent.pageX - rootOffset.current.x - L.offsetX - panRef.current.x) / L.s;
      const wy = (event.nativeEvent.pageY - rootOffset.current.y - L.offsetY - panRef.current.y) / L.s;
      if (wy < 600) return;
      walkTo(clampToWalkable(wx, wy));
    },
    onResponderTerminationRequest: () => true,
  };

  // --- derived animated styles ----------------------------------------------

  const layerStyle = useCallback(
    (factor: number): Animated.WithAnimatedObject<ViewStyle> | null => {
      if (!layout) return null;
      return {
        position: 'absolute',
        left: layout.offsetX,
        top: layout.offsetY,
        width: layout.width,
        height: layout.height,
        transform: [
          { translateX: Animated.multiply(pan.x, factor) },
          {
            translateY: Animated.add(Animated.multiply(pan.y, factor), Animated.multiply(intro, INTRO_LIFT * layout.s * factor)),
          },
        ],
      };
    },
    [layout, pan, intro],
  );

  const cameraStyle = useMemo(
    () => ({
      transform: [
        { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, -focus.x * ZOOM] }) },
        { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, -focus.y * ZOOM] }) },
        {
          scale: Animated.multiply(
            zoom.interpolate({ inputRange: [0, 1], outputRange: [1, ZOOM] }),
            intro.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }),
          ),
        },
      ],
    }),
    [focus, zoom, intro],
  );

  const labelOpacity = useMemo(() => intro.interpolate({ inputRange: [0, 0.25], outputRange: [1, 0], extrapolate: 'clamp' }), [intro]);
  const walkBounce = useLoop(170, { enabled: walking });
  const avatarStyle = useMemo(() => {
    if (!layout) return null;
    const { s } = layout;
    const w = AVATAR.width * s;
    const h = w * 1.25;
    return {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: w,
      height: h,
      zIndex: avatarZ,
      transformOrigin: '50% 100%',
      transform: [
        { translateX: Animated.add(Animated.multiply(pos.x, s), -w / 2) },
        { translateY: Animated.add(Animated.multiply(pos.y, s), -h) },
        { translateY: walkBounce.interpolate({ inputRange: [0, 1], outputRange: [0, -5 * s] }) },
        { rotate: walkBounce.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${walkDir * 4}deg`] }) },
        {
          scale: pos.y.interpolate({
            inputRange: [500, 560, 860, 920],
            outputRange: [depthScale(500), depthScale(560), depthScale(860), depthScale(920)],
          }),
        },
      ],
    };
  }, [layout, pos, avatarZ, walkBounce, walkDir]);

  if (!layout) {
    return <View ref={rootRef} style={styles.root} onLayout={onLayout} />;
  }

  const { s } = layout;

  return (
    <View ref={rootRef} style={styles.root} onLayout={onLayout} {...responderProps}>
      <Animated.View style={[StyleSheet.absoluteFill, cameraStyle]}>
        {/* sky */}
        <Animated.View pointerEvents="none" style={layerStyle(PARALLAX.sky)}>
          <SceneryLayer s={s} layer="sky" />
        </Animated.View>

        {/* mountains and clouds */}
        <Animated.View pointerEvents="none" style={layerStyle(PARALLAX.mountains)}>
          <SceneryLayer s={s} layer="mountains" />
          <Clouds s={s} />
        </Animated.View>

        {/* hills, castle and village */}
        <Animated.View pointerEvents="none" style={layerStyle(PARALLAX.hills)}>
          <SceneryLayer s={s} layer="hills" />
        </Animated.View>

        {/* town */}
        <Animated.View style={layerStyle(PARALLAX.town)} pointerEvents="box-none">
          <TownDecor s={s} />

          {/* buildings */}
          {LOCATION_ORDER.map((id) => {
            const spot = SPOTS[id];
            const height = spotHeight(id);
            const { view, Art } = BUILDING_ART[id];
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`Go to the ${LOCATIONS[id].name}`}
                onPress={() => travelTo(id)}
                onPressIn={() => Animated.spring(scales[id], { toValue: 1.06, friction: 5, useNativeDriver: true }).start()}
                onPressOut={() => {
                  if (!busyRef.current) Animated.spring(scales[id], { toValue: 1, friction: 4, useNativeDriver: true }).start();
                }}
                style={place(s, spot.x, spot.base, spot.width, height)}
              >
                <Animated.View style={{ flex: 1, transformOrigin: '50% 100%', transform: [{ scale: scales[id] }] }}>
                  {selected === id ? <SelectionGlow width={spot.width * s} /> : null}
                  <Svg width={spot.width * s} height={height * s} viewBox={view.viewBox}>
                    <Art />
                  </Svg>
                </Animated.View>
              </Pressable>
            );
          })}

          {/* the player */}
          {avatarStyle ? (
            <Animated.View pointerEvents="none" style={avatarStyle}>
              <LivingKid
                width={AVATAR.width * s}
                look={PLAYER_LOOK}
                equipped={equipped}
                pose={pose}
                expression={expression}
                hopKey={hopKey}
                accessibilityLabel="You"
              />
            </Animated.View>
          ) : null}

          {/* floating labels */}
          {LOCATION_ORDER.map((id, index) => {
            const spot = SPOTS[id];
            const top = spot.base - spotHeight(id);
            const done = questsDone.includes(LOCATIONS[id].quest);
            return (
              <Bob
                key={id}
                delay={index * 300}
                duration={1500}
                distance={4}
                pointerEvents="box-none"
                style={[styles.labelSlot, { left: (spot.x + spot.labelOffset) * s - 70, top: top * s - 30, zIndex: 3000, opacity: labelOpacity }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${LOCATIONS[id].name}${done ? ', quest done' : ', quest waiting'}`}
                  onPress={() => travelTo(id)}
                  style={[styles.label, gameShadow.soft, { borderBottomColor: LOCATIONS[id].color }]}
                >
                  <GameIcon name={LOCATION_ICONS[id]} size={24} />
                  <Text style={styles.labelText} numberOfLines={2}>
                    {LOCATIONS[id].name}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: done ? gameColors.green : gameColors.gold }]}>
                    {done ? (
                      <Svg width={12} height={12} viewBox="0 0 12 12">
                        <Path d="M2 6.5 L5 9 L10 3" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    ) : (
                      <Svg width={12} height={12} viewBox="0 0 12 12">
                        <Path d={starPath(6, 6.5, 5.6)} fill="#FFFFFF" />
                      </Svg>
                    )}
                  </View>
                </Pressable>
              </Bob>
            );
          })}

          {burst ? (
            <View
              key={burst.key}
              pointerEvents="none"
              style={{ position: 'absolute', left: SPOTS[burst.id].x * s, top: (SPOTS[burst.id].base - spotHeight(burst.id) * 0.6) * s, zIndex: 4000 }}
            >
              <RewardBurst s={s} />
            </View>
          ) : null}
        </Animated.View>

        {/* foreground leaves */}
        <Animated.View pointerEvents="none" style={layerStyle(PARALLAX.front)}>
          <SceneryLayer s={s} layer="front" />
        </Animated.View>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, { opacity: flash }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#3E9BF0',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  droplet: {
    position: 'absolute',
  },
  dropletDot: {
    borderRadius: 10,
    backgroundColor: '#E6F8FF',
  },
  smoke: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  glow: {
    position: 'absolute',
  },
  burst: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  labelSlot: {
    position: 'absolute',
    width: 140,
    alignItems: 'center',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 128,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 3,
  },
  labelText: {
    ...gameType.label,
    fontFamily: gameType.heading.fontFamily,
    fontSize: 13,
    lineHeight: 15,
    color: gameColors.ink,
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: gameColors.white,
  },
  flash: {
    backgroundColor: '#FFFDF4',
  },
});
