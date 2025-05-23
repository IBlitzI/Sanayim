import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUserProfile } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ChevronDown, ChevronUp } from 'lucide-react-native';
import Constants from 'expo-constants';

const SPECIALTY_CATEGORIES = {
  'Motor ve Güç Aktarımı': [
    'Motor tamiri ve bakımı',
    'Şanzıman (Manuel/Otomatik)',
    'Debriyaj sistemleri',
    'Turbo sistemleri',
    'Yakıt enjeksiyon sistemleri',
    'Egzoz sistemleri',
    'Soğutma sistemleri'
  ],
  'Elektrik ve Elektronik': [
    'Araç elektrik sistemleri',
    'ECU (Motor kontrol ünitesi)',
    'Diagnostik sistemler',
    'Aydınlatma sistemleri',
    'Klima sistemleri',
    'Akü ve şarj sistemleri',
    'Start-stop sistemleri'
  ],
  'Süspansiyon ve Direksiyon': [
    'Süspansiyon sistemleri',
    'Direksiyon sistemleri',
    'Rot ve rotbaşı',
    'Amortisör değişimi',
    'Aks ve rulman',
    'Lastik ve balans'
  ],
  'Fren Sistemleri': [
    'ABS sistemleri',
    'Fren bakım ve onarımı',
    'Disk ve balatalar',
    'Hidrolik sistemler'
  ],
  'Kaporta ve Boya': [
    'Kaporta onarımı',
    'Boya ve vernik',
    'Dolu hasarı onarımı',
    'PDR (Boyasız göçük düzeltme)'
  ],
  'Özel Sistemler': [
    'Hibrit sistemler',
    'Elektrikli araç sistemleri',
    'LPG/CNG sistemleri',
    'Performans modifikasyonları'
  ],
  'Araç Tiplerine Göre Uzmanlık': [
    'Binek araçlar',
    'Ticari araçlar',
    'Ağır vasıta',
    'Lüks/Spor araçlar',
    'Klasik araçlar'
  ],
  'Periyodik Bakım': [
    'Motor yağı değişimi',
    'Filtre değişimleri',
    'Triger seti değişimi',
    'Genel kontrol ve bakım'
  ]
};

export default function EditProfileScreen() {
  const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const isDark = theme === 'dark';
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setLocation(user.location || '');
      setLicensePlate(user.licensePlate || '');
      setProfileImage(user.profileImage || '');
      setSpecialties(user.specialties || []);
    }
  }, [user]);
  
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };
  
  const handleSave = async () => {
    if (!fullName) {
      Alert.alert('Hata', 'Lütfen adınızı giriniz');
      return;
    }
    
    if (isVehicleOwner && !licensePlate) {
      Alert.alert('Hata', 'Lütfen plaka numaranızı giriniz');
      return;
    }

    if (!token) {
      Alert.alert('Hata', 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Temel alanları ekle
      formData.append('fullName', fullName);
      
      // Lokasyon varsa ekle
      if (location) {
        formData.append('location', location);
      }

      // Araç sahibi ise plaka ekle
      if (isVehicleOwner && licensePlate) {
        formData.append('licensePlate', licensePlate);
      }

      // Tamirci ise uzmanlıkları ekle
      if (!isVehicleOwner && specialties.length > 0) {
        formData.append('specialties', JSON.stringify(specialties));
      }

      // Profil resmi değişmişse ve yerel dosya ise ekle
      if (profileImage && profileImage.startsWith('file://')) {
        const imageFileName = profileImage.split('/').pop() || 'profile.jpg';
        const imageType = imageFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        
        formData.append('profileImage', {
          uri: profileImage,
          name: imageFileName,
          type: imageType,
        } as any);
      }

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Profil güncellenirken bir hata oluştu');
      }

      // Redux state'i güncelle
      dispatch(updateUserProfile(responseData));
      
      Alert.alert(
        'Başarılı',
        'Profiliniz başarıyla güncellendi',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
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
              <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Uzmanlık Alanları</Text>
              <Text style={[styles.specialtiesNote, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                Aşağıdaki kategorilerden uzmanlık alanlarınızı seçin
              </Text>
              
              {Object.entries(SPECIALTY_CATEGORIES).map(([category, items]) => (
                <View key={category} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={[
                      styles.categoryHeader,
                      { backgroundColor: isDark ? '#2c3e50' : '#f0f0f0' }
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[styles.categoryTitle, { color: isDark ? '#fff' : '#000' }]}>
                      {category}
                    </Text>
                    {expandedCategories.includes(category) ? (
                      <ChevronUp size={20} color={isDark ? '#fff' : '#000'} />
                    ) : (
                      <ChevronDown size={20} color={isDark ? '#fff' : '#000'} />
                    )}
                  </TouchableOpacity>
                  
                  {expandedCategories.includes(category) && (
                    <View style={styles.specialtiesList}>
                      {items.map((specialty) => (
                        <TouchableOpacity
                          key={specialty}
                          style={[
                            styles.specialtyChip,
                            { 
                              backgroundColor: specialties.includes(specialty)
                                ? '#3498db'
                                : isDark ? '#34495e' : '#e0e0e0'
                            }
                          ]}
                          onPress={() => toggleSpecialty(specialty)}
                        >
                          <Text 
                            style={[
                              styles.specialtyText,
                              { 
                                color: specialties.includes(specialty)
                                  ? '#fff'
                                  : isDark ? '#ecf0f1' : '#2c3e50'
                              }
                            ]}
                          >
                            {specialty}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
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
    paddingHorizontal: 8,
  },
  specialtyChip: {
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});