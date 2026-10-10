import { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SensorType,
  SharedValue,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { easeInOut, useCalmMotion } from '@/lib/motion';
import { motion } from '@/theme';

import { DESIGN_H, DESIGN_W, Rect, StageContext } from './geometry';

export interface RoomLayer {
  /** 0 = the wall, 1 = closest to the camera. Drives parallax distance. */
  depth: number;
  node: ReactNode;
}

export interface RoomArt {
  id: string;
  defs: ReactNode;
  layers: RoomLayer[];
  /** Lighting drawn above the furniture; its opacity follows `light`. */
  glow?: ReactNode;
  /** Colour that continues below the canvas on tall screens. */
  floor: string;
}

export interface SceneHandle {
  /** Glide the camera toward a rect, then call `then` (immediately when motion is reduced). */
  focusOn(target: Rect, then?: () => void): void;
  reset(animated?: boolean): void;
}

const MAX_TILT = 9;

/** Gravity-based tilt on devices; on the web, a gentle drag stands in for it. */
const useTilt: () => { x: SharedValue<number>; y: SharedValue<number> } =
  Platform.OS === 'web'
    ? () => ({ x: useSharedValue(0), y: useSharedValue(0) })
    : () => {
        const sensor = useAnimatedSensor(SensorType.GRAVITY, { interval: 32 });
        const x = useDerivedValue(() => Math.max(-1, Math.min(1, sensor.sensor.value.x / 9.8)));
        const y = useDerivedValue(() => Math.max(-1, Math.min(1, (sensor.sensor.value.z + 4) / 9.8)));
        return { x, y };
      };

export const RoomScene = forwardRef<
  SceneHandle,
  {
    art: RoomArt;
    /** 0–1 lamp brightness; defaults to fully lit. */
    light?: SharedValue<number>;
    /** Hotspots and custom overlays, positioned in design units via useStage(). */
    children?: ReactNode;
    /** Vertical design-unit offset so the interesting part of the room sits in view. */
    focusY?: number;
    /** Extra zoom over fit-to-width; the canvas stays centred horizontally. */
    zoom?: number;
    accessibilityLabel: string;
  }
>(function RoomScene({ art, light, children, focusY = 0, zoom = 1, accessibilityLabel }, ref) {
  const calm = useCalmMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const s = (size.w / DESIGN_W) * zoom;
  const stageW = DESIGN_W * s;
  const stageH = DESIGN_H * s;
  const baseX = -(stageW - size.w) / 2;
  // Shift the canvas up so `focusY` lands at the top, but never past the canvas bottom.
  const baseY = -Math.min(focusY * s, Math.max(0, stageH - size.h));
  const viewH = Math.max(stageH, size.h - baseY);

  const tilt = useTilt();
  const drag = { x: useSharedValue(0), y: useSharedValue(0) };
  const cam = { k: useSharedValue(1), tx: useSharedValue(0), ty: useSharedValue(0) };
  const fallbackLight = useSharedValue(1);
  const lamp = light ?? fallbackLight;

  useImperativeHandle(
    ref,
    () => ({
      focusOn(target, then) {
        if (!size.w || calm) {
          then?.();
          return;
        }
        const k = Math.min(3, Math.max(1.4, Math.min((size.w * 0.92) / (target.w * s), (size.h * 0.7) / (target.h * s))));
        // Transform origin is the stage centre; solve for the translation that lands
        // the target's centre in the middle of the viewport.
        const cx = stageW / 2;
        const cy = viewH / 2;
        const qx = (target.x + target.w / 2) * s;
        const qy = (target.y + target.h / 2) * s;
        const config = { duration: motion.camera, easing: easeInOut };
        cam.k.value = withTiming(k, config);
        cam.tx.value = withTiming(size.w / 2 - baseX - cx - k * (qx - cx), config);
        cam.ty.value = withTiming(size.h / 2 - baseY - cy - k * (qy - cy), config, (finished) => {
          if (finished && then) scheduleOnRN(then);
        });
      },
      reset(animated = true) {
        const config = { duration: animated && !calm ? motion.camera : 0, easing: easeInOut };
        cam.k.value = withTiming(1, config);
        cam.tx.value = withTiming(0, config);
        cam.ty.value = withTiming(0, config);
      },
    }),
    // Shared values are stable; recompute only when layout or motion preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size.w, size.h, calm, baseX, baseY, stageW, viewH, s],
  );

  const pan = Gesture.Pan()
    .enabled(!calm)
    .minDistance(10)
    .onUpdate((e) => {
      drag.x.value = Math.max(-1, Math.min(1, e.translationX / 160));
      drag.y.value = Math.max(-1, Math.min(1, e.translationY / 220));
    })
    .onEnd(() => {
      drag.x.value = withSpring(0, { damping: 18 });
      drag.y.value = withSpring(0, { damping: 18 });
    });

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cam.tx.value }, { translateY: cam.ty.value }, { scale: cam.k.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  return (
    <View style={[styles.viewport, { backgroundColor: art.floor }]} onLayout={onLayout}>
      {size.w > 0 ? (
        <GestureDetector gesture={pan}>
          <Animated.View
            accessible={false}
            style={[{ width: stageW, height: viewH, top: baseY, left: baseX }, cameraStyle]}>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={accessibilityLabel}
              style={StyleSheet.absoluteFill}
            />
            {art.layers.map((layer, i) => (
              <ParallaxLayer key={i} depth={layer.depth} tilt={tilt} drag={drag} calm={calm}>
                <Svg width={stageW} height={stageH} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
                  <Defs>{art.defs}</Defs>
                  {layer.node}
                </Svg>
              </ParallaxLayer>
            ))}
            {art.glow ? (
              <GlowLayer light={lamp} tilt={tilt} drag={drag} calm={calm}>
                <Svg width={stageW} height={stageH} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
                  <Defs>{art.defs}</Defs>
                  {art.glow}
                </Svg>
              </GlowLayer>
            ) : null}
            <NightVeil light={lamp} />
            <StageContext.Provider value={{ s }}>
              <ParallaxLayer depth={0.55} tilt={tilt} drag={drag} calm={calm} interactive>
                {children}
              </ParallaxLayer>
            </StageContext.Provider>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
});

function ParallaxLayer({
  depth,
  tilt,
  drag,
  calm,
  children,
  interactive = false,
}: {
  depth: number;
  tilt: { x: SharedValue<number>; y: SharedValue<number> };
  drag: { x: SharedValue<number>; y: SharedValue<number> };
  calm: boolean;
  children: ReactNode;
  interactive?: boolean;
}) {
  const style = useAnimatedStyle(() => {
    if (calm) return { transform: [{ translateX: 0 }, { translateY: 0 }] };
    const x = Math.max(-1, Math.min(1, tilt.x.value + drag.x.value));
    const y = Math.max(-1, Math.min(1, tilt.y.value * 0.5 + drag.y.value));
    return { transform: [{ translateX: -x * MAX_TILT * depth }, { translateY: -y * MAX_TILT * 0.6 * depth }] };
  });
  return (
    <Animated.View pointerEvents={interactive ? 'box-none' : 'none'} style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

function GlowLayer({
  light,
  children,
  ...parallax
}: {
  light: SharedValue<number>;
  tilt: { x: SharedValue<number>; y: SharedValue<number> };
  drag: { x: SharedValue<number>; y: SharedValue<number> };
  calm: boolean;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + light.value * 0.75 }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <ParallaxLayer depth={0.5} {...parallax}>
        {children}
      </ParallaxLayer>
    </Animated.View>
  );
}

/** Darkens the room as the lamp dims, so the change reads without colour alone. */
function NightVeil({ light }: { light: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: (1 - light.value) * 0.42 }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil, style]} />;
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' },
  veil: { backgroundColor: '#140D08' },
});
