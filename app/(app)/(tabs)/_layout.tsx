import React from 'react';
import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Chrome as Home, MessageSquare, User, Plus, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopColor: '#2c2c2c',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: '#1e1e1e',
          borderBottomColor: '#2c2c2c',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '600',
        },
        headerTintColor: '#fff',
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
              <Plus size={size * 3} color={color} style={{ borderRadius: size * 1.5, backgroundColor: '#3498db', padding: 10 }} />
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