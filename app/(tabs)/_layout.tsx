import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';

import { TabBarButton } from '@/src/components/TabBarButton';
import { TabYarnIcon } from '@/src/components/TabYarnIcon';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useScanHistoryStore } from '@/src/store/useScanHistoryStore';
import { colors } from '@/src/theme/tokens';

export default function TabsLayout() {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const hydrateHistory = useScanHistoryStore((s) => s.hydrate);

  useEffect(() => {
    if (isSignedIn) hydrateHistory();
  }, [isSignedIn, hydrateHistory]);

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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarButton: (props) => <TabBarButton {...props} />,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabYarnIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tops"
        options={{
          title: 'Top',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ribbon-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
