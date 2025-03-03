import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedListing, addBidToListing, selectBid } from '../../../store/slices/listingsSlice';
import { createConversation } from '../../../store/slices/chatSlice';
import Button from '../../../components/Button';
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react-native';

// Mock listings data
const mockListings = [
  {
    id: '1',
    ownerId: '101',
    ownerName: 'Mehmet Kaya',
    vehicleLicensePlate: 'ABC123',
    description: 'My car makes a strange noise when I brake. Need help diagnosing the issue.',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'],
    location: 'Ostim Sanayi Bölgesi',
    status: 'open',
    createdAt: '2023-06-20T10:30:00Z',
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
    status: 'open',
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
    status: 'open',
    createdAt: '2023-06-18T09:15:00Z',
    bids: [],
  },
];

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Find the listing by ID
  const listing = mockListings.find(l => l.id === id);
  
  React.useEffect(() => {
    if (listing) {
      dispatch(setSelectedListing(listing));
    }
  }, [dispatch, listing]);

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const isVehicleOwner = user?.userType === 'vehicle_owner';
  const isMechanic = user?.userType === 'mechanic';
  const isOwner = listing.ownerId === user?.id;
  
  const handlePlaceBid = () => {
    if (!bidAmount || !estimatedTime || !bidMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newBid = {
        id: `bid-${Date.now()}`,
        mechanicId: user?.id || '',
        mechanicName: user?.fullName || '',
        amount: parseFloat(bidAmount),
        estimatedTime,
        message: bidMessage,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addBidToListing({ listingId: listing.id, bid: newBid }));
      
      setLoading(false);
      setBidAmount('');
      setEstimatedTime('');
      setBidMessage('');
      
      Alert.alert('Success', 'Your bid has been placed successfully');
    }, 1000);
  };

  const handleSelectBid = (bidId: string) => {
    Alert.alert(
      'Select Bid',
      'Are you sure you want to select this bid?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Select',
          onPress: () => {
            dispatch(selectBid({ listingId: listing.id, bidId }));
            
            // Find the selected bid
            const selectedBid = listing.bids.find(bid => bid.id === bidId);
            
            if (selectedBid) {
              // Create a conversation with the mechanic
              const newConversation = {
                id: `conv-${Date.now()}`,
                participantId: selectedBid.mechanicId,
                participantName: selectedBid.mechanicName,
                participantImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', // Mock image
                unreadCount: 0,
                messages: [],
              };
              
              dispatch(createConversation(newConversation));
              router.push(`/chat/${newConversation.id}`);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.licensePlate}>{listing.vehicleLicensePlate}</Text>
          <View style={[
            styles.statusBadge,
            listing.status === 'open' ? styles.openStatus :
            listing.status === 'assigned' ? styles.assignedStatus :
            styles.completedStatus
          ]}>
            <Text style={styles.statusText}>{listing.status}</Text>
          </View>
        </View>
        
        <Text style={styles.ownerName}>Owner: {listing.ownerName}</Text>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color="#3498db" />
          <Text style={styles.infoText}>{listing.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Clock size={16} color="#3498db" />
          <Text style={styles.infoText}>
            Posted on {new Date(listing.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>
      </View>
      
      {listing.bids.length > 0 && (
        <View style={styles.bidsContainer}>
          <Text style={styles.bidsTitle}>Bids ({listing.bids.length})</Text>
          
          {listing.bids.map((bid) => (
            <View key={bid.id} style={styles.bidItem}>
              <View style={styles.bidHeader}>
                <Text style={styles.bidderName}>{bid.mechanicName}</Text>
                <Text style={styles.bidAmount}>₺{bid.amount}</Text>
              </View>
              
              <View style={styles.bidInfoRow}>
                <Clock size={14} color="#95a5a6" />
                <Text style={styles.bidInfoText}>Estimated time: {bid.estimatedTime}</Text>
              </View>
              
              <View style={styles.bidInfoRow}>
                <Calendar size={14} color="#95a5a6" />
                <Text style={styles.bidInfoText}>
                  Bid placed on {new Date(bid.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.bidMessage}>{bid.message}</Text>
              
              {isOwner && listing.status === 'open' && (
                <Button
                  title="Select Bid"
                  onPress={() => handleSelectBid(bid.id)}
                  type="secondary"
                  style={styles.selectBidButton}
                />
              )}
              
              {listing.selectedBidId === bid.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      
      {isMechanic && listing.status === 'open' && (
        <View style={styles.placeBidContainer}>
          <Text style={styles.placeBidTitle}>Place Your Bid</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bid Amount (₺)</Text>
              <View style={styles.amountInputContainer}>
                <DollarSign size={16} color="#95a5a6" />
                <TextInput
                  style={styles.amountInput}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  placeholder="0"
                  placeholderTextColor="#95a5a6"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Estimated Time</Text>
              <TextInput
                style={styles.input}
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                placeholder="e.g. 2 hours"
                placeholderTextColor="#95a5a6"
              />
            </View>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={styles.messageInput}
              value={bidMessage}
              onChangeText={setBidMessage}
              placeholder="Describe how you'll fix the issue..."
              placeholderTextColor="#95a5a6"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <Button
            title="Place Bid"
            onPress={handlePlaceBid}
            loading={loading}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  licensePlate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  openStatus: {
    backgroundColor: '#3498db',
  },
  assignedStatus: {
    backgroundColor: '#f39c12',
  },
  completedStatus: {
    backgroundColor: '#2ecc71',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  ownerName: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#ecf0f1',
    marginLeft: 8,
    fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    color: '#ecf0f1',
    fontSize: 16,
    lineHeight: 24,
  },
  bidsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  bidsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  bidItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  bidInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidInfoText: {
    color: '#bdc3c7',
    marginLeft: 6,
    fontSize: 12,
  },
  bidMessage: {
    color: '#ecf0f1',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  selectBidButton: {
    marginTop: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2ecc71',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  placeBidContainer: {
    padding: 20,
    marginBottom: 20,
  },
  placeBidTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ecf0f1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  amountInputContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});