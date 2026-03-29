import { StyleSheet, View } from 'react-native';

type Props = {
  size: number;
  /** Thicker rim (capture button); thinner matches original tab icon */
  emphasized?: boolean;
};

/**
 * Original yarn-ball look (teal circle + crossing strands + tail), scaled by `size`.
 * Reference: 88px button — strand heights 18 / 16 / 14 / 12.
 */
export function YarnBallGraphic({ size: s, emphasized }: Props) {
  const scale = s / 88;
  const h = (px: number) => Math.max(2, Math.round(px * scale));
  const rimW = emphasized ? 3 : 2;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.ball,
          {
            width: s,
            height: s,
            borderRadius: s / 2,
            borderWidth: rimW,
          },
        ]}
      >
        <View style={[styles.strand, styles.s1, { height: h(18) }]} />
        <View style={[styles.strand, styles.s2, { height: h(16) }]} />
        <View style={[styles.strand, styles.s3, { height: h(14) }]} />
        <View style={[styles.strand, styles.s4, { height: h(12) }]} />
        <View
          style={[
            styles.tail,
            {
              width: s * 0.45,
              height: h(8),
              right: -6 * scale,
              bottom: 4 * scale,
            },
          ]}
        />
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
    borderColor: '#1E7A70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strand: {
    position: 'absolute',
    backgroundColor: '#5EC4B8',
    borderRadius: 999,
  },
  /* Wide bands so rotated “strands” read almost edge-to-edge inside the circle */
  s1: { width: '98%', transform: [{ rotate: '-18deg' }] },
  s2: { width: '96%', transform: [{ rotate: '32deg' }], opacity: 0.95 },
  s3: { width: '94%', transform: [{ rotate: '78deg' }], backgroundColor: '#3DB5A8' },
  s4: { width: '92%', transform: [{ rotate: '-52deg' }], backgroundColor: '#1E8A7E' },
  tail: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#3DB5A8',
    transform: [{ rotate: '25deg' }],
  },
});
