import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

import { colors, radius } from '@/src/theme/tokens';

/**
 * Bottom tab button with a visible “pill” when focused so the active route is obvious.
 */
export function TabBarButton(props: BottomTabBarButtonProps) {
  const { style, children, accessibilityState, ...rest } = props;
  const focused = accessibilityState?.selected;

  return (
    <PlatformPressable
      {...rest}
      accessibilityState={accessibilityState}
      android_ripple={{ color: 'transparent' }}
      style={[
        style,
        { flex: 1, justifyContent: 'center', alignItems: 'center' },
        focused && {
          backgroundColor: colors.tabPill,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.tabPillBorder,
          marginHorizontal: 4,
          marginVertical: 6,
        },
      ]}
    >
      {children}
    </PlatformPressable>
  );
}
