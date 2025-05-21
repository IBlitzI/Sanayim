import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { logout } from '../../../store/slices/authSlice';
import { toggleTheme, toggleNotifications } from '../../../store/slices/settingsSlice';
import { RootState } from '../../../store';
import { ChevronRight, Bell, Shield, CreditCard, CircleHelp as HelpCircle, LogOut, Moon, Sun } from 'lucide-react-native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { theme, notificationsEnabled } = useSelector((state: RootState) => state.settings);

  const isDark = theme === 'dark';

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // API'ye logout isteği gönder
              const response = await fetch('http://192.168.1.103:5000/api/users/logout', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                throw new Error('Logout failed');
              }

              // Redux state'i temizle
              dispatch(logout());
              
              // Login ekranına yönlendir
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Hata durumunda da state'i temizle ve login'e yönlendir
              dispatch(logout());
              router.replace('/(auth)/login');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#3498db' : '#2980b9' }]}>Account</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              <Shield size={20} color="#3498db" />
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Privacy & Security</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#95a5a6' : '#7f8c8d'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              <CreditCard size={20} color="#3498db" />
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Payment Methods</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#95a5a6' : '#7f8c8d'} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#3498db' : '#2980b9' }]}>Preferences</Text>

        {/* <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              <Bell size={20} color="#3498db" />
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Notifications</Text>
          </View>
          <Switch
            value={isDark} // isDark durumunu kontrol et
            onValueChange={(value: boolean) => {
              dispatch(toggleTheme()); // toggleTheme action'ını çağır
            }}
            trackColor={{ false: '#d0d0d0', true: '#2980b9' }}
            thumbColor={isDark ? '#3498db' : '#f4f3f4'}
          />
        </View> */}

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              {isDark ? (
                <Moon size={20} color="#3498db" />
              ) : (
                <Sun size={20} color="#3498db" />
              )}
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Switch
            value={isDark} 
            onValueChange={(value: boolean) => {
              dispatch(toggleTheme()); 
            }}
            trackColor={{ false: '#d0d0d0', true: '#2980b9' }}
            thumbColor={isDark ? '#3498db' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#3498db' : '#2980b9' }]}>Support</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              <HelpCircle size={20} color="#3498db" />
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Help Center</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#95a5a6' : '#7f8c8d'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)' }]}>
              <HelpCircle size={20} color="#3498db" />
            </View>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Contact Support</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#95a5a6' : '#7f8c8d'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: isDark ? 'rgba(231, 76, 60, 0.1)' : 'rgba(231, 76, 60, 0.05)' }
        ]}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>Sanayim v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});