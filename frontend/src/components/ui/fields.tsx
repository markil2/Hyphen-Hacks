import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, TextInput, TextInputProps, View } from 'react-native';

import { Icon } from '@/components/icons';
import { haptic } from '@/lib/haptics';
import { dayLabel, formatClock, shiftMinutes } from '@/lib/time';
import { colors, fonts, HIT, radius, space } from '@/theme';

import { T } from './text';

export function TextField({
  label,
  hint,
  error,
  multiline,
  style,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <T variant="smallStrong" nativeID={`${label}-label`}>
        {label}
      </T>
      <TextInput
        {...props}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityLabelledBy={`${label}-label`}
        placeholderTextColor={colors.ink3}
        selectionColor={colors.terracotta}
        cursorColor={colors.terracottaDeep}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <View style={styles.inline}>
          <Icon name="alert" size={16} color={colors.danger} />
          <T variant="small" style={{ color: colors.danger }}>
            {error}
          </T>
        </View>
      ) : hint ? (
        <T variant="caption">{hint}</T>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: Parameters<typeof Icon>[0]['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && { opacity: 0.8 }]}>
      {selected ? <Icon name="check" size={16} color={colors.warmWhite} /> : icon ? <Icon name={icon} size={16} /> : null}
      <T variant="smallStrong" style={{ color: selected ? colors.warmWhite : colors.charcoal }}>
        {label}
      </T>
    </Pressable>
  );
}

export function ChipRow<V extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: V; label: string }[];
  value: V | null;
  onChange: (value: V) => void;
  label?: string;
}) {
  return (
    <View style={styles.field} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {label ? <T variant="smallStrong">{label}</T> : null}
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} selected={value === o.value} onPress={() => onChange(o.value)} />
        ))}
      </View>
    </View>
  );
}

export function Segmented<V extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  label: string;
}) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              haptic.tap();
              onChange(o.value);
            }}
            style={[styles.segment, on && styles.segmentOn]}>
            <T variant="smallStrong" style={{ color: on ? colors.charcoal : colors.ink2 }}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong">{label}</T>
        {description ? <T variant="small">{description}</T> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(next) => {
          haptic.tap();
          onChange(next);
        }}
        trackColor={{ false: colors.creamDeep, true: colors.sageDeep }}
        thumbColor={colors.paper}
        {...({ activeThumbColor: colors.paper } as object)}
      />
    </View>
  );
}

/**
 * Adjust a logged time without a fiddly picker: nudge by minutes, or snap to now.
 * Times can never move into the future.
 */
export function TimeEditor({
  label,
  value,
  onChange,
  notBefore,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  notBefore?: string;
}) {
  const nudge = (min: number) => {
    let next = shiftMinutes(value, min);
    if (notBefore && next < notBefore) next = notBefore;
    onChange(next);
  };
  const steps = [-15, -5, 5, 15];
  return (
    <View style={styles.field}>
      <T variant="smallStrong">{label}</T>
      <View style={styles.timeRow}>
        <View
          accessible
          accessibilityLabel={`${label}: ${dayLabel(value)} at ${formatClock(value)}`}
          style={styles.timeValue}>
          <T variant="heading" style={{ fontVariant: ['tabular-nums'] }}>
            {formatClock(value)}
          </T>
          <T variant="caption">{dayLabel(value)}</T>
        </View>
        <View style={styles.steps}>
          {steps.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`${s < 0 ? 'Earlier' : 'Later'} by ${Math.abs(s)} minutes`}
              onPress={() => {
                haptic.tap();
                nudge(s);
              }}
              style={({ pressed }) => [styles.step, pressed && { backgroundColor: colors.creamSoft }]}>
              <T variant="smallStrong" style={{ fontVariant: ['tabular-nums'] }}>
                {s > 0 ? `+${s}` : `−${Math.abs(s)}`}
              </T>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set to now"
            onPress={() => {
              haptic.tap();
              onChange(new Date().toISOString());
            }}
            style={({ pressed }) => [styles.step, styles.nowStep, pressed && { opacity: 0.8 }]}>
            <T variant="smallStrong">Now</T>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function AmountStepper({
  label,
  value,
  onChange,
  unit,
  step,
  max,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  unit: string;
  step: number;
  max: number;
}) {
  const v = value ?? 0;
  return (
    <View style={styles.field}>
      <T variant="smallStrong">{label}</T>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => {
            haptic.tap();
            onChange(v - step <= 0 ? undefined : v - step);
          }}
          style={styles.stepBtn}>
          <T variant="heading">−</T>
        </Pressable>
        <View accessible accessibilityLabel={`${label}: ${value ? `${value} ${unit}` : 'not set'}`} style={styles.stepValue}>
          <T variant="title" style={{ fontVariant: ['tabular-nums'] }}>
            {value ? value : '—'}
          </T>
          <T variant="caption">{value ? unit : 'optional'}</T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          onPress={() => {
            haptic.tap();
            onChange(Math.min(max, v + step));
          }}
          style={styles.stepBtn}>
          <T variant="heading">+</T>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.xs },
  input: {
    minHeight: HIT,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.paper,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.charcoal,
    // The field draws its own focus border; drop the browser's default ring on web.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputFocused: { borderColor: colors.charcoal, borderWidth: 1.5 },
  inputError: { borderColor: colors.danger },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipOn: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.creamDeep,
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentOn: { backgroundColor: colors.paper },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  timeRow: { gap: space.sm },
  timeValue: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  steps: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  step: {
    minWidth: 52,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    backgroundColor: colors.paper,
  },
  nowStep: { backgroundColor: colors.creamSoft },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepBtn: {
    width: HIT,
    height: HIT,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { flexDirection: 'row', alignItems: 'baseline', gap: 6, minWidth: 96, justifyContent: 'center' },
});
