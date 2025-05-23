import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions, FlatList, Modal, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { addBidToListing, selectBid, updateListingStatus } from '../../../store/slices/listingsSlice';
import { createConversation } from '../../../store/slices/chatSlice';
import Button from '../../../components/Button';
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Owner {
  _id: string;
  fullName: string;
  profileImage: string;
}

interface MediaFile {
  data: string;
  type: 'image' | 'video';
  _id: string;
}

interface MechanicProfile {
  _id: string;
  fullName: string;
  location: string;
  specialties: string[];
  profileImage: string;
}

interface Bid {
  _id: string;
  mechanicId: MechanicProfile;
  mechanicName: string;
  amount: number;
  estimatedTime: string;
  message: string;
  createdAt: string;
}

interface RepairListing {
  _id: string;
  ownerId: Owner;
  ownerName: string;
  vehicleLicensePlate: string;
  description: string;
  location: string;
  status: 'open' | 'assigned' | 'completed';
  mediaFiles: MediaFile[];
  bids: Bid[];
  selectedBidId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

export default function ListingDetailScreen() {
  const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [listing, setListing] = useState<RepairListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isBidLoading, setBidLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [bidSubmitSuccess, setBidSubmitSuccess] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const flatListRef = useRef<FlatList<MediaFile>>(null);
  
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchRepairRequest(true);
  }, [id]);
  
  // Effect to refresh the page after successful bid submission
  useEffect(() => {
    if (bidSubmitSuccess) {
      // Reset the flag
      setBidSubmitSuccess(false);
      // Refresh the page after a short delay to ensure the alert is shown
      setTimeout(() => {
        router.replace(`/listing/${id}`);
      }, 500);
    }
  }, [bidSubmitSuccess, id, router]);

  const fetchRepairRequest = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`${baseUrl}/api/repair-listings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repair request');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setListing(result.data);
      } else {
        throw new Error('Repair request not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Stack.Screen options={{ 
          title: 'Repair Request',
          headerStyle: { 
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          },
          headerTintColor: isDark ? '#fff' : '#000',
        }} />
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Stack.Screen options={{ 
          title: 'Repair Request',
          headerStyle: { 
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          },
          headerTintColor: isDark ? '#fff' : '#000',
        }} />
        <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#e74c3c' }]}>
          {error || 'Repair request not found'}
        </Text>
      </View>
    );
  }

  const isVehicleOwner = user?.userType === 'vehicle_owner';
  const isMechanic = user?.userType === 'mechanic';
  const isOwner = listing.ownerId._id === user?.id;
  
  const handlePlaceBid = async () => {
    if (!bidAmount || !estimatedTime || !bidMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setBidLoading(true);
    let bidSubmitted = false;
    
    try {
      // Call the API endpoint as specified: router.post('/:id/bids', protect, authorize('mechanic'), submitBid)
      const response = await fetch(`${baseUrl}/api/repair-listings/${listing._id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
          estimatedTime,
          message: bidMessage,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit bid');
      }
      
      console.log('Response data:', responseData);
      
      // Create the bid object using our own data since the API response structure is different
      const newBid = {
        id: responseData.bid?._id || `bid-${Date.now()}`,
        mechanicId: user?.id || '',
        mechanicName: user?.fullName || '',
        amount: parseFloat(bidAmount),
        estimatedTime,
        message: bidMessage,
        createdAt: responseData.bid?.createdAt || new Date().toISOString(),
      };
        
      // Update Redux store
      dispatch(addBidToListing({ listingId: listing._id, bid: newBid }));
      
      // Clear input fields
      setBidAmount('');
      setEstimatedTime('');
      setBidMessage('');
      
      // Mark that the bid was submitted successfully
      bidSubmitted = true;
      
      // The server will send a push notification to the vehicle owner automatically
      // since we've added the proper push token API endpoint
      
      // Show success alert
      Alert.alert(
        'Başarılı', 
        'Teklifiniz başarıyla gönderildi',
        [
          { 
            text: 'Tamam'
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert(
        'Hata', 
        error instanceof Error ? error.message : 'Teklif gönderirken bir sorun oluştu',
        [{ text: 'Tamam' }]
      );
    } finally {
      setBidLoading(false);
      
      // If bid was successfully submitted, trigger page refresh
      if (bidSubmitted) {
        setBidSubmitSuccess(true);
      }
    }
  };

  const handleSelectBid = (bidId: string) => {
    Alert.alert(
      'Teklif Seçimi',
      'Bu teklifi seçmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Seç',
          onPress: async () => {
            try {
              // Show loading indicator
              setLoading(true);
              
              // Call the API endpoint
              const response = await fetch(`${baseUrl}/api/repair-listings/select-bid`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  listingId: listing._id,
                  bidId: bidId
                }),
              });
              
              const responseData = await response.json();
              
              if (!response.ok) {
                throw new Error(responseData.message || 'Failed to select bid');
              }
              
              // Update Redux store
              dispatch(selectBid({ listingId: listing._id, bidId }));
              
              // Update local state to immediately show the selected bid
              setListing({
                ...listing,
                selectedBidId: bidId,
                status: 'assigned'
              });
              
              // Find the selected bid
              const selectedBid = listing.bids.find(bid => bid._id === bidId);
              
              if (selectedBid) {
                // Ask if user wants to contact mechanic immediately
                Alert.alert(
                  'Başarılı',
                  'Teklif başarıyla seçildi. İlgili tamirci ile hemen iletişime geçmek ister misiniz?',
                  [
                    { 
                      text: 'Hayır', 
                      style: 'cancel'
                    },
                    { 
                      text: 'Evet', 
                      onPress: async () => {
                        try {
                          // Initialize chat with the mechanic
                          const chatResponse = await fetch(`${baseUrl}/api/chat`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              mechanicId: selectedBid.mechanicId._id,
                            }),
                          });
                          
                          if (!chatResponse.ok) {
                            const errorData = await chatResponse.json();
                            throw new Error(errorData.message || 'Failed to create chat');
                          }
                          
                          const { success, data } = await chatResponse.json();
                          
                          if (success && data) {
                            // Transform MongoDB chat data into frontend format
                            const newChat = {
                              id: data._id,
                              participantId: selectedBid.mechanicId._id,
                              participantName: selectedBid.mechanicId.fullName,
                              participantImage: selectedBid.mechanicId.profileImage,
                              lastMessage: '',
                              lastMessageTime: data.lastMessage,
                              unreadCount: 0,
                              messages: []
                            };
                            
                            // Add the chat to Redux store
                            dispatch(createConversation(newChat));
                            
                            // Navigate to chat screen
                            router.push(`/chat/${data._id}`);
                          } else {
                            throw new Error('Invalid response format');
                          }
                        } catch (error) {
                          console.error('Error creating chat:', error);
                          Alert.alert('Hata', 'Tamirci ile sohbet başlatılırken bir sorun oluştu');
                        }
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error selecting bid:', error);
              Alert.alert(
                'Hata', 
                error instanceof Error ? error.message : 'Teklif seçiminde bir sorun oluştu. Lütfen tekrar deneyin.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteListing = async () => {
    Alert.alert(
      "Complete Repair",
      "Are you sure you want to mark this repair as completed?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Complete",
          onPress: async () => {
            try {
              setIsCompleting(true);
              
              const response = await fetch(`${baseUrl}/api/repair-listings/complete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  listingId: listing?._id
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete repair');
              }

              const result = await response.json();
              
              if (result.success) {
                // Update local state to show completed status
                if (listing) {
                  setListing({
                    ...listing,
                    status: 'completed'
                  });
                }
                
                // Update the status in Redux
                dispatch(updateListingStatus({ 
                  listingId: listing?._id || '', 
                  status: 'completed' 
                }));

                // Find the vehicle owner and send them a notification via chat
                try {
                  if (listing && listing.ownerId) {
                    // Create or find chat with the vehicle owner
                    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        mechanicId: listing.ownerId._id, // Send to vehicle owner
                      }),
                    });
                    
                    if (!chatResponse.ok) {
                      throw new Error('Failed to create or find chat with vehicle owner');
                    }
                    
                    const chatData = await chatResponse.json();
                    
                    if (chatData.success && chatData.data) {
                      // Send message to the vehicle owner with payment link
                      const messageContent = `Aracınızın tamiri tamamlandı. Ödeme ekranına gitmek için tıklayınız: [PAYMENT_LINK:${listing._id}]`;
                      
                      const messageResponse = await fetch(`${baseUrl}/api/chat/messages`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          chatId: chatData.data._id,
                          content: messageContent,
                        }),
                      });
                      
                      if (!messageResponse.ok) {
                        console.error('Failed to send completion notification to vehicle owner');
                      }
                      
                      // A push notification will be sent automatically through the backend
                      // since the recipient of this message has their expo push token saved
                    }
                  }
                } catch (chatError) {
                  console.error('Error notifying vehicle owner:', chatError);
                  // Don't throw the error as the main operation was successful
                }
                
                Alert.alert('Success', 'The repair has been marked as completed!');
              } else {
                throw new Error(result.message || 'Failed to mark repair as completed');
              }
            } catch (error) {
              console.error('Error completing listing:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to mark repair as completed');
            } finally {
              setIsCompleting(false);
            }
          }
        }
      ]
    );
  };

  const renderMediaItem = ({ item, index }: { item: MediaFile; index: number }) => {
    const isVideo = item.type === 'video';
    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedMedia({ uri: item.data, type: item.type });
          setModalVisible(true);
        }}
        style={styles.mediaSlide}
      >
        {isVideo ? (
          <Video
            source={{ uri: item.data }}
            style={styles.media}
            useNativeControls
            isLooping
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : (
          <Image
            source={{ uri: item.data }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderThumbnail = ({ item, index }: { item: MediaFile; index: number }) => {
    const isVideo = item.type === 'video';
    return (
      <TouchableOpacity 
        onPress={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true });
          }
          setActiveIndex(index);
        }}
        style={[
          styles.thumbnail,
          activeIndex === index && styles.activeThumbnail
        ]}
      >
        <Image
          source={{ uri: item.data }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Text style={styles.videoIndicatorText}>▶</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <Stack.Screen options={{ 
        title: 'Repair Request',
        headerStyle: { 
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        },
        headerTintColor: isDark ? '#fff' : '#000',
      }} />
      
      <View style={styles.mediaContainer}>
        <FlatList
          ref={flatListRef}
          data={listing.mediaFiles}
          renderItem={renderMediaItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const contentOffset = e.nativeEvent.contentOffset;
            const viewSize = e.nativeEvent.layoutMeasurement;
            const newIndex = Math.floor(contentOffset.x / viewSize.width);
            setActiveIndex(newIndex);
          }}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
        
        {listing.mediaFiles?.length > 1 && (
          <>
            <View style={styles.paginationDots}>
              {listing.mediaFiles.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeIndex && styles.paginationDotActive,
                    { backgroundColor: isDark ? '#fff' : '#000' }
                  ]}
                />
              ))}
            </View>

            <View style={styles.thumbnailContainer}>
              <FlatList
                data={listing.mediaFiles}
                renderItem={renderThumbnail}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            </View>
          </>
        )}
      </View>
      
      <View style={[styles.detailsContainer, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <View style={styles.header}>
          <Text style={[styles.licensePlate, { color: isDark ? '#fff' : '#000' }]}>{listing.vehicleLicensePlate}</Text>
          <View style={[
            styles.statusBadge,
            listing.status === 'open' ? styles.openStatus :
            listing.status === 'assigned' ? styles.assignedStatus :
            styles.completedStatus
          ]}>
            <Text style={styles.statusText}>{listing.status}</Text>
          </View>
        </View>
        
        {/* Complete button for mechanic under the assigned status */}
        {isMechanic && listing.status === 'assigned' && listing.selectedBidId && listing.bids.some(bid => 
          bid._id === listing.selectedBidId && 
          bid.mechanicId._id === user?.id
        ) && (
          <View style={{ alignItems: 'flex-end', marginTop: 8, marginBottom: 8 }}>
            <TouchableOpacity 
              onPress={handleCompleteListing}
              disabled={isCompleting}
              style={[
                styles.statusBadge, 
                styles.completeButtonBadge,
                isCompleting && { opacity: 0.7 }
              ]}
            >
              <Text style={styles.statusText}>
                {isCompleting ? "Completing..." : "Mark as Completed"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={[styles.ownerName, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Owner: {listing.ownerId.fullName}</Text>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color="#3498db" />
          <Text style={[styles.infoText, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{listing.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Clock size={16} color="#3498db" />
          <Text style={[styles.infoText, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>
            Posted on {new Date(listing.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionTitle, { color: isDark ? '#fff' : '#000' }]}>Description</Text>
          <Text style={[styles.description, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{listing.description}</Text>
        </View>
      </View>
      
      {listing.bids.length > 0 && (
        <View style={[styles.bidsContainer, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
          <Text style={[styles.bidsTitle, { color: isDark ? '#fff' : '#000' }]}>Bids ({listing.bids.length})</Text>
          
          {listing.bids.map((bid) => (
            <View key={bid._id} style={[styles.bidItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
              <View style={styles.bidHeader}>
                <Text style={[styles.bidderName, { color: isDark ? '#fff' : '#000' }]}>{bid.mechanicName}</Text>
                <Text style={styles.bidAmount}>₺{bid.amount}</Text>
              </View>
              
              <View style={styles.bidInfoRow}>
                <Clock size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                <Text style={[styles.bidInfoText, { color: isDark ? '#bdc3c7' : '#7f8c8d' }]}>Estimated time: {bid.estimatedTime}</Text>
              </View>
              
              <View style={styles.bidInfoRow}>
                <Calendar size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                <Text style={[styles.bidInfoText, { color: isDark ? '#bdc3c7' : '#7f8c8d' }]}>
                  Bid placed on {new Date(bid.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={[styles.bidMessage, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{bid.message}</Text>
              
              {isOwner && listing.status === 'open' && !listing.selectedBidId && (
                <Button
                  title="Select Bid"
                  onPress={() => handleSelectBid(bid._id)}
                  type="secondary"
                  style={styles.selectBidButton}
                />
              )}
              
              {listing.selectedBidId === bid._id && (
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
          <Text style={[styles.placeBidTitle, { color: isDark ? '#fff' : '#000' }]}>Place Your Bid</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Bid Amount (₺)</Text>
              <View style={[styles.amountInputContainer, { 
                backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                borderColor: isDark ? '#34495e' : '#e0e0e0',
              }]}>
                <DollarSign size={16} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                <TextInput
                  style={[styles.amountInput, { color: isDark ? '#fff' : '#000' }]}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Estimated Time</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#34495e' : '#e0e0e0',
                }]}
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                placeholder="e.g. 2 hours"
                placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
              />
            </View>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Message</Text>
            <TextInput
              style={[styles.messageInput, { 
                backgroundColor: isDark ? '#2c3e50' : '#f0f0f0',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#34495e' : '#e0e0e0',
              }]}
              value={bidMessage}
              onChangeText={setBidMessage}
              placeholder="Describe how you'll fix the issue..."
              placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <Button
            title="Place Bid"
            onPress={handlePlaceBid}
            loading={isBidLoading}
          />
        </View>
      )}
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {selectedMedia?.type === 'video' ? (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={styles.modalMedia}
              useNativeControls
              isLooping
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (
            <Image
              source={{ uri: selectedMedia?.uri }}
              style={styles.modalMedia}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
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
  mediaContainer: {
    width: '100%',
    height: 300,
  },
  mediaSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  thumbnailContainer: {
    marginTop: 8,
  },
  thumbnailList: {
    paddingHorizontal: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#3498db',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    padding: 2,
  },
  videoIndicatorText: {
    color: '#fff',
    fontSize: 12,
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  licensePlate: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  bidsContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  bidsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  bidItem: {
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
    marginLeft: 6,
    fontSize: 12,
  },
  bidMessage: {
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  amountInputContainer: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  media: {
    width: '100%',
    height: '100%'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  completeContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#2ecc71',
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
  },
  completeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#27ae60',
  },
  actionContainer: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  completionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  completeButtonBadge: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});