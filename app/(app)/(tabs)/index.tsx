import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedZone, fetchMechanicsSuccess, fetchListingsSuccess } from '../../../store/slices/listingsSlice';
import Card from '../../../components/Card';
import { ChevronDown } from 'lucide-react-native';

// Mock data for mechanics
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

// Mock data for repair listings
const mockListings = [
  {
    id: '1',
    ownerId: '101',
    ownerName: 'Mehmet Kaya',
    vehicleLicensePlate: 'ABC123',
    description: 'My car makes a strange noise when I brake. Need help diagnosing the issue.',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'Ostim Sanayi Bölgesi',
    status: 'open' as 'open', // Ensure the status is correctly typed
    createdAt: '2023-06-20T10:30:00Z',
    bids: [],
  },
  {
    id: '2',
    ownerId: '102',
    ownerName: 'Ayşe Tekin',
    vehicleLicensePlate: 'XYZ789',
    description: 'Engine light is on. Car is running rough and has reduced power.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'İvedik Sanayi Bölgesi',
    status: 'open' as 'open', // Ensure the status is correctly typed
    createdAt: '2023-06-19T14:45:00Z',
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
    status: 'open' as 'open', // Ensure the status is correctly typed
    createdAt: '2023-06-18T09:15:00Z',
    bids: [],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { industrialZones, selectedZone, mechanics, listings } = useSelector((state: RootState) => state.listings);
  
  const [loading, setLoading] = useState(true);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  
  const isVehicleOwner = user?.userType === 'vehicle_owner';

  useEffect(() => {
    // Simulate API call to fetch data
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
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Industrial Zone:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowZoneDropdown(!showZoneDropdown)}
        >
          <Text style={styles.dropdownText}>{selectedZone || 'Select Zone'}</Text>
          <ChevronDown size={20} color="#fff" />
        </TouchableOpacity>
        
        {showZoneDropdown && (
          <View style={styles.dropdownMenu}>
            {industrialZones.map((zone) => (
              <TouchableOpacity
                key={zone}
                style={styles.dropdownItem}
                onPress={() => handleZoneSelect(zone)}
              >
                <Text style={styles.dropdownItemText}>{zone}</Text>
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
              <Text style={styles.sectionTitle}>Mechanics in {selectedZone}</Text>
              <FlatList
                data={filteredMechanics}
                renderItem={renderMechanicItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No mechanics found in this area</Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Repair Requests in {selectedZone}</Text>
              <FlatList
                data={filteredListings}
                renderItem={renderListingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No repair requests found in this area</Text>
                }
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
});