import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useCallback } from 'react';
import { Text } from 'react-native';
import { TabBarButton } from '@/src/components/TabBarButton';
import { TabYarnIcon } from '@/src/components/TabYarnIcon';
import { useAuthStore } from '@/src/store/useAuthStore';
import { colors } from '@/src/theme/tokens';

function tabBarLabel(title: string) {
  return ({ focused, color }: { color: string; focused: boolean }) => (
    <Text
      style={{
        color,
        fontSize: 11,
        fontWeight: focused ? '800' : '600',
        letterSpacing: focused ? 0.4 : 0,
        marginTop: 4,
      }}
      numberOfLines={1}
    >
      {title}
    </Text>
  );
}

export default function TabsLayout() {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  /** React Navigation calls `tabBarButton(props)` — must be a function, not a forwardRef object. */
  const renderTabBarButton = useCallback(
    (props: BottomTabBarButtonProps) => <TabBarButton {...props} />,
    [],
  );

  if (!bootstrapped) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      initialRouteName="scan"
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingTop: 4,
        },
        tabBarButton: renderTabBarButton,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: tabBarLabel('History'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          headerShown: false,
          tabBarLabel: tabBarLabel('Scan'),
          tabBarIcon: ({ focused }) => <TabYarnIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tops"
        options={{
          title: 'Top',
          headerShown: false,
          tabBarLabel: tabBarLabel('Top'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'ribbon' : 'ribbon-outline'} size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
