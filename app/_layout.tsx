import { useEffect } from 'react';
import { Stack, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';

// Inner component to handle auth state and routing
function AppContent() {
  const { theme } = useSelector((state: RootState) => state.settings);
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  useFrameworkReady();

  const isDark = theme === 'dark';
  const navigationTheme = isDark 
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: '#3498db',
          background: '#121212',
          card: '#1e1e1e',
          text: '#ffffff',
          border: '#2c2c2c',
          notification: '#ff3b30',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: '#3498db',
          background: '#f5f5f5',
          card: '#ffffff',
          text: '#000000',
          border: '#e0e0e0',
          notification: '#ff3b30',
        },
      };

  return (
    <ThemeProvider value={navigationTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}