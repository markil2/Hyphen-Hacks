import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * The monitor's camera view: looking down into the crib in infrared greys,
 * drawn in the same hand as the rooms. It's an illustration, never a real feed,
 * and it doesn't animate the baby to suggest anything about sleep.
 */
export function NightVisionFeed() {
  return (
    <View style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="nv-sheet" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6E6C67" />
            <Stop offset="1" stopColor="#8E8B84" />
          </LinearGradient>
          <LinearGradient id="nv-blanket" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#B2AEA6" />
            <Stop offset="1" stopColor="#8F8C85" />
          </LinearGradient>
          <RadialGradient id="nv-vignette" cx="50%" cy="48%" r="70%">
            <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.62" />
          </RadialGradient>
          <RadialGradient id="nv-ir" cx="48%" cy="44%" r="45%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
          <Pattern id="nv-scan" width="4" height="3" patternUnits="userSpaceOnUse">
            <Rect width="4" height="1" fill="#000" opacity="0.16" />
          </Pattern>
        </Defs>

        <Rect width="320" height="240" fill="#2B2A28" />
        {/* top rail and slats, seen from above */}
        <Rect x="0" y="0" width="320" height="34" fill="#1E1D1B" />
        {Array.from({ length: 15 }).map((_, i) => (
          <Rect key={i} x={6 + i * 22} y={0} width={9} height={34} fill="#3D3C38" />
        ))}
        <Rect x="0" y="30" width="320" height="8" fill="#4A4844" />
        {/* side rails */}
        <Path d="M0 38 L18 38 L4 240 L0 240 Z" fill="#3A3935" />
        <Path d="M320 38 L302 38 L316 240 L320 240 Z" fill="#3A3935" />

        {/* fitted sheet */}
        <Path d="M20 38 H300 L314 240 H6 Z" fill="url(#nv-sheet)" />
        <Path d="M40 60 Q160 52 284 62" stroke="#7E7B75" strokeWidth={1.4} fill="none" />

        {/* baby, swaddled, head toward the top rail */}
        <G>
          <Ellipse cx={156} cy={118} rx={30} ry={24} fill="#5E5C57" opacity={0.45} />
          {/* hair */}
          <Ellipse cx={154} cy={93} rx={25} ry={22} fill="#77746E" />
          {/* face */}
          <Ellipse cx={156} cy={102} rx={22} ry={21} fill="#C2BEB6" />
          <Path d="M144 103 q4 3 8 0 M160 103 q4 3 8 0" stroke="#5B5853" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Path d="M152 113 q4 2.4 8 0" stroke="#8A867F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <Ellipse cx={142} cy={110} rx={4} ry={2.6} fill="#D4CFC6" opacity={0.6} />
        </G>
        {/* blanket */}
        <Path
          d="M60 130 Q100 118 156 126 Q220 120 270 134 L292 240 H28 Z"
          fill="url(#nv-blanket)"
        />
        <Path d="M70 158 Q150 146 262 160 M60 196 Q160 182 280 198" stroke="#9C9891" strokeWidth={2} fill="none" />
        <Path d="M64 132 Q110 122 156 130 Q214 124 268 138" stroke="#C8C4BC" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* a little hand resting on the blanket edge */}
        <Ellipse cx={124} cy={134} rx={9} ry={6.5} fill="#BAB6AE" />

        {/* plush bunny in the corner */}
        <G>
          <Ellipse cx={262} cy={104} rx={16} ry={18} fill="#9E9A93" />
          <Circle cx={262} cy={80} r={11} fill="#A9A59E" />
          <Ellipse cx={256} cy={62} rx={3.6} ry={10} fill="#A9A59E" transform="rotate(-10 256 62)" />
          <Ellipse cx={268} cy={62} rx={3.6} ry={10} fill="#9E9A93" transform="rotate(10 268 62)" />
          <Circle cx={258} cy={79} r={1.2} fill="#55524D" />
          <Circle cx={266} cy={79} r={1.2} fill="#55524D" />
        </G>

        <Rect width="320" height="240" fill="url(#nv-ir)" />
        <Rect width="320" height="240" fill="url(#nv-scan)" />
        <Rect width="320" height="240" fill="url(#nv-vignette)" />
      </Svg>
    </View>
  );
}
