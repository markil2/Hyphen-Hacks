import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { Icon } from '@/components/icons';
import { StatusBadge, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius, space } from '@/theme';
import type { Product } from '@/types';

const LABELS: Record<string, string> = { formula: 'Formula', solids: 'Solids & baby food', 'baby-food': 'Baby food' };
export const categoryLabel = (c: string) => LABELS[c] ?? c.replace(/[_-]/g, ' ').replace(/^\w/, (x) => x.toUpperCase());

/** Placeholder artwork in the pantry's style until real product images are supplied. */
export function ProductArt({ category, size = 64 }: { category: string; size?: number }) {
  const bg = category === 'formula' ? colors.blueWash : category === 'solids' || category === 'baby-food' ? colors.terracottaWash : colors.sageWash;
  return (
    <View style={[styles.art, { width: size, height: size, backgroundColor: bg }]} aria-hidden>
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
        {category === 'formula' ? (
          <>
            <Rect x={9} y={8} width={22} height={28} rx={3} fill="#F5F0E7" stroke="#4E6272" strokeWidth={1} />
            <Rect x={8} y={5} width={24} height={5} rx={2} fill="#A9B9C6" />
            <Rect x={13} y={17} width={14} height={9} rx={1} fill="#A9B9C6" opacity={0.6} />
          </>
        ) : category === 'solids' || category === 'baby-food' ? (
          <>
            <Rect x={10} y={12} width={20} height={24} rx={5} fill="#F5F0E7" stroke="#8E5A45" strokeWidth={1} />
            <Rect x={12} y={20} width={16} height={14} rx={3} fill="#D8A783" />
            <Rect x={9} y={7} width={22} height={6} rx={2} fill="#B9826B" />
          </>
        ) : (
          <>
            <Path d="M8 8 H28 L32 12 V34 H8 Z" fill="#F5F0E7" stroke="#55634F" strokeWidth={1} />
            <Path d="M12 16 H28 M12 21 H28 M12 26 H22" stroke="#879783" strokeWidth={1.4} strokeLinecap="round" />
            <Ellipse cx={28} cy={30} rx={4} ry={4} fill="#879783" opacity={0.5} />
          </>
        )}
      </Svg>
    </View>
  );
}

export function ProductCard({ product, saved, onPress }: { product: Product; saved: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${categoryLabel(product.category)}${product.isSample ? ', sample record' : ''}, ${product.expertReviewStatus.replace(/_/g, ' ')}${saved ? ', saved' : ''}`}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
      <ProductArt category={product.category} />
      <View style={{ flex: 1, gap: 4 }}>
        <T variant="bodyStrong" numberOfLines={2}>
          {product.name}
        </T>
        <T variant="small" numberOfLines={2}>
          {product.description}
        </T>
        <View style={styles.badges}>
          {product.isSample ? <T variant="caption" style={styles.sample}>Sample record</T> : null}
          <StatusBadge status={product.expertReviewStatus} />
        </View>
      </View>
      {saved ? <Icon name="bookmark" size={18} fill={colors.terracotta} color={colors.terracottaDeep} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    gap: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineStrong,
    alignItems: 'flex-start',
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2, alignItems: 'center' },
  sample: { color: colors.blueDeep },
});
