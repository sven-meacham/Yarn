import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme/tokens';

type Props = {
  title: string;
  body: string;
  accent: string;
  background: string;
};

/** Renders markdown-lite: **bold** segments only */
function RichText({ text, baseStyle }: { text: string; baseStyle: object }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return (
            <Text key={i} style={[baseStyle, styles.bold]}>
              {inner}
            </Text>
          );
        }
        return (
          <Text key={i} style={baseStyle}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

export function ExplanationCard({ title, body, accent, background }: Props) {
  return (
    <View style={[styles.wrap, { borderLeftColor: accent, backgroundColor: background }]}>
      <View style={[styles.titleRow, { borderBottomColor: accent }]}>
        <View style={[styles.titleDot, { backgroundColor: accent }]} />
        <Text style={[styles.title, { color: accent }]}>{title}</Text>
      </View>
      <RichText text={body} baseStyle={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
});
