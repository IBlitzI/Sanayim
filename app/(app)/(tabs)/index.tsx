import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedZone, fetchMechanicsSuccess, fetchListingsSuccess } from '../../../store/slices/listingsSlice';
import Card from '../../../components/Card';
import { ChevronDown, Plus } from 'lucide-react-native';

const mockMechanics = [
  {
    id: '1',
    fullName: 'Ahmet Yılmaz',
    location: 'Ostim Sanayi Bölgesi',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    rating: 4.8,
    specialties: ['Engine Repair', 'Electrical Systems'],
    reviews: [
      { id: '1', userId: '101', userName: 'Mehmet K.', rating: 5, comment: 'Great service, fixed my car quickly.', date: '2023-05-15' },
      { id: '2', userId: '102', userName: 'Ayşe T.', rating: 4, comment: 'Professional and knowledgeable.', date: '2023-04-22' },
    ],
  },
  {
    id: '2',
    fullName: 'Mustafa Demir',
    location: 'Ostim Sanayi Bölgesi',
    profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    specialties: ['Brake Systems', 'Suspension'],
    reviews: [
      { id: '1', userId: '103', userName: 'Ali R.', rating: 5, comment: 'Fixed my brakes perfectly.', date: '2023-06-10' },
      { id: '2', userId: '104', userName: 'Zeynep S.', rating: 4, comment: 'Good work on my suspension.', date: '2023-05-28' },
    ],
  },
  {
    id: '3',
    fullName: 'Emre Kaya',
    location: 'İvedik Sanayi Bölgesi',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    specialties: ['Transmission', 'Engine Diagnostics'],
    reviews: [
      { id: '1', userId: '105', userName: 'Hakan B.', rating: 5, comment: 'Best mechanic in the area!', date: '2023-06-18' },
      { id: '2', userId: '106', userName: 'Selin K.', rating: 5, comment: 'Diagnosed my engine problem quickly.', date: '2023-06-05' },
    ],
  },
];

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


export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { industrialZones, selectedZone, mechanics, listings } = useSelector((state: RootState) => state.listings);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [loading, setLoading] = useState(true);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  
  const isDark = theme === 'dark';
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  useEffect(() => {
    setTimeout(() => {
      if (isVehicleOwner) {
        dispatch(fetchMechanicsSuccess(mockMechanics));
      } else {
        dispatch(fetchListingsSuccess(mockListings));
      }
      
      if (!selectedZone && industrialZones.length > 0) {
        dispatch(setSelectedZone(industrialZones[0]));
      }
      
      setLoading(false);
    }, 1000);
  }, [dispatch, isVehicleOwner, selectedZone, industrialZones]);

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

  const filteredMechanics = mechanics.filter(
    mechanic => !selectedZone || mechanic.location === selectedZone
  );

  const filteredListings = listings.filter(
    listing => !selectedZone || listing.location === selectedZone
  );

  const renderMechanicItem = ({ item }: { item: any }) => (
    <Card
      title={item.fullName}
      subtitle={item.location}
      description={`Specializes in ${item.specialties.join(', ')}`}
      image={item.profileImage}
      rating={item.rating}
      onPress={() => handleMechanicPress(item.id)}
    />
  );

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
                  data={filteredMechanics}
                  renderItem={renderMechanicItem}
                  keyExtractor={(item) => item.id}
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
});