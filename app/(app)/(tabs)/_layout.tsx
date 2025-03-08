import React from 'react';
import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Chrome as Home, MessageSquare, User, Plus, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          borderTopColor: isDark ? '#2c2c2c' : '#e0e0e0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: isDark ? '#95a5a6' : '#7f8c8d',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: isDark ? '#fff' : '#000',
          fontWeight: '600',
        },
        headerTintColor: isDark ? '#fff' : '#000',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'Sanayim',
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      
      {isVehicleOwner && (
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size }) => (
              <Plus size={size * 3} color={isDark ? color : '#fff'} style={{ borderRadius: size * 1.5, backgroundColor:'#3498db' , padding: 10 }} />
            ),
            tabBarLabelStyle: {
              display: 'none',
            },
            headerShown: false,
          }}
        />
      )}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
