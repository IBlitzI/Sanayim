import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../components/Button';
import { CreditCard, CircleCheck as CheckCircle, Calendar, Lock } from 'lucide-react-native';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock repair details
  const repairDetails = {
    id: id,
    mechanicName: 'Ahmet Yılmaz',
    mechanicImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    vehicleLicensePlate: 'ABC123',
    repairDescription: 'Brake system repair and replacement of brake pads',
    amount: 750,
    currency: '₺',
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const handlePayment = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all payment details');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return;
    }
    
    if (expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cvv.length !== 3) {
      Alert.alert('Error', 'Please enter a valid 3-digit CVV');
      return;
    }
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/(tabs)'),
          },
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.repairDetailsContainer}>
        <View style={styles.mechanicInfo}>
          <Image
            source={{ uri: repairDetails.mechanicImage }}
            style={styles.mechanicImage}
          />
          <View>
            <Text style={styles.mechanicName}>{repairDetails.mechanicName}</Text>
            <Text style={styles.licensePlate}>{repairDetails.vehicleLicensePlate}</Text>
          </View>
        </View>
        
        <Text style={styles.repairDescription}>{repairDetails.repairDescription}</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount:</Text>
          <Text style={styles.amount}>{repairDetails.currency}{repairDetails.amount}</Text>
        </View>
      </View>
      
      <View style={styles.paymentContainer}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <CreditCard size={24} color="#3498db" />
            <Text style={styles.cardHeaderText}>Credit/Debit Card</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#95a5a6"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="John Doe"
              placeholderTextColor="#95a5a6"
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.expiryInputContainer}>
                <Calendar size={16} color="#95a5a6" />
                <TextInput
                  style={styles.expiryInput}
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  placeholder="MM/YY"
                  placeholderTextColor="#95a5a6"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
            
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View style={styles.cvvInputContainer}>
                <Lock size={16} color="#95a5a6" />
                <TextInput
                  style={styles.cvvInput}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#95a5a6"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.secureNoteContainer}>
          <Lock size={16} color="#95a5a6" />
          <Text style={styles.secureNoteText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
        
        <Button
          title={`Pay ${repairDetails.currency}${repairDetails.amount}`}
          onPress={handlePayment}
          loading={loading}
          style={styles.payButton}
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
  repairDetailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  licensePlate: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  repairDescription: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 8,
  },
  amountLabel: { fontSize: 16,
    color: '#ecf0f1',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  paymentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
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
  rowContainer: {
    flexDirection: 'row',
  },
  expiryInputContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  cvvInputContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvvInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  secureNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  secureNoteText: {
    color: '#95a5a6',
    fontSize: 12,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#2ecc71',
  },
});