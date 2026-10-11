import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { T, TextField } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { remote } from '@/services';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { FoodHit } from '@/types';

/** Look up a packaged baby food in Open Food Facts and use its name. Allergens shown are as labelled. */
export function FoodSearch({ onPick }: { onPick: (name: string) => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<FoodHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    let live = true;
    const t = setTimeout(async () => {
      setBusy(true);
      setError(null);
      try {
        const found = await remote.foods.search(term, true);
        if (live) setHits(found.slice(0, 6));
      } catch (e) {
        if (live) setError(messageOf(e));
      } finally {
        if (live) setBusy(false);
      }
    }, 450);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q]);

  const shown = q.trim().length < 2 ? [] : hits;

  return (
    <View style={{ gap: space.xs }}>
      <TextField label="Or find a packaged food" placeholder="e.g. banana puree" value={q} onChangeText={setQ} autoCapitalize="none" returnKeyType="search" />
      {busy ? <ActivityIndicator color={colors.ink2} accessibilityLabel="Searching foods" /> : null}
      {error ? <T variant="small" style={{ color: colors.danger }}>{error}</T> : null}
      {shown.map((h) => (
        <Pressable
          key={h.code ?? h.name}
          accessibilityRole="button"
          accessibilityLabel={`Use ${h.name}${h.brand ? ` by ${h.brand}` : ''}`}
          onPress={() => {
            haptic.tap();
            onPick(h.brand ? `${h.name} (${h.brand})` : h.name);
            setQ('');
          }}
          style={({ pressed }) => [styles.hit, pressed && { opacity: 0.8 }]}>
          {h.imageUrl ? <Image source={{ uri: h.imageUrl }} style={styles.img} contentFit="contain" /> : <View style={[styles.img, styles.noImg]}><Icon name="bowl" size={18} color={colors.ink3} /></View>}
          <View style={{ flex: 1, gap: 1 }}>
            <T variant="smallStrong" numberOfLines={1}>{h.name}</T>
            <T variant="caption" numberOfLines={1}>
              {[h.brand, h.allergens.length ? `Contains: ${h.allergens.slice(0, 3).join(', ')}` : null].filter(Boolean).join(' · ') || 'Open Food Facts'}
            </T>
          </View>
          <Icon name="plus" size={16} color={colors.ink2} />
        </Pressable>
      ))}
      {shown.length ? <T variant="caption">From Open Food Facts, an open database. Always check the label yourself.</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.xs, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  img: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff' },
  noImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.creamSoft },
});
