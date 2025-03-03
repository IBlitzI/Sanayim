import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SignupScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [userType, setUserType] = useState<'vehicle_owner' | 'mechanic'>('vehicle_owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = () => {
    if (!fullName || !email || !password || (userType === 'vehicle_owner' && !licensePlate)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/login');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1631467886198-acfcacd3d494?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }} 
            style={styles.logo} 
          />
          <Text style={styles.appName}>Sanayim</Text>
        </View>

        <View style={styles.formContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'vehicle_owner' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('vehicle_owner')}
            >
              <Text style={[
                styles.userTypeText,
                userType === 'vehicle_owner' && styles.userTypeTextActive
              ]}>
                Vehicle Owner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'mechanic' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('mechanic')}
            >
              <Text style={[
                styles.userTypeText,
                userType === 'mechanic' && styles.userTypeTextActive
              ]}>
                Mechanic
              </Text>
            </TouchableOpacity>
          </View>
          
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
          />
          
          {userType === 'vehicle_owner' && (
            <Input
              label="Vehicle License Plate"
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Enter your license plate"
              autoCapitalize="characters"
            />
          )}
          
          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
          />
          
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34495e',
  },
  userTypeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  userTypeText: {
    color: '#bdc3c7',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: '#fff',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#3498db',
    fontWeight: '600',
  },
});