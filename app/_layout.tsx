import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '../store'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

function AppLayout() {
  const { theme } = useSelector((state: RootState) => state.settings);
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

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppLayout />
      </GestureHandlerRootView>
    </Provider>
  );
}