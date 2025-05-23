import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedMechanic } from '../../../store/slices/listingsSlice';
import { createConversation } from '../../../store/slices/chatSlice';
import Button from '../../../components/Button';
import { Star, MapPin, PenTool as Tool, MessageSquare, ChevronLeft } from 'lucide-react-native';
import Constants from 'expo-constants';

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

interface Reviewer {
  _id: string;
  fullName: string;
  profileImage: string;
}

interface Review {
  _id: string;
  reviewerId: Reviewer;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function MechanicProfileScreen() {
  const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);
  const { mechanics } = useSelector((state: RootState) => state.listings);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const [reviewsData, setReviewsData] = useState<ReviewsData>({ reviews: [], rating: 0, reviewCount: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Find the mechanic by MongoDB _id
  const mechanic = mechanics.find(m => m._id === id);
  
  React.useEffect(() => {
    if (mechanic) {
      dispatch(setSelectedMechanic(mechanic));
    }
  }, [dispatch, mechanic]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!mechanic?._id) return;
      
      setIsLoadingReviews(true);
      setReviewError(null);
      
      try {
        const response = await fetch(`${baseUrl}/api/reviews/mechanic/${mechanic._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setReviewsData(result.data);
        }
      } catch (err) {
        setReviewError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [mechanic?._id, token]);

  if (!mechanic) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#e74c3c' }]}>Mechanic not found</Text>
      </View>
    );
  }

  const handleContactMechanic = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mechanicId: mechanic._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chat');
      }

      const { success, data } = await response.json();
      
      if (success && data) {
        // Transform MongoDB chat data into frontend format
        const newChat = {
          id: data._id,
          participantId: mechanic._id,
          participantName: mechanic.fullName,
          participantImage: mechanic.profileImage,
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
      Alert.alert('Error', 'Failed to start conversation with mechanic');
    }
  };

  const handleAddReview = async () => {
    if (!comment.trim()) {
      setSubmitError('Please enter a review comment');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${baseUrl}/api/reviews/mechanic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mechanicId: mechanic._id,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Clear form
      setComment('');
      setRating(5);
      // Force reload to get updated reviews
      router.replace(`/mechanic/${mechanic._id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse specialties
  const parsedSpecialties = parseSpecialties(mechanic.specialties || []);

  return (
    <>
      <TouchableOpacity
        style={[
          {
            position: 'absolute',
            top: 40,
            left: 16,
            zIndex: 100,
            backgroundColor: isDark ? '#222' : '#fff',
            borderRadius: 20,
            padding: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          },
        ]}
        onPress={() => router.replace('/(app)/(tabs)')}
      >
        <ChevronLeft size={28} color={isDark ? '#fff' : '#222'} />
      </TouchableOpacity>
      <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#2c2c2c' : '#cccccc' }]}>
          <Image
            source={{ uri: mechanic.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
            style={styles.profileImage}
          />
          <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>{mechanic.fullName}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={18} color="#f1c40f" fill="#f1c40f" />
            <Text style={[styles.rating, { color: isDark ? '#f1c40f' : '#f39c12' }]}>{(reviewsData.rating || 0).toFixed(1)}</Text>
            <Text style={[styles.ratingCount, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>({reviewsData.reviewCount || 0} reviews)</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={isDark ? '#3498db' : '#2980b9'} />
            <Text style={[styles.location, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{mechanic.location}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Specialties</Text>
          <View style={styles.specialtiesContainer}>
            {parsedSpecialties.map((specialty, index) => (
              <View key={index} style={[styles.specialtyBadge, { backgroundColor: isDark ? '#2c3e50' : '#ecf0f1' }]}>
                <Tool size={14} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Reviews</Text>
          
          {user?.userType === 'vehicle_owner' && (
            <View style={[styles.addReviewContainer, { backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' }]}>
              <Text style={[styles.addReviewTitle, { color: isDark ? '#fff' : '#000' }]}>Add Your Review</Text>
              
              <View style={styles.ratingInputContainer}>
                <Text style={[styles.ratingLabel, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>Rating:</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Star
                        size={24}
                        color="#f1c40f"
                        fill={star <= rating ? "#f1c40f" : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={[
                  styles.commentInput,
                  { 
                    backgroundColor: isDark ? '#2c3e50' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#3498db' : '#bdc3c7'
                  }
                ]}
                placeholder="Write your review..."
                placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />

              {submitError && (
                <Text style={styles.errorText}>{submitError}</Text>
              )}

              <Button
                title={isSubmitting ? "Submitting..." : "Submit Review"}
                onPress={handleAddReview}
                disabled={isSubmitting}
                style={StyleSheet.flatten([
                  styles.submitButton,
                  isSubmitting && { opacity: 0.7 }
                ])}
              />
            </View>
          )}

          {isLoadingReviews ? (
            <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>Loading reviews...</Text>
          ) : reviewError ? (
            <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#e74c3c' }]}>{reviewError}</Text>
          ) : (
            reviewsData.reviews.map((review) => (
              <View key={review._id} style={[styles.reviewItem, { backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Image
                      source={{ 
                        uri: review.reviewerId.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
                      }}
                      style={styles.reviewerImage}
                    />
                    <Text style={[styles.reviewerName, { color: isDark ? '#fff' : '#000' }]}>
                      {review.reviewerId.fullName}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
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
                <Text style={[styles.reviewComment, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>
                  {review.comment}
                </Text>
                <Text style={[styles.reviewDate, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
        
        <View style={styles.actionContainer}>
          <Button
            title="Contact Mechanic"
            onPress={handleContactMechanic}
            textStyle={styles.contactButtonText}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    color: '#f1c40f',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 18,
  },
  ratingCount: {
    color: '#95a5a6',
    marginLeft: 4,
    fontSize: 14,
  },
  locationContainer: {
    flexDirection:  'row',
    alignItems: 'center',
  },
  location: {
    color: '#ecf0f1',
    marginLeft: 8,
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    color: '#ecf0f1',
    marginBottom: 8,
    fontSize: 14,
  },
  reviewDate: {
    color: '#95a5a6',
    fontSize: 12,
  },
  actionContainer: {
    padding: 20,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#3498db',
  },
  contactButtonText: {
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  addReviewContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starButton: {
    marginHorizontal: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});