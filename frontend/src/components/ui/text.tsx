import { Text, TextProps } from 'react-native';

import { type as typeScale } from '@/theme';

export type TextVariant = keyof typeof typeScale;

export function T({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  return <Text {...props} style={[typeScale[variant], style]} />;
}
