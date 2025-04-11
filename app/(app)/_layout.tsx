import { Slot } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated && !token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}