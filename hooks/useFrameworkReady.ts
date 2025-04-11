import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth } from '../store/slices/authSlice';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        const [token, userData] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('user_data'),
        ]);

        if (token && userData) {
          dispatch(initializeAuth({
            token,
            user: JSON.parse(userData)
          }));
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      }
    };

    initializeAuthState();
  }, [dispatch]);
}