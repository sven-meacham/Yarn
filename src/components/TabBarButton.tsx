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
          backgroundColor: colors.tabBarSelectedBg,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: colors.tabBarSelectedBorder,
          marginHorizontal: 2,
          marginVertical: 4,
          paddingVertical: 6,
          paddingHorizontal: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
      ]}
    >
      {children}
    </PlatformPressable>
  );
}
