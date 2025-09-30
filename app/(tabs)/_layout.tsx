import { Tabs } from 'expo-router';
import React from 'react';
import { Settings, LayoutDashboard, Library } from 'lucide-react-native';
import { useFitnessStore } from '@/hooks/useFitnessStore';

export default function TabLayout() {
  const { settings } = useFitnessStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: settings.primaryColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'لوحة المعلومات',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
       <Tabs.Screen
        name="library"
        options={{
          title: 'المكتبة',
          tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
