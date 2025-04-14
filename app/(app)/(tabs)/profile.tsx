import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '../../../store';
import { updateUserProfile } from '../../../store/slices/authSlice';
import Button from '../../../components/Button';
import { Star, MapPin, PenTool as Tool, Car, Clock, CircleCheck as CheckCircle, MessageSquare, Trash2 } from 'lucide-react-native';

interface Review {
  _id: string;
  deletedByMechanic: boolean;
  reviewerId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

interface RepairRequest {
  _id: string;
  vehicleLicensePlate: string;
  description: string;
  location: string;
  status: 'open' | 'assigned' | 'completed';
  bids?: Array<{
    _id: string;
    mechanicId: string;
    price: number;
  }>;
  createdAt: string;
}

interface ProfileData {
  _id: string;
  fullName: string;
  email: string;
  userType: 'vehicle_owner' | 'mechanic';
  tcKimlikNo: string;
  licensePlate?: string;
  rating: number;
  specialties: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

const parseSpecialties = (specialtiesData: string[]) => {
  if (!specialtiesData || !specialtiesData.length) return [];

  return specialtiesData.map(specialty => {
    try {
      // Parse the outer JSON string
      const parsed = JSON.parse(specialty);
      if (Array.isArray(parsed)) {
        // Split items based on comma and clean up each item
        return parsed.map(item => {
          // Remove any extra quotes and escaping
          const cleaned = item.replace(/\\"/g, '"').replace(/^"|"$/g, '');
          try {
            // Try to parse as JSON if it looks like JSON
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
      // If parsing fails, return the original string in an array
      return [specialty];
    }
  }).flat().filter(Boolean); // Flatten the array and remove any empty values
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { listings } = useSelector((state: RootState) => state.listings);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse>({
    reviews: [],
    rating: 0,
    reviewCount: 0
  });
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepairs, setLoadingRepairs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isDark = theme === 'dark';
  const isVehicleOwner = profileData?.userType === 'vehicle_owner';
  
  // Filter listings for the current user - ALL statuses, not just open
  const userListings = listings.filter(listing => listing.ownerId === profileData?._id);

  useEffect(() => {
    fetchProfileData();
    if (!isVehicleOwner) {
      fetchReviews();
    } else {
      fetchRepairRequests();
    }
  }, [isVehicleOwner]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('http://192.168.157.95:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      // Parse the specialties before setting the state
      const parsedSpecialties = parseSpecialties(data.specialties);
      
      setProfileData({
        ...data,
        specialties: parsedSpecialties
      });
      
      // Update Redux store with profile data
      dispatch(updateUserProfile({
        id: data._id,
        fullName: data.fullName,
        email: data.email,
        userType: data.userType,
        licensePlate: data.licensePlate,
        profileImage: data.profileImage,
        rating: data.rating,
        specialties: parsedSpecialties,
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://192.168.157.95:5000/api/reviews/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setReviewsData(result.data);
      }
    } catch (err) {
      console.error('Reviews fetch error:', err);
    }
  };

  const fetchRepairRequests = async () => {
    try {
      const response = await fetch('http://192.168.157.95:5000/api/repair-listings/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repair requests');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setRepairRequests(result.data);
      }
    } catch (err) {
      console.error('Repair requests fetch error:', err);
    } finally {
      setLoadingRepairs(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.157.95:5000/api/reviews/mechanic/review/${reviewId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              });

              if (!response.ok) {
                throw new Error('Failed to delete review');
              }

              // Refresh reviews after deletion
              fetchReviews();
            } catch (err) {
              console.error('Delete review error:', err);
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const handleViewListing = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const handleViewRepairRequest = (requestId: string) => {
    router.push(`/listing/${requestId}`);
  };

  const handleEditProfile = () => {
    router.push('../edit-profile');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#e74c3c' }]}>{error}</Text>
        <Button
          title="Retry"
          onPress={fetchProfileData}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <Image
          source={{ uri: profileData?.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>{profileData?.fullName}</Text>
        
        {isVehicleOwner ? (
          <View style={styles.infoRow}>
            <Car size={16} color="#3498db" />
            <Text style={[styles.infoText, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>License Plate: {profileData?.licensePlate}</Text>
          </View>
        ) : (
          <View style={styles.ratingContainer}>
            <Star size={16} color="#f1c40f" fill="#f1c40f" />
            <Text style={styles.rating}>{reviewsData.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={[styles.ratingCount, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
              ({reviewsData.reviewCount} reviews)
            </Text>
          </View>
        )}
        
        <Button
          title="Edit Profile"
          type="outline"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
      </View>
      
      {isVehicleOwner ? (
        <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>My Repair Requests</Text>
          {repairRequests.length > 0 ? (
            repairRequests.map((request) => (
              <TouchableOpacity
                key={request._id}
                style={[styles.listingItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}
                onPress={() => handleViewRepairRequest(request._id)}
              >
                <View style={styles.listingHeader}>
                  <Text style={[styles.listingTitle, { color: isDark ? '#fff' : '#000' }]}>{request.vehicleLicensePlate}</Text>
                  <View style={[
                    styles.statusBadge,
                    request.status === 'open' ? styles.openStatus :
                    request.status === 'assigned' ? styles.assignedStatus :
                    styles.completedStatus
                  ]}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={[styles.listingDescription, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>
                  {request.description}
                </Text>
                <View style={styles.listingFooter}>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                    <Text style={[styles.listingInfo, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>{request.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Clock size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                    <Text style={[styles.listingInfo, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                {/* Show number of bids */}
                {request.bids && request.bids.length > 0 && (
                  <View style={[styles.bidsCounter, { backgroundColor: isDark ? '#2c3e50' : '#ecf0f1' }]}>
                    <MessageSquare size={14} color={isDark ? '#fff' : '#2c3e50'} />
                    <Text style={[styles.bidsCount, { color: isDark ? '#fff' : '#2c3e50' }]}>
                      {request.bids.length} bid{request.bids.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
              You haven't created any repair requests yet
            </Text>
          )}
        </View>
      ) : (
        <>
          <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {profileData?.specialties.map((specialty, index) => (
                <View key={index} style={[styles.specialtyBadge, { backgroundColor: isDark ? '#2c3e50' : '#e0e0e0' }]}>
                  <Tool size={14} color={isDark ? '#fff' : '#000'} />
                  <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Reviews</Text>
            {reviewsData.reviews.length > 0 ? (
              reviewsData.reviews.map((review) => (
                <View key={review._id} style={[styles.reviewItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ 
                        uri: review.reviewerId.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
                      }}
                      style={styles.reviewerImage}
                    />
                    <View style={styles.reviewerInfo}>
                      <Text style={[styles.reviewerName, { color: isDark ? '#fff' : '#000' }]}>
                        {review.reviewerName}
                      </Text>
                      <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            color="#f1c40f"
                            fill={i < review.rating ? "#f1c40f" : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.reviewComment, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>
                    {review.comment}
                  </Text>
                  <View style={styles.reviewFooter}>
                    <Text style={[styles.reviewDate, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteReview(review._id)}
                    >
                      <Trash2 size={16} color="#e74c3c" />
                      <Text style={[styles.deleteButtonText, { color: '#e74c3c' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                No reviews available
              </Text>
            )}
          </View>
        </>
      )}
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
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    color: '#f1c40f',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  editButton: {
    width: '80%',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    marginLeft: 6,
    fontSize: 14,
  },
  listingItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  listingDescription: {
    marginBottom: 12,
    fontSize: 14,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingInfo: {
    marginLeft: 4,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  bidsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bidsCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  reviewItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 14,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});