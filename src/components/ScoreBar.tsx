import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme/tokens';

type Props = {
  label: string;
  value: number;
};

export function ScoreBar({ label, value }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const tint =
    v >= 70 ? colors.scoreHigh : v >= 45 ? colors.scoreMid : colors.scoreLow;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.num, { color: tint }]}>{Math.round(v)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${v}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  num: {
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
