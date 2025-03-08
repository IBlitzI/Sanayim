import { RootState } from '@/store';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useSelector } from 'react-redux';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return [
          styles.button,
          isDark ? styles.primaryButtonDark : styles.primaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case 'secondary':
        return [
          styles.button,
          isDark ? styles.secondaryButtonDark : styles.secondaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case 'outline':
        return [
          styles.button,
          isDark ? styles.outlineButtonDark : styles.outlineButton,
          disabled && styles.disabledOutlineButton,
          style,
        ];
      default:
        return [
          styles.button,
          isDark ? styles.primaryButtonDark : styles.primaryButton,
          disabled && styles.disabledButton,
          style,
        ];
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return [
          styles.buttonText,
          isDark ? styles.primaryButtonTextDark : styles.primaryButtonText,
          textStyle,
        ];
      case 'secondary':
        return [
          styles.buttonText,
          isDark ? styles.secondaryButtonTextDark : styles.secondaryButtonText,
          textStyle,
        ];
      case 'outline':
        return [
          styles.buttonText,
          isDark ? styles.outlineButtonTextDark : styles.outlineButtonText,
          disabled && styles.disabledOutlineButtonText,
          textStyle,
        ];
      default:
        return [
          styles.buttonText,
          isDark ? styles.primaryButtonTextDark : styles.primaryButtonText,
          textStyle,
        ];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={type === 'outline' ? '#3498db' : '#fff'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#2c3e50',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  disabledOutlineButton: {
    borderColor: '#95a5a6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  outlineButtonText: {
    color: '#3498db',
  },
  disabledOutlineButtonText: {
    color: '#95a5a6',
  },
  primaryButtonDark: {
    backgroundColor: '#2980b9',
  },
  secondaryButtonDark: {
    backgroundColor: '#34495e',
  },
  outlineButtonDark: {
    borderColor: '#2980b9',
  },
  primaryButtonTextDark: {
    color: '#ecf0f1',
  },
  secondaryButtonTextDark: {
    color: '#ecf0f1',
  },
  outlineButtonTextDark: {
    color: '#2980b9',
  },
});

export default Button;