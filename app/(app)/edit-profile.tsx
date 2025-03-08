import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUserProfile } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [licensePlate, setLicensePlate] = useState(user?.licensePlate || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState(user?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const isDark = theme === 'dark';
  const isVehicleOwner = user?.userType === 'vehicle_owner';
  
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

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = specialties.filter((_, i) => i !== index);
    setSpecialties(newSpecialties);
  };
  
  const handleSave = () => {
    if (!fullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (isVehicleOwner && !licensePlate) {
      Alert.alert('Error', 'Please enter your license plate');
      return;
    }
    
    setLoading(true);
    
    // Update profile with specialties
    setTimeout(() => {
      dispatch(updateUserProfile({
        fullName,
        location,
        licensePlate: isVehicleOwner ? licensePlate : undefined,
        profileImage,
        specialties: !isVehicleOwner ? specialties : undefined,
      }));
      
      setLoading(false);
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Camera size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#34495e' : '#e0e0e0',
                }
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Location</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#34495e' : '#e0e0e0',
                }
              ]}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
              placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
            />
          </View>
          
          {isVehicleOwner && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>License Plate</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#34495e' : '#e0e0e0',
                  }
                ]}
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="Enter your license plate"
                placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
                autoCapitalize="characters"
              />
            </View>
          )}
          
          {!isVehicleOwner && (
            <View style={styles.specialtiesContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Specialties</Text>
              <View style={styles.specialtiesList}>
                {specialties.map((specialty, index) => (
                  <View key={index} style={[styles.specialtyChip, { backgroundColor: isDark ? '#2c3e50' : '#e0e0e0' }]}>
                    <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>{specialty}</Text>
                    <TouchableOpacity onPress={() => removeSpecialty(index)}>
                      <X size={16} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addSpecialtyContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={newSpecialty}
                  onChangeText={setNewSpecialty}
                  placeholder="Add new specialty"
                  placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
                />
                <TouchableOpacity 
                  style={[styles.addButton, { opacity: newSpecialty.trim() ? 1 : 0.5 }]}
                  onPress={addSpecialty}
                  disabled={!newSpecialty.trim()}
                >
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  specialtiesContainer: {
    marginBottom: 20,
  },
  specialtiesNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: 10,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    marginRight: 8,
  },
  addSpecialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});