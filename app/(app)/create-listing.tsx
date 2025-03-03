import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addNewListing } from '../../store/slices/listingsSlice';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, ChevronDown, ChevronLeft } from 'lucide-react-native';

export default function CreateListingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { industrialZones, selectedZone } = useSelector((state: RootState) => state.listings);
  
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState(selectedZone || industrialZones[0]);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = () => {
    if (!description) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }
    
    // if (images.length === 0) {
    //   Alert.alert('Error', 'Please add at least one image');
    //   return;
    // }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newListing = {
        id: `listing-${Date.now()}`,
        ownerId: user?.id || '',
        ownerName: user?.fullName || '',
        vehicleLicensePlate: user?.licensePlate || '',
        description,
        images,
        location,
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      };
      
      dispatch(addNewListing(newListing as any));
      
      setLoading(false);
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
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Vehicle Issue</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue with your vehicle..."
          placeholderTextColor="#95a5a6"
          multiline
          numberOfLines={6}
        />
        
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSubtitle}>
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
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Camera size={24} color="#3498db" />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowZoneDropdown(!showZoneDropdown)}
          >
            <Text style={styles.dropdownText}>{location || 'Select Industrial Zone'}</Text>
            <ChevronDown size={20} color="#fff" />
          </TouchableOpacity>
          
          {showZoneDropdown && (
            <View style={styles.dropdownMenu}>
              {industrialZones.map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setLocation(zone);
                    setShowZoneDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{zone}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 16,
  },
  descriptionInput: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
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
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  addImageText: {
    color: '#3498db',
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
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 16,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34495e',
    zIndex: 20,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});