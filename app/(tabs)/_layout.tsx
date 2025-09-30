import { Tabs } from 'expo-router';
import React from 'react';
import { Dumbbell, List, Settings } from 'lucide-react-native';
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
        name="index"
        options={{
          title: 'التمرين الحالي',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'المكتبة',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
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
