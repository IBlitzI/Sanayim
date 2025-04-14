import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedZone, fetchMechanicsSuccess, fetchListingsSuccess } from '../../../store/slices/listingsSlice';
import type { Mechanic } from '../../../store/slices/listingsSlice';
import Card from '../../../components/Card';
import { ChevronDown, Plus, MessageSquare } from 'lucide-react-native';

const mockListings = [
  {
    id: '1',
    ownerId: '101',
    ownerName: 'Mehmet Kaya',
    vehicleLicensePlate: 'ABC123',
    description: 'My car makes a strange noise when I brake. Need help diagnosing the issue.',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'Ostim Sanayi Bölgesi',
    status: 'open' as 'open',
    createdAt: '2023-06-20T10:30:00Z',
    selectedBidId: null,
    bids: [
      {
        id: 'bid1',
        mechanicId: '1',
        mechanicName: 'Ahmet Yılmaz',
        amount: 750,
        estimatedTime: '2 hours',
        message: 'I can fix your brake issue. It sounds like worn brake pads.',
        createdAt: '2023-06-20T12:30:00Z',
      },
    ],
  },
  {
    id: '2',
    ownerId: '102',
    ownerName: 'Ayşe Tekin',
    vehicleLicensePlate: 'XYZ789',
    description: 'Engine light is on. Car is running rough and has reduced power.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'İvedik Sanayi Bölgesi',
    status: 'open' as 'open',
    createdAt: '2023-06-19T14:45:00Z',
    selectedBidId: null,
    bids: [],
  },
  {
    id: '3',
    ownerId: '103',
    ownerName: 'Ali Rıza',
    vehicleLicensePlate: 'DEF456',
    description: 'Need to replace the timing belt on my 2015 Toyota Corolla.',
    images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'Sincan Sanayi Bölgesi',
    status: 'open' as 'open',
    createdAt: '2023-06-18T09:15:00Z',
    selectedBidId: null,
    bids: [],
  },
];

const parseSpecialties = (specialtiesData: string[]) => {
  if (!specialtiesData || !specialtiesData.length) return [];

  return specialtiesData.map(specialty => {
    try {
      const parsed = JSON.parse(specialty);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          const cleaned = item.replace(/\\"/g, '"').replace(/^"|"$/g, '');
          try {
            if (cleaned.startsWith('[')) {
              const parsedInner = JSON.parse(cleaned);
              return Array.isArray(parsedInner) ? parsedInner[0] : cleaned;
            }
            return cleaned;
          } catch {
            return cleaned;
          }
        });
      }
      return [specialty];
    } catch (e) {
      return [specialty];
    }
  }).flat().filter(Boolean);
};

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { industrialZones, selectedZone, mechanics, listings } = useSelector((state: RootState) => state.listings);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [loading, setLoading] = useState(true);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  
  const isDark = theme === 'dark';
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isVehicleOwner && selectedZone) {
          const response = await fetch('http://192.168.157.95:5000/api/repair-listings/mechanics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ location: selectedZone }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch mechanics');
          }
          const data = await response.json();
          dispatch(fetchMechanicsSuccess(data.data));
        } else if (!isVehicleOwner) {
          dispatch(fetchListingsSuccess(mockListings));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!selectedZone && industrialZones.length > 0) {
      dispatch(setSelectedZone(industrialZones[0]));
    } else {
      fetchData();
    }
  }, [dispatch, isVehicleOwner, selectedZone, token, industrialZones]);

  const handleZoneSelect = (zone: string) => {
    dispatch(setSelectedZone(zone));
    setShowZoneDropdown(false);
  };

  const handleMechanicPress = (mechanicId: string) => {
    router.push(`/mechanic/${mechanicId}`);
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const filteredListings = listings.filter(listing => {
    // Eğer kullanıcı vehicle owner ise sadece kendi ilanlarını göster
    if (isVehicleOwner) {
      return listing.ownerId === user?.id && listing.status === 'open';
    }
    // Mechanic için seçili bölgedeki açık ilanları göster
    return !selectedZone || (listing.location === selectedZone && listing.status === 'open');
  });

  const renderMechanicItem = ({ item }: { item: Mechanic }) => {
    const parsedSpecialties = parseSpecialties(item.specialties || []);
    return (
      <Card
        title={item.fullName}
        subtitle={item.location}
        description={`Specializes in ${parsedSpecialties.join(', ') || 'General Repair'}`}
        image={item.profileImage}
        rating={item.rating}
        onPress={() => handleMechanicPress(item._id)}
      />
    );
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <Card
      title={`${item.vehicleLicensePlate} - ${item.ownerName}`}
      subtitle={item.location}
      description={item.description}
      image={item.images[0]}
      onPress={() => handleListingPress(item.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Industrial Zone:</Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: isDark ? '#2c3e50' : '#ffffff' }]}
            onPress={() => setShowZoneDropdown(!showZoneDropdown)}
          >
            <Text style={[styles.dropdownText, { color: isDark ? '#fff' : '#000' }]}>{selectedZone || 'Select Zone'}</Text>
            <ChevronDown size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          {showZoneDropdown && (
            <View style={[styles.dropdownMenu, { 
              backgroundColor: isDark ? '#2c3e50' : '#ffffff',
              borderColor: isDark ? '#34495e' : '#e0e0e0',
            }]}>
              {industrialZones.map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={[styles.dropdownItem, { borderBottomColor: isDark ? '#34495e' : '#e0e0e0' }]}
                  onPress={() => handleZoneSelect(zone)}
                >
                  <Text style={[styles.dropdownItemText, { color: isDark ? '#fff' : '#000' }]}>{zone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        ) : (
          <>
            {isVehicleOwner ? (
              <>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Mechanics in {selectedZone}</Text>
                <FlatList
                  data={mechanics}
                  renderItem={renderMechanicItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>No mechanics found in this area</Text>
                  }
                />
              </>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Repair Requests in {selectedZone}</Text>
                <FlatList
                  data={filteredListings}
                  renderItem={renderListingItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>No repair requests found in this area</Text>
                  }
                />
              </>
            )}
          </>
        )}
      </View>
      {isVehicleOwner ? <TouchableOpacity 
        style={[styles.aiChatButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
        onPress={() => router.push('/ai-chat')}
      >
        <MessageSquare size={24} color="#fff" />
      </TouchableOpacity> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#ecf0f1',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#34495e',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34495e',
    zIndex: 20,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});