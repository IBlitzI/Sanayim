import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import RepairDetailsCard from '../../../components/RepairDetailsCard';
import PaymentForm from '../../../components/PaymentForm';

export default function PaymentScreen() {
  const { id, chatId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.settings);
  const { token } = useSelector((state: RootState) => state.auth);
  const isDark = theme === 'dark';
  const baseUrl = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000';

  const [repair, setRepair] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const listingId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchListing = async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const response = await fetch(`${baseUrl}/api/repair-listings/${listingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Not found');
        setRepair(result.data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Error');
      } finally {
        setFetching(false);
      }
    };
    if (listingId && token) fetchListing();
  }, [listingId, token]);

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, marginTop: 40 }}>Yükleniyor...</Text>
      </View>
    );
  }
  if (fetchError || !repair) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, marginTop: 40 }}>Repair listing not found.</Text>
      </View>
    );
  }

  const selectedBid = repair.selectedBidId ? repair.bids.find((b: any) => b._id === repair.selectedBidId) : null;
  const mechanicName = selectedBid?.mechanicName || 'Mechanic';
  const mechanicImage = selectedBid?.mechanicId?.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80';
  const amount = selectedBid?.amount || 0;
  const currency = '₺';
  const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;

  const handlePaymentSuccess = () => {
    if (chatIdStr) {
      router.replace({ pathname: '/(app)/chat/[id]', params: { id: chatIdStr, paid: 'true', paidListingId: listingId } });
    } else {
      router.replace('/(app)/(tabs)/messages');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Repair Listing Details</Text>
      </View>
      <RepairDetailsCard
        mechanicName={mechanicName}
        mechanicImage={mechanicImage}
        licensePlate={repair.vehicleLicensePlate}
        description={repair.description}
        amount={amount}
        currency={currency}
      />
      <PaymentForm
        amount={amount}
        currency={currency}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  sectionTitleContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});