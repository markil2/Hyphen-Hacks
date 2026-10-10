import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/** A calm, neutral illustration standing in for a photo. */
export function BabyAvatar({ size = 64 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.sageWash, overflow: 'hidden' }} aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Path d="M6 64 C10 46 22 40 32 40 C42 40 54 46 58 64 Z" fill="#B7C3CD" />
        <Circle cx={32} cy={28} r={14} fill="#D7AE8A" />
        <Path d="M19 24 C21 13 43 12 45 24 C40 18 26 18 19 24 Z" fill="#8C6A4E" opacity={0.55} />
        <Path d="M25.5 29 q2.5 2 5 0 M33.5 29 q2.5 2 5 0" stroke="#5C4130" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <Path d="M29 35 q3 2 6 0" stroke="#A86F58" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
