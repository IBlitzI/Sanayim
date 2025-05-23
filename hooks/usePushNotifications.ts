import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { updatePushToken } from '../store/slices/authSlice';
import { RootState } from '../store';
// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const dispatch = useDispatch();
  const { token: authToken, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    
    registerForPushNotificationsAsync().then(token => {
      console.log('Push token:', token);
      if (token) {
        setExpoPushToken(token);
        
        // If the user is already logged in, update the token on the server
        if (authToken && user) {
          dispatch(updatePushToken(token));
          sendPushTokenToServer(token, authToken);
        }
      }
    });    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      // Handle navigation based on notification taps
      const data = response.notification.request.content.data;
      
      if (data && data.type === 'chat' && data.chatId) {
        // Import and use the router
        const { router } = require('expo-router');
        router.push(`/chat/${data.chatId}`);
      }
    });

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Send the push token to the server whenever auth token changes or when the push token is first obtained
  useEffect(() => {
    if (expoPushToken && authToken) {
      sendPushTokenToServer(expoPushToken, authToken);
    }
  }, [expoPushToken, authToken]);
  // Function to send push token to server
  const sendPushTokenToServer = async (pushToken: string, authToken: string) => {
    console.log("asdfafa")
    try {
      const response = await fetch(`${baseUrl}/api/users/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          expoPushToken: pushToken,
          platform: Platform.OS
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update push token on server');
      }
      
      console.log('Push token successfully sent to server');
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  };  // Token'ı konsola yazdır (production'da logları azaltmak için kaldırılabilir)
  useEffect(() => {
    if (expoPushToken) {
      console.log('Expo Push Token:', expoPushToken);
    }
  }, [expoPushToken]);

  return {
    expoPushToken,
    notification,
  };
}

// Function to register for push notifications
async function registerForPushNotificationsAsync() {
  let token;
  
  // Check if running on a physical device
  if (!Constants.deviceName?.startsWith("sdk_")) {
    console.log("fiziksel cihaz")

    // Get permissions for push notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }    // If no permission was granted, return null
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }      // Get push token with explicitly specifying projectId
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: "a064f946-4735-4723-90ce-348dce57bcfd", // Use the EAS project ID
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Set up specific notification channel for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3498db',
    });
  }
  

  return token;
}
