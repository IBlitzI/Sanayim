import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '../../../store';
import Button from '../../../components/Button';
import { Star, MapPin, PenTool as Tool, Car, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { listings } = useSelector((state: RootState) => state.listings);
  const { theme } = useSelector((state: RootState) => state.settings);
  
  const isDark = theme === 'dark';
  const isVehicleOwner = user?.userType === 'vehicle_owner';
  
  // Filter listings for the current user
  const userListings = listings.filter(listing => listing.ownerId === user?.id);
  
  // Mock reviews for mechanic
  const mockReviews = [
    { id: '1', userId: '101', userName: 'Mehmet K.', rating: 5, comment: 'Great service, fixed my car quickly.', date: '2023-05-15' },
    { id: '2', userId: '102', userName: 'Ayşe T.', rating: 4, comment: 'Professional and knowledgeable.', date: '2023-04-22' },
    { id: '3', userId: '103', userName: 'Ali R.', rating: 5, comment: 'Fixed my brakes perfectly.', date: '2023-06-10' },
  ];

  const handleEditProfile = () => {
    router.push('../edit-profile');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <Image
          source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>{user?.fullName}</Text>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color="#3498db" />
          <Text style={[styles.infoText, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{user?.location || 'No location set'}</Text>
        </View>
        
        {isVehicleOwner ? (
          <View style={styles.infoRow}>
            <Car size={16} color="#3498db" />
            <Text style={[styles.infoText, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>License Plate: {user?.licensePlate}</Text>
          </View>
        ) : (
          <View style={styles.ratingContainer}>
            <Star size={16} color="#f1c40f" fill="#f1c40f" />
            <Text style={styles.rating}>{user?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={[styles.ratingCount, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>({mockReviews.length} reviews)</Text>
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
          {userListings.length > 0 ? (
            userListings.map((listing) => (
              <View key={listing.id} style={[styles.listingItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
                <View style={styles.listingHeader}>
                  <Text style={[styles.listingTitle, { color: isDark ? '#fff' : '#000' }]}>{listing.vehicleLicensePlate}</Text>
                  <View style={[
                    styles.statusBadge,
                    listing.status === 'open' ? styles.openStatus :
                    listing.status === 'assigned' ? styles.assignedStatus :
                    styles.completedStatus
                  ]}>
                    <Text style={styles.statusText}>{listing.status}</Text>
                  </View>
                </View>
                <Text style={[styles.listingDescription, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{listing.description}</Text>
                <View style={styles.listingFooter}>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                    <Text style={[styles.listingInfo, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>{listing.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Clock size={14} color={isDark ? '#95a5a6' : '#7f8c8d'} />
                    <Text style={[styles.listingInfo, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>You haven't created any repair requests yet</Text>
          )}
        </View>
      ) : (
        <>
          <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              <View style={[styles.specialtyBadge, { backgroundColor: isDark ? '#2c3e50' : '#e0e0e0' }]}>
                <Tool size={14} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>Engine Repair</Text>
              </View>
              <View style={[styles.specialtyBadge, { backgroundColor: isDark ? '#2c3e50' : '#e0e0e0' }]}>
                <Tool size={14} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>Electrical Systems</Text>
              </View>
              <View style={[styles.specialtyBadge, { backgroundColor: isDark ? '#2c3e50' : '#e0e0e0' }]}>
                <Tool size={14} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.specialtyText, { color: isDark ? '#fff' : '#000' }]}>Brake Systems</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.section, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Reviews</Text>
            {mockReviews.map((review) => (
              <View key={review.id} style={[styles.reviewItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: isDark ? '#fff' : '#000' }]}>{review.userName}</Text>
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
                <Text style={[styles.reviewComment, { color: isDark ? '#ecf0f1' : '#2c3e50' }]}>{review.comment}</Text>
                <Text style={[styles.reviewDate, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>{new Date(review.date).toLocaleDateString()}</Text>
              </View>
            ))}
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
  reviewItem: {
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
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    marginBottom: 8,
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
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
});