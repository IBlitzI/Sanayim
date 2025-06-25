import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { CreditCard, Calendar, Lock } from 'lucide-react-native';
import Button from './Button';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onPaymentSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, currency, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
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
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully',
        [
          {
            text: 'OK',
            onPress: onPaymentSuccess,
          },
        ]
      );
    }, 2000);
  };

  return (
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
        title={`Pay ${currency}${amount}`}
        onPress={handlePayment}
        loading={loading}
        style={styles.payButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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

export default PaymentForm;
