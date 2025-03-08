import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  rating?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  image,
  rating,
  onPress,
  style,
}) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#2c3e50' : '#ecf0f1',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    image: {
      width: '100%',
      height: 150,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#2c3e50',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#bdc3c7' : '#7f8c8d',
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: isDark ? '#ecf0f1' : '#34495e',
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      marginLeft: 4,
      fontSize: 14,
      color: '#f1c40f',
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      style={[dynamicStyles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image && (
        <Image
          source={{ uri: image }}
          style={dynamicStyles.image}
          resizeMode="cover"
        />
      )}
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>{title}</Text>
        {subtitle && <Text style={dynamicStyles.subtitle}>{subtitle}</Text>}
        {description && <Text style={dynamicStyles.description}>{description}</Text>}
        {rating !== undefined && (
          <View style={dynamicStyles.ratingContainer}>
            <Star size={16} color="#f1c40f" fill="#f1c40f" />
            <Text style={dynamicStyles.rating}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Card;