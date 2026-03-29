import { StyleSheet, View } from 'react-native';

import { YarnBallGraphic } from '@/src/components/YarnBallGraphic';

type Props = {
  size?: number;
};

/** Small yarn-ball tab icon (original thinner rim). */
export function TabYarnIcon({ size = 26 }: Props) {
  const s = size;
  return (
    <View style={[styles.wrap, { width: s + 8, height: s + 8 }]}>
      <YarnBallGraphic size={s} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
