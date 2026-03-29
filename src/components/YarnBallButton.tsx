import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

/** Teal yarn-ball style capture control (matches reference aesthetic; replace with Image if you add `assets/images/yarn-ball.png`). */
export function YarnBallButton({ onPress, disabled, size = 88 }: Props) {
  const s = size;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Capture tag and analyze"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        { width: s + 24, height: s + 24 },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.ball, { width: s, height: s, borderRadius: s / 2 }]}>
        <View style={[styles.strand, styles.s1]} />
        <View style={[styles.strand, styles.s2]} />
        <View style={[styles.strand, styles.s3]} />
        <View style={[styles.strand, styles.s4]} />
        <View style={[styles.tail, { width: s * 0.45 }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.45 },
  ball: {
    backgroundColor: '#2AA89A',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1E7A70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strand: {
    position: 'absolute',
    backgroundColor: '#5EC4B8',
    borderRadius: 999,
  },
  s1: { width: '92%', height: 18, transform: [{ rotate: '-18deg' }] },
  s2: { width: '88%', height: 16, transform: [{ rotate: '32deg' }], opacity: 0.95 },
  s3: { width: '85%', height: 14, transform: [{ rotate: '78deg' }], backgroundColor: '#3DB5A8' },
  s4: { width: '80%', height: 12, transform: [{ rotate: '-52deg' }], backgroundColor: '#1E8A7E' },
  tail: {
    position: 'absolute',
    right: -6,
    bottom: 4,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3DB5A8',
    transform: [{ rotate: '25deg' }],
  },
});
