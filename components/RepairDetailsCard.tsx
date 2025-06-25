import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface RepairDetailsCardProps {
  mechanicName: string;
  mechanicImage: string;
  licensePlate: string;
  description: string;
  amount: number;
  currency: string;
}

const RepairDetailsCard: React.FC<RepairDetailsCardProps> = ({
  mechanicName,
  mechanicImage,
  licensePlate,
  description,
  amount,
  currency,
}) => (
  <View style={styles.repairDetailsContainer}>
    <View style={styles.mechanicInfo}>
      <Image source={{ uri: mechanicImage }} style={styles.mechanicImage} />
      <View>
        <Text style={styles.mechanicName}>{mechanicName}</Text>
        <Text style={styles.licensePlateLabel}>License Plate:</Text>
        <Text style={styles.licensePlate}>{licensePlate}</Text>
      </View>
    </View>
    <Text style={styles.repairDescription}>{description}</Text>
    <View style={styles.amountContainer}>
      <Text style={styles.amountLabel}>Total Amount:</Text>
      <Text style={styles.amount}>{currency}{amount}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  licensePlateLabel: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 4,
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
  amountLabel: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
});

export default RepairDetailsCard;
