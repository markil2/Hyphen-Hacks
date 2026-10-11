import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { LcdPanel, screen } from '@/components/scene/Console';
import { MonitorScreen } from '@/components/scene/MonitorScreen';
import { T } from '@/components/ui';
import { useBabyMonths } from '@/lib/age';
import { haptic } from '@/lib/haptics';
import { remote } from '@/services';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { fonts } from '@/theme';
import type { ShopProduct } from '@/types';

const openStore = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));

/** The kitchen shop: a short list of baby-food brands, a bag to keep track, and links to each brand's own store. */
export default function Shop() {
  const bag = useCollection(stores.bag);
  const months = useBabyMonths();
  const [tab, setTab] = useState<'shop' | 'bag'>('shop');
  const [items, setItems] = useState<ShopProduct[] | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    remote.foods
      .shop()
      .then((r) => {
        setItems(r.items);
        setNotice(r.notice);
      })
      .catch((e) => setError(messageOf(e)));
  }, []);

  const inBag = (id: string) => bag.items.find((b) => b.productId === id);
  const toggle = async (p: ShopProduct) => {
    haptic.tap();
    const existing = inBag(p.id);
    if (existing) await bag.remove(existing.id);
    else await bag.create({ productId: p.id, brand: p.brand, name: p.name, storeUrl: p.storeUrl, addedAt: new Date().toISOString() });
  };

  const tabs = (
    <View style={styles.tabs}>
      {(['shop', 'bag'] as const).map((t) => (
        <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
          {t === 'bag' ? <Icon name="bookmark" size={14} color={tab === t ? '#2A211A' : screen.amber} /> : null}
          <T style={[styles.tabText, tab === t && { color: '#2A211A' }]}>{t === 'shop' ? 'Shop' : `Bag ${bag.items.length}`}</T>
        </Pressable>
      ))}
    </View>
  );

  return (
    <MonitorScreen title="Baby food shop" subtitle="Brands parents look for, linked to their stores" right={tabs}>
      {tab === 'shop' ? (
        <>
          {months !== null && months < 6 ? (
            <LcdPanel>
              <T style={styles.alert}>Solid foods usually start around 6 months. Browse ahead, and check with your pediatrician first.</T>
            </LcdPanel>
          ) : null}
          {error ? <T style={styles.muted}>{error}</T> : null}
          {!items && !error ? <T style={styles.muted}>Loading…</T> : null}
          {items?.map((p) => {
            const added = Boolean(inBag(p.id));
            const expanded = open === p.id;
            return (
              <LcdPanel key={p.id}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setOpen(expanded ? null : p.id)} style={styles.head}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T style={styles.brand}>{p.brand}</T>
                    <T style={styles.name}>{p.name}</T>
                  </View>
                  <T style={styles.age}>{p.ageFromMonths}+ mo</T>
                </Pressable>
                {expanded ? <T style={styles.desc}>{p.description}</T> : null}
                <View style={styles.keys}>
                  <Pressable accessibilityRole="button" onPress={() => toggle(p)} style={[styles.key, added && styles.keyOn]}>
                    <Icon name={added ? 'check' : 'plus'} size={14} color={added ? '#2A211A' : screen.amber} strokeWidth={2} />
                    <T style={[styles.keyText, added && { color: '#2A211A' }]}>{added ? 'In bag' : 'Add to bag'}</T>
                  </Pressable>
                  <Pressable accessibilityRole="link" accessibilityHint="Opens the brand's store" onPress={() => openStore(p.storeUrl)} style={styles.key}>
                    <Icon name="link" size={14} color={screen.amber} />
                    <T style={styles.keyText}>Store</T>
                  </Pressable>
                </View>
              </LcdPanel>
            );
          })}
          {notice ? <T style={styles.muted}>{notice}</T> : null}
        </>
      ) : (
        <>
          {bag.items.length ? (
            bag.items.map((b) => (
              <LcdPanel key={b.id}>
                <View style={styles.head}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T style={styles.brand}>{b.brand}</T>
                    <T style={styles.name}>{b.name}</T>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${b.brand} from the bag`} onPress={() => bag.remove(b.id)} hitSlop={8}>
                    <Icon name="trash" size={16} color={screen.muted} />
                  </Pressable>
                </View>
                <Pressable accessibilityRole="link" onPress={() => openStore(b.storeUrl)} style={[styles.key, styles.keyOn, { alignSelf: 'stretch' }]}>
                  <T style={[styles.keyText, { color: '#2A211A' }]}>Go to {b.brand} store</T>
                  <Icon name="chevron" size={14} color="#2A211A" />
                </Pressable>
              </LcdPanel>
            ))
          ) : (
            <LcdPanel>
              <T style={styles.muted}>Your bag is empty. Add brands from the shop to keep a list, then check out on each store’s site.</T>
            </LcdPanel>
          )}
          <T style={styles.muted}>Checkout happens on each brand’s own website. Nurture never handles payment.</T>
        </>
      )}
    </MonitorScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: '#1B1815', borderRadius: 10, padding: 3 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 30, borderRadius: 8 },
  tabOn: { backgroundColor: screen.amber },
  tabText: { fontFamily: fonts.lcd, fontSize: 12.5, letterSpacing: 1, color: screen.amber, textTransform: 'uppercase' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brand: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  name: { fontFamily: fonts.lcd, fontSize: 19, lineHeight: 23, color: screen.amber },
  age: { fontFamily: fonts.lcd, fontSize: 12, color: screen.muted, borderWidth: 1, borderColor: 'rgba(242,201,138,0.3)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  desc: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: screen.ink },
  keys: { flexDirection: 'row', gap: 8 },
  key: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(242,201,138,0.4)' },
  keyOn: { backgroundColor: screen.amber, borderColor: screen.amber },
  keyText: { fontFamily: fonts.lcd, fontSize: 13, letterSpacing: 0.8, color: screen.amber, textTransform: 'uppercase' },
  alert: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: screen.amber },
  muted: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
});
