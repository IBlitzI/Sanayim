import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { Redirect } from 'expo-router';
import { RootState } from '../../store';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function AppLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="mechanic/[id]" options={{ headerShown: true, title: 'Mechanic Profile' }} />
      <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: 'Repair Request' }} />
      <Stack.Screen 
        name="create-listing" 
        options={{ 
          headerShown: true, 
          title: 'Create Repair Request',
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
              <ArrowLeft size={24} color={isDark ? '#ffffff': '#000'} />
            </TouchableOpacity>
          )
        }} 
      />
      <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Chat' }} />
      <Stack.Screen name="payment/[id]" options={{ headerShown: true, title: 'Payment' }} />
      <Stack.Screen 
        name="ai-chat" 
        options={{ 
          headerShown: true, 
          title: 'AI Assistant',
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={isDark ? '#ffffff': '#000'} />
            </TouchableOpacity>
          )
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    paddingRight: 20
  }
});