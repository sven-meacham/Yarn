import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as React from 'react';
import { View } from 'react-native';

import { colors, radius } from '@/src/theme/tokens';

/**
 * Tab bar press target: forward all React Navigation props (onPress, href, etc.) and ref.
 * Avoid extra margins/flex that can misalign touches with the wrong tab.
 */
export const TabBarButton = React.forwardRef<View, BottomTabBarButtonProps>(
  function TabBarButton({ children, style, accessibilityState, ...rest }, ref) {
    const focused = accessibilityState?.selected;
    return (
      <PlatformPressable
        ref={ref}
        {...rest}
        accessibilityState={accessibilityState}
        android_ripple={{ borderless: true }}
        style={[
          style,
          // Teal top bar when selected (inactive uses transparent bar so height matches)
          {
            borderTopWidth: 3,
            borderTopColor: 'transparent',
          },
          focused && {
            borderTopColor: colors.brandTeal,
            backgroundColor: colors.tabBarSelectedBg,
            borderRadius: radius.md,
          },
        ]}
      >
        {children}
      </PlatformPressable>
    );
  },
);
