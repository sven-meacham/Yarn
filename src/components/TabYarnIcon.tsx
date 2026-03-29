import { StyleSheet, View } from 'react-native';

import { YarnBallGraphic } from '@/src/components/YarnBallGraphic';

type Props = {
  size?: number;
  /** When true, thicker rim so Scan matches other tabs’ “active” look. */
  focused?: boolean;
};

/** Small yarn-ball tab icon — rim thickens when this tab is selected. */
export function TabYarnIcon({ size = 26, focused }: Props) {
  const s = size;
  return (
    <View style={[styles.wrap, { width: s + 8, height: s + 8 }]}>
      <YarnBallGraphic size={s} emphasized={!!focused} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
