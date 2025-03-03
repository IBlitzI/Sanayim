import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

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
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return [styles.button, styles.primaryButton, disabled && styles.disabledButton, style];
      case 'secondary':
        return [styles.button, styles.secondaryButton, disabled && styles.disabledButton, style];
      case 'outline':
        return [styles.button, styles.outlineButton, disabled && styles.disabledOutlineButton, style];
      default:
        return [styles.button, styles.primaryButton, disabled && styles.disabledButton, style];
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return [styles.buttonText, styles.primaryButtonText, textStyle];
      case 'secondary':
        return [styles.buttonText, styles.secondaryButtonText, textStyle];
      case 'outline':
        return [styles.buttonText, styles.outlineButtonText, disabled && styles.disabledOutlineButtonText, textStyle];
      default:
        return [styles.buttonText, styles.primaryButtonText, textStyle];
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
});

export default Button;