import { StyleSheet, View } from 'react-native';

type Props = {
  size?: number;
  focused?: boolean;
};

/** Small yarn-ball tab icon (matches capture button style). */
export function TabYarnIcon({ size = 26, focused }: Props) {
  const s = size;
  return (
    <View style={[styles.wrap, { width: s + 8, height: s + 8 }]}>
      <View style={[styles.ball, { width: s, height: s, borderRadius: s / 2 }]}>
        <View style={[styles.strand, styles.s1]} />
        <View style={[styles.strand, styles.s2]} />
        <View style={[styles.strand, styles.s3]} />
        <View style={[styles.tail, { width: s * 0.4 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    backgroundColor: '#2AA89A',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1E7A70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strand: {
    position: 'absolute',
    backgroundColor: '#5EC4B8',
    borderRadius: 999,
  },
  s1: { width: '92%', height: 8, transform: [{ rotate: '-18deg' }] },
  s2: { width: '88%', height: 7, transform: [{ rotate: '32deg' }], opacity: 0.95 },
  s3: { width: '85%', height: 6, transform: [{ rotate: '78deg' }], backgroundColor: '#3DB5A8' },
  tail: {
    position: 'absolute',
    right: -4,
    bottom: 2,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3DB5A8',
    transform: [{ rotate: '25deg' }],
  },
});
