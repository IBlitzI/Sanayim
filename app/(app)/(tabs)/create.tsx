import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  
  // Only vehicle owners can access this screen
  if (user?.userType !== 'vehicle_owner') {
    return <Redirect href="/(app)/(tabs)" />;
  }
  
  // Redirect to the create listing form
  React.useEffect(() => {
    router.replace('/create-listing');
  }, [router]);

  return <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#121212', // Remove this line
  },
});