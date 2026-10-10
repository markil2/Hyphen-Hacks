import { Platform, TextStyle, ViewStyle } from 'react-native';

/** Nurture palette. Cream dominates; sage, dusty blue and wood are used sparingly. */
export const colors = {
  cream: '#D8C6AC',
  creamDeep: '#CDB89B',
  creamSoft: '#E4D6C2',
  warmWhite: '#F5F0E7',
  paper: '#FBF8F2',
  charcoal: '#352F29',
  ink2: '#4F453B',
  ink3: '#6B5E50',
  line: 'rgba(53,47,41,0.14)',
  lineStrong: 'rgba(53,47,41,0.28)',
  sage: '#879783',
  sageDeep: '#55634F',
  sageWash: '#DCE0D3',
  dustyBlue: '#A9B9C6',
  blueDeep: '#4E6272',
  blueWash: '#DCE3E8',
  terracotta: '#B9826B',
  terracottaDeep: '#8E5A45',
  terracottaWash: '#EBD7CB',
  wood: '#A57E58',
  woodLight: '#C49E76',
  woodDark: '#6E5136',
  carpet: '#3E2C21',
  night: '#241B15',
  lampGlow: '#FFE2AE',
  danger: '#8E3B2E',
  dangerWash: '#F0DCD5',
} as const;

/** Lora for warm, readable headings; Nunito Sans for friendly, rounded body text. */
export const fonts = {
  display: 'Lora_600SemiBold',
  displayItalic: 'Lora_400Regular_Italic',
  displayRegular: 'Lora_400Regular',
  body: 'NunitoSans_400Regular',
  bodyMedium: 'NunitoSans_600SemiBold',
  bodySemibold: 'NunitoSans_700Bold',
} as const;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4, color: colors.charcoal },
  title: { fontFamily: fonts.display, fontSize: 25, lineHeight: 31, letterSpacing: -0.2, color: colors.charcoal },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25, color: colors.charcoal },
  lead: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25, color: colors.ink2 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.charcoal },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 16, lineHeight: 23, color: colors.charcoal },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.ink2 },
  smallStrong: { fontFamily: fonts.bodySemibold, fontSize: 14, lineHeight: 20, color: colors.charcoal },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.2, color: colors.ink2 },
  numeral: {
    fontFamily: fonts.displayRegular,
    fontSize: 44,
    lineHeight: 48,
    color: colors.charcoal,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

/** Soft, offset shadows — light comes from above, like the nursery lamp. */
export const shadow = {
  soft: Platform.select<ViewStyle>({
    web: { boxShadow: '0 6px 18px rgba(53,47,41,0.10), 0 1px 3px rgba(53,47,41,0.08)' } as ViewStyle,
    default: {
      shadowColor: '#352F29',
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  }),
  lifted: Platform.select<ViewStyle>({
    web: { boxShadow: '0 14px 36px rgba(36,27,21,0.22), 0 2px 6px rgba(36,27,21,0.12)' } as ViewStyle,
    default: {
      shadowColor: '#241B15',
      shadowOpacity: 0.22,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  }),
};

export const motion = {
  quick: 180,
  base: 280,
  camera: 620,
} as const;

/** Minimum comfortable tap target for one-handed, half-awake use. */
export const HIT = 48;
