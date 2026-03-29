import { Pressable, StyleSheet } from 'react-native';

import { YarnBallGraphic } from '@/src/components/YarnBallGraphic';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

/** Teal yarn-ball capture control — uses shared YarnBallGraphic. */
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
      <YarnBallGraphic size={s} emphasized />
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
});
