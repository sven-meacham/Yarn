import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RichText } from '@/src/components/ExplanationCard';
import { colors, radius, spacing } from '@/src/theme/tokens';
import { dotColor, scoreLabel } from '@/src/utils/tagFields';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  headline: string;
  headlineExtra?: string;
  subtitle: string;
  /** `null` = show “not in overall” (e.g. brand label only). */
  score: number | null;
  /** Optional second line (e.g. fiber quality next to sustainability). */
  secondaryScore?: { label: string; value: number };
  accent: string;
  background: string;
  explanationBody: string;
  expanded: boolean;
  onToggle: () => void;
  showAddDetails?: boolean;
  onAddDetails?: () => void;
  isLast?: boolean;
};

export function ExpandableCategoryScore({
  icon,
  title,
  headline,
  headlineExtra,
  subtitle,
  score,
  secondaryScore,
  accent,
  background,
  explanationBody,
  expanded,
  onToggle,
  showAddDetails,
  onAddDetails,
  isLast,
}: Props) {
  const tint = score != null ? dotColor(score) : colors.textMuted;
  const label = score != null ? scoreLabel(score) : '';

  return (
    <View style={[styles.block, !isLast && styles.blockBorder]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.headerPress, pressed && styles.headerPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color={colors.textMuted} />
        </View>
        <View style={styles.mid}>
          <Text style={styles.kicker}>{title}</Text>
          <View style={styles.headlineRow}>
            {headlineExtra ? (
              <Text style={styles.flag}>{headlineExtra}</Text>
            ) : null}
            <Text style={styles.headline} numberOfLines={3}>
              {headline}
            </Text>
          </View>
          <Text style={styles.sub} numberOfLines={4}>
            {subtitle}
          </Text>
          {score != null ? (
            <>
              <View style={styles.scoreLine}>
                <Text style={styles.scoreNum}>
                  {score}
                  <Text style={styles.scoreOutOf}>/100</Text>
                </Text>
                <Text style={[styles.scoreWord, { color: tint }]}>{label}</Text>
                <View style={[styles.scoreDot, { backgroundColor: tint }]} />
              </View>
              {secondaryScore ? (
                <View style={styles.secondaryBlock}>
                  <Text style={styles.secondaryLabel}>{secondaryScore.label}</Text>
                  <View style={styles.scoreLine}>
                    <Text style={styles.secondaryNum}>
                      {secondaryScore.value}
                      <Text style={styles.scoreOutOf}>/100</Text>
                    </Text>
                    <Text
                      style={[styles.scoreWord, { color: dotColor(secondaryScore.value) }]}
                    >
                      {scoreLabel(secondaryScore.value)}
                    </Text>
                    <View
                      style={[
                        styles.scoreDot,
                        { backgroundColor: dotColor(secondaryScore.value) },
                      ]}
                    />
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.excludedHint}>Not included in overall score</Text>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.textMuted}
        />
      </Pressable>

      {showAddDetails ? (
        <Pressable onPress={onAddDetails} style={styles.addRow} hitSlop={8}>
          <Text style={styles.addLink}>+ Add details</Text>
        </Pressable>
      ) : null}

      {expanded ? (
        <View style={[styles.meaning, { borderLeftColor: accent, backgroundColor: background }]}>
          <Text style={[styles.meaningKicker, { color: accent }]}>What this means</Text>
          <RichText text={explanationBody} baseStyle={styles.meaningBody} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingVertical: spacing.md,
  },
  blockBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerPress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    paddingTop: 2,
    alignItems: 'center',
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  flag: {
    fontSize: 22,
    lineHeight: 26,
  },
  headline: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 22,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  excludedHint: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  secondaryBlock: {
    marginTop: spacing.sm,
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  secondaryNum: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  scoreLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  scoreNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  scoreOutOf: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scoreWord: {
    fontSize: 15,
    fontWeight: '800',
  },
  scoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  addRow: {
    marginTop: spacing.sm,
    marginLeft: 44,
  },
  addLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  meaning: {
    marginTop: spacing.md,
    marginLeft: 44,
    marginRight: 0,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meaningKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  meaningBody: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
});
