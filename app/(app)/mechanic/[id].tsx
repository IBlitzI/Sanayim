import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedMechanic } from '../../../store/slices/listingsSlice';
import { createConversation } from '../../../store/slices/chatSlice';
import Button from '../../../components/Button';
import { Star, MapPin, PenTool as Tool, MessageSquare } from 'lucide-react-native';

// Mock mechanic data
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

export default function MechanicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);
  
  // Find the mechanic by ID
  const mechanic = mockMechanics.find(m => m.id === id);
  
  React.useEffect(() => {
    if (mechanic) {
      dispatch(setSelectedMechanic(mechanic));
    }
  }, [dispatch, mechanic]);

  if (!mechanic) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Mechanic not found</Text>
      </View>
    );
  }

  const handleContactMechanic = () => {
    // Check if a conversation already exists
    const existingConversation = conversations.find(c => c.participantId === mechanic.id);
    
    if (existingConversation) {
      router.push(`/chat/${existingConversation.id}`);
    } else {
      // Create a new conversation
      const newConversation = {
        id: `new-${Date.now()}`,
        participantId: mechanic.id,
        participantName: mechanic.fullName,
        participantImage: mechanic.profileImage,
        unreadCount: 0,
        messages: [],
      };
      
      dispatch(createConversation(newConversation));
      router.push(`/chat/${newConversation.id}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: mechanic.profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{mechanic.fullName}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={18} color="#f1c40f" fill="#f1c40f" />
          <Text style={styles.rating}>{mechanic.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({mechanic.reviews.length} reviews)</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#3498db" />
          <Text style={styles.location}>{mechanic.location}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesContainer}>
          {mechanic.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyBadge}>
              <Tool size={14} color="#fff" />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {mechanic.reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
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
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.actionContainer}>
        <Button
          title="Contact Mechanic"
          onPress={handleContactMechanic}
          style={styles.contactButton}
          textStyle={styles.contactButtonText}
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
});