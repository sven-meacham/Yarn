import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/theme/tokens';
import { dotColor } from '@/src/utils/tagFields';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  valueRight: string;
  score: number;
  showAddDetails?: boolean;
  onAddDetails?: () => void;
};

export function CategoryBreakdownRow({
  icon,
  title,
  subtitle,
  valueRight,
  score,
  showAddDetails,
  onAddDetails,
}: Props) {
  const d = dotColor(score);
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.textMuted} />
      </View>
      <View style={styles.mid}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub} numberOfLines={4}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        {showAddDetails ? (
          <Pressable onPress={onAddDetails} hitSlop={8} style={styles.addPress}>
            <Text style={styles.addLink}>+ Add details</Text>
          </Pressable>
        ) : (
          <Text style={styles.val} numberOfLines={2}>
            {valueRight}
          </Text>
        )}
        <View style={[styles.dot, { backgroundColor: d }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    alignItems: 'center',
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 120,
  },
  addPress: {
    flexShrink: 1,
  },
  addLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'right',
  },
  val: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    maxWidth: 72,
    textAlign: 'right',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
});
