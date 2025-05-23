import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addNewListing } from '../../store/slices/listingsSlice';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, ChevronDown, MessageSquare, ChevronLeft } from 'lucide-react-native';
import Constants from 'expo-constants';

export default function CreateListingScreen() {
  const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { industrialZones, selectedZone } = useSelector((state: RootState) => state.listings);
  
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState(selectedZone || industrialZones[0]);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  
  const pickMedia = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
        Alert.alert('Permission Needed', 'We need permission to access your photos and videos.');
        return;
      }
  
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Hem resim hem video seçme
        allowsEditing: true, // Kullanıcıya düzenleme imkanı (isteğe bağlı)
        quality: 1, // En yüksek kalite
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }
    
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location);

      // Append each image to formData
      images.forEach((imageUri, index) => {
        const imageUriParts = imageUri.split('.');
        const fileExtension = imageUriParts[imageUriParts.length - 1];
        const fileName = `image-${index + 1}.${fileExtension}`;

        formData.append('files', {
          uri: imageUri,
          name: fileName,
          type: `image/${fileExtension}`
        } as any);
      });

      const response = await fetch(`${baseUrl}/api/repair-listings`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create repair request');
      }

      Alert.alert(
        'Success',
        'Your repair request has been created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating repair request:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create repair request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ecf0f1' }]}
        contentContainerStyle={{ paddingTop: 80 }} // Add top padding for back button
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? '#222' : '#fff',
            },
          ]}
          onPress={() => router.replace('/(app)/(tabs)')}
        >
          <ChevronLeft size={28} color={isDark ? '#fff' : '#222'} />
        </TouchableOpacity>
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>Vehicle Issue</Text>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: isDark ? '#2c3e50' : '#ffffff', 
                color: isDark ? '#fff' : '#2c3e50',
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue with your vehicle..."
            placeholderTextColor="#95a5a6"
            multiline
            numberOfLines={6}
          />
          
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>Photos</Text>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
            Add photos of the damage or issue to help mechanics understand the problem
          </Text>
          
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity style={[styles.addImageButton, { borderColor: isDark ? '#3498db' : '#2980b9' }]} onPress={pickMedia}>
                <Camera size={24} color={isDark ? '#3498db' : '#2980b9'} />
                <Text style={[styles.addImageText, { color: isDark ? '#3498db' : '#2980b9' }]}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>Location</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: isDark ? '#2c3e50' : '#ffffff', 
                },
              ]}
              onPress={() => setShowZoneDropdown(!showZoneDropdown)}
            >
              <Text style={[styles.dropdownText, { color: isDark ? '#fff' : '#2c3e50' }]}>{location || 'Select Industrial Zone'}</Text>
              <ChevronDown size={20} color={isDark ? '#fff': '#2c3e50'} />
            </TouchableOpacity>
            
            {showZoneDropdown && (
              <View style={[
                styles.dropdownMenu,
                {
                  backgroundColor: isDark ? '#2c3e50' : '#ffffff', 
                  borderColor: isDark ? '#34495e' : '#bdc3c7',
                },
              ]}>
                {industrialZones.map((zone) => (
                  <TouchableOpacity
                    key={zone}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: isDark ? '#34495e' : '#bdc3c7' },
                    ]}
                    onPress={() => {
                      setLocation(zone);
                      setShowZoneDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: isDark ? '#fff' : '#2c3e50' }]}>{zone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <Button
            title="Submit Repair Request"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={[styles.aiChatButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
        onPress={() => router.push('/ai-chat')}
      >
        <MessageSquare size={24} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  descriptionInput: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
  },
  locationContainer: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 10,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 20,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  aiChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 200,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});