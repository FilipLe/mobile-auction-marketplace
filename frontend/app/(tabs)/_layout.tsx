// File: app/(tabs)/_layout.tsx
// Functionality: defines navigation between different screens
// Author: Nguyen Le


import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../assets/my_styles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.highlight,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      {/* Home Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* All Auctions Listing Screen */}
      <Tabs.Screen
        name="items"
        options={{
          title: 'Auctions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hammer" size={size} color={color} />
          ),
        }}
      />

      {/* Create Auction Listing Screen */}
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      {/* View My Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}