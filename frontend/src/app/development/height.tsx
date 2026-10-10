import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { AsyncBlock, Button, ChipRow, EmptyState, IconButton, ListRow, Notice, Screen, Section, T, TextField } from '@/components/ui';
import { dayLabel, shiftDays } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, fonts, radius, space } from '@/theme';
import type { HeightMeasurement } from '@/types';

const toCm = (h: HeightMeasurement) => (h.unit === 'cm' ? h.height : h.height * 2.54);

/**
 * The growth board: a wooden ruler with a mark for every measurement you record.
 * Measurements are stored exactly as entered — no percentiles, no interpretation.
 */
export default function HeightRuler() {
  const heights = useCollection(stores.heights);
  const [editing, setEditing] = useState<HeightMeasurement | null>(null);

  return (
    <Screen back title="Height" subtitle="A growth board for the record, not a scorecard.">
      <AsyncBlock
        status={heights.status}
        error={heights.error}
        onRetry={heights.retry}
        isEmpty={heights.items.length === 0}
        loadingLabel="Loading measurements"
        empty={<EmptyState icon="ruler" title="No measurements yet" body="Add one below and it will appear on the board." />}>
        <Ruler items={heights.items} />
      </AsyncBlock>

      <Section title={editing ? 'Correct a measurement' : 'Add a measurement'}>
        <HeightForm key={editing?.id ?? 'new'} existing={editing} onDone={() => setEditing(null)} />
      </Section>

      {heights.items.length ? (
        <Section title="History">
          {heights.items.map((h, i) => (
            <ListRow
              key={h.id}
              icon="ruler"
              title={`${h.height} ${h.unit}`}
              subtitle={[dayLabel(h.measuredAt), h.notes].filter(Boolean).join(' · ')}
              last={i === heights.items.length - 1}
              right={
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="edit" label={`Correct ${h.height} ${h.unit}`} tone="clear" onPress={() => setEditing(h)} />
                  <IconButton icon="trash" label={`Remove ${h.height} ${h.unit}`} tone="clear" onPress={() => heights.remove(h.id)} disabled={heights.isBusy(`remove:${h.id}`)} />
                </View>
              }
            />
          ))}
        </Section>
      ) : null}
      <Notice tone="sand" text="Parent-recorded measurements only. Nurture doesn’t calculate percentiles or interpret growth — your pediatrician can talk you through what’s typical." />
    </Screen>
  );
}

function Ruler({ items }: { items: HeightMeasurement[] }) {
  const values = items.map(toCm);
  const lo = Math.floor((Math.min(...values) - 4) / 5) * 5;
  const hi = Math.ceil((Math.max(...values) + 3) / 5) * 5;
  const H = 300;
  const y = (cm: number) => H - 14 - ((cm - lo) / (hi - lo)) * (H - 28);
  const latest = items[0];

  const ticks = [];
  for (let cm = lo; cm <= hi; cm++) {
    const major = cm % 5 === 0;
    ticks.push(<Line key={cm} x1={54} x2={major ? 76 : 66} y1={y(cm)} y2={y(cm)} stroke="#6E5136" strokeWidth={major ? 1.6 : 1} />);
    if (major) ticks.push(<SvgText key={`l${cm}`} x={82} y={y(cm) + 4} fontSize={11} fill="#6E5136" fontFamily={fonts.bodyMedium}>{cm}</SvgText>);
  }

  return (
    <View style={styles.board} accessible accessibilityLabel={`Height board. Latest: ${latest.height} ${latest.unit}, ${dayLabel(latest.measuredAt)}. ${items.length} measurements recorded.`}>
      <Svg width="100%" height={H} viewBox={`0 0 320 ${H}`}>
        <Rect x={40} y={0} width={80} height={H} rx={8} fill="#C9A57C" />
        <Rect x={40} y={0} width={10} height={H} rx={4} fill="#B48D64" />
        {ticks}
        {items
          .slice()
          .reverse()
          .map((h) => {
            const isLatest = h.id === latest.id;
            const yy = y(toCm(h));
            return (
              <G key={h.id}>
                <Line x1={40} x2={isLatest ? 210 : 150} y1={yy} y2={yy} stroke={isLatest ? colors.terracottaDeep : '#8E7A63'} strokeWidth={isLatest ? 2.4 : 1.2} strokeDasharray={isLatest ? undefined : '3 3'} />
                <SvgText x={isLatest ? 216 : 156} y={yy + 4} fontSize={isLatest ? 13 : 11} fill={isLatest ? colors.charcoal : colors.ink2} fontFamily={isLatest ? fonts.bodySemibold : fonts.body}>
                  {`${h.height} ${h.unit} · ${new Date(h.measuredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                </SvgText>
              </G>
            );
          })}
      </Svg>
    </View>
  );
}

function HeightForm({ existing, onDone }: { existing: HeightMeasurement | null; onDone: () => void }) {
  const heights = useCollection(stores.heights);
  const [value, setValue] = useState(existing ? String(existing.height) : '');
  const [unit, setUnit] = useState<'cm' | 'in'>(existing?.unit ?? 'cm');
  const [measuredAt, setMeasuredAt] = useState(existing?.measuredAt ?? new Date().toISOString());
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const key = existing ? `update:${existing.id}` : 'create:height';

  const n = Number(value.replace(',', '.'));
  const valid = Number.isFinite(n) && (unit === 'cm' ? n >= 20 && n <= 250 : n >= 8 && n <= 100);

  const save = async () => {
    if (!valid) return setError(unit === 'cm' ? 'Enter a height between 20 and 250 cm.' : 'Enter a height between 8 and 100 in.');
    setError(null);
    const input = { height: Math.round(n * 10) / 10, unit, measuredAt, notes: notes.trim() || undefined };
    try {
      if (existing) await heights.update(existing.id, input);
      else await heights.create(input, key);
      setValue('');
      setNotes('');
      onDone();
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <TextField label="Height" placeholder={unit === 'cm' ? 'e.g. 64.5' : 'e.g. 25.4'} value={value} onChangeText={setValue} keyboardType="decimal-pad" error={error ?? undefined} />
        </View>
        <ChipRow value={unit} onChange={setUnit} options={[{ value: 'cm', label: 'cm' }, { value: 'in', label: 'in' }]} />
      </View>
      <View style={styles.dateRow}>
        <T variant="smallStrong">Measured</T>
        <T variant="body" style={{ flex: 1 }}>
          {dayLabel(measuredAt)}
        </T>
        <Button label="−1 day" size="sm" variant="secondary" onPress={() => setMeasuredAt(shiftDays(measuredAt, -1))} />
        <Button label="+1 day" size="sm" variant="secondary" onPress={() => setMeasuredAt(shiftDays(measuredAt, 1))} />
      </View>
      <TextField label="Note (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. measured lying down" />
      <View style={{ flexDirection: 'row', gap: space.xs }}>
        <Button label={existing ? 'Save correction' : 'Add to the board'} icon="ruler" onPress={save} loading={heights.isBusy(key)} style={{ flex: 1 }} />
        {existing ? <Button label="Cancel" variant="quiet" onPress={onDone} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: colors.creamSoft, borderRadius: radius.lg, paddingVertical: space.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' },
});
