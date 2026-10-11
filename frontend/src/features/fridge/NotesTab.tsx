import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, EmptyState, IconButton, Section, T, TextField } from '@/components/ui';
import { relativeTime, useNow } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { NoteColor } from '@/types';

const PAPER: Record<NoteColor, string> = { cream: '#F6EBCF', sage: '#DCE3D2', blue: '#DCE5EC', terracotta: '#F0DACD' };

/** Notes on the fridge door: quick messages between the people caring for the baby. */
export function NotesTab() {
  const notes = useCollection(stores.notes);
  const now = useNow(60_000);
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor>('cream');
  const [error, setError] = useState<string | null>(null);

  const post = async () => {
    if (!body.trim()) return setError('Write something first.');
    setError(null);
    try {
      await notes.create({ body: body.trim(), color, authorName: '', mine: true, createdAt: new Date().toISOString() }, 'create:note');
      setBody('');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <>
      <Section title="Leave a note">
        <TextField label="Note for the family" value={body} onChangeText={setBody} multiline maxLength={1000} placeholder="e.g. Gave the 3pm feed, bottles are washed" error={error ?? undefined} />
        <View style={styles.colors} accessibilityRole="radiogroup" accessibilityLabel="Note colour">
          {(Object.keys(PAPER) as NoteColor[]).map((c) => (
            <Pressable
              key={c}
              accessibilityRole="radio"
              accessibilityLabel={c}
              accessibilityState={{ checked: color === c }}
              onPress={() => setColor(c)}
              hitSlop={6}
              style={[styles.swatch, { backgroundColor: PAPER[c] }, color === c && styles.swatchOn]}
            />
          ))}
          <Button label="Stick it on" icon="send" onPress={post} loading={notes.isBusy('create:note')} style={{ marginLeft: 'auto' }} />
        </View>
      </Section>

      {notes.status === 'ready' && !notes.items.length ? (
        <EmptyState icon="chat" title="The fridge door is empty" body="Notes you leave here show up for everyone in your family." />
      ) : (
        <View style={styles.board}>
          {notes.items.map((n, i) => (
            <View key={n.id} style={[styles.note, { backgroundColor: PAPER[n.color], transform: [{ rotate: `${((i * 37) % 5) - 2}deg` }] }]}>
              <View style={styles.pin} />
              <T variant="body">{n.body}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <T variant="caption" style={{ flex: 1 }}>
                  {n.mine ? 'You' : n.authorName} · {relativeTime(n.createdAt, now)}
                </T>
                {n.mine ? <IconButton icon="trash" tone="clear" label="Take this note down" onPress={() => notes.remove(n.id)} disabled={notes.isBusy(`remove:${n.id}`)} /> : null}
              </View>
            </View>
          ))}
        </View>
      )}
      {notes.status === 'error' ? (
        <T variant="small" style={{ color: colors.danger }}>
          {messageOf(notes.error)}
        </T>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  colors: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.line },
  swatchOn: { borderWidth: 2.5, borderColor: colors.charcoal },
  board: { gap: space.sm },
  note: {
    padding: space.md,
    paddingTop: space.md + 4,
    borderRadius: radius.sm,
    gap: space.xs,
    shadowColor: '#2A1A0E',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pin: { position: 'absolute', top: 6, alignSelf: 'center', width: 12, height: 12, borderRadius: 6, backgroundColor: colors.terracotta },
});
