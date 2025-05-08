import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [tcKimlikNo, setTcKimlikNo] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [userType, setUserType] = useState<'vehicle_owner' | 'mechanic'>('vehicle_owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (userType === 'vehicle_owner') {
      if (!fullName || !email || !password || !licensePlate || !tcKimlikNo || !kvkkConsent) {
        setError('Please fill in all required fields and accept KVKK terms');
        return;
      }
    }

    setLoading(true);
    setError(null);

    if (userType === 'mechanic') {
      const subject = 'Sanayim App Mechanic Başvuru';
      const body = `Merhaba,

Ben Sanayim uygulamasına mekanik olarak başvurmak istiyorum.

Lütfen aşağıdaki bilgileri doldurunuz:

Ad Soyad:
İletişim Numarası:
Deneyim Yılı:
Uzmanlaştığı Araç Tipleri:
Adres:
Referanslar (Varsa):

Teşekkürler.`;

      const mailtoLink = `mailto:baskinmehmetali@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      Linking.openURL(mailtoLink);
      return;
    }

    try {
      const formData = new FormData();

      // Add text fields
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('licensePlate', licensePlate);
      formData.append('tcKimlikNo', tcKimlikNo);
      formData.append('userType', 'vehicle_owner');
      formData.append('kvkkConsent', String(kvkkConsent));

      // Add profile image if selected
      if (profileImage) {
        const imageFileName = profileImage.split('/').pop() || 'profile.jpg';
        formData.append('profileImage', {
          uri: profileImage,
          name: imageFileName,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('http://192.168.64.95:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../assets/images/Logo2.png')}
              style={styles.logo} 
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>SANAYIM</Text>
          <Text style={styles.tagline}>Join Our Automotive Community</Text>
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

          {userType === 'vehicle_owner' ? (
            <>
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

              <Input
                label="TC Kimlik No"
                value={tcKimlikNo}
                onChangeText={setTcKimlikNo}
                placeholder="Enter your TC Kimlik No"
                keyboardType="numeric"
              />

              <Input
                label="Vehicle License Plate"
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="Enter your license plate"
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={styles.kvkkContainer}
                onPress={() => setKvkkConsent(!kvkkConsent)}
              >
                <View style={[styles.checkbox, kvkkConsent && styles.checkboxChecked]}>
                  {kvkkConsent && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.kvkkText}>
                  Kişisel verilerimin işlenmesine ilişkin {' '}
                  <Text style={styles.kvkkLink} onPress={() => {/* KVKK metnini göster */ }}>
                    Aydınlatma Metni
                  </Text>
                  'ni okudum ve kabul ediyorum.
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.mechanicContainer}>
              <Text style={styles.mechanicText}>
                Mekanik olarak başvurmak için aşağıdaki butonu kullanarak bize mail gönderebilirsiniz.
              </Text>
            </View>
          )}

          <Button
            title={userType === 'mechanic' ? "Mail ile Başvuru Yap" : "Sign Up"}
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
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1e1e1e',
    padding: 3,
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 67,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(52, 152, 219, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
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
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  kvkkText: {
    flex: 1,
    color: '#bdc3c7',
    fontSize: 12,
  },
  kvkkLink: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  mechanicContainer: {
    padding: 20,
    backgroundColor: '#1e272e',
    borderRadius: 8,
    marginBottom: 20,
  },
  mechanicText: {
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
  },
});