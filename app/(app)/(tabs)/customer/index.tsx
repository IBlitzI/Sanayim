import React from 'react';
import { View, Text } from 'react-native';

export default function CustomerHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This screen should not be visible directly.</Text>
    </View>
  );
}
