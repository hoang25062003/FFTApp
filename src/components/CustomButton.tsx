import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
// Sửa: Thay vì import trực tiếp từ 'react-native-vector-icons/FontAwesome', 
// chúng ta import từ '@expo/vector-icons' để đảm bảo phông chữ được tải trong môi trường Expo.
import { FontAwesome } from '@expo/vector-icons';

import { ButtonProps } from '../types';
import { Colors } from '../constants/Colors';

const CustomButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant,
  disabled,
  children,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { button: styles.primaryButton, text: styles.primaryText };
      case 'secondary':
        return { button: styles.secondaryButton, text: styles.secondaryText };
      case 'google':
        return { button: styles.googleButton, text: styles.googleText };
      case 'link':
        return { button: styles.linkButton, text: styles.linkText };
      default:
        return { button: {}, text: {} };
    }
  };

  const { button: buttonStyle, text: textStyleDefault } = getStyles();

  if (variant === 'google') {
    return (
      <TouchableOpacity
        onPress={!disabled ? onPress : undefined}
        style={[styles.baseButton, buttonStyle, style, disabled && styles.disabledButton]}
        disabled={disabled}
      >
        <View style={styles.googleContent}>
          {/* Sửa: Thay thế Icon bằng FontAwesome */}
          <FontAwesome name="google" size={20} color={Colors.textPrimary} style={styles.googleIcon} />
          <Text style={[textStyleDefault, textStyle]}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'link') {
    return (
      <TouchableOpacity
        onPress={!disabled ? onPress : undefined}
        style={[buttonStyle, style, disabled && styles.disabledButton]}
        disabled={disabled}
      >
        <Text style={[textStyleDefault, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : undefined}
      style={[styles.baseButton, buttonStyle, style, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[textStyleDefault, textStyle]}>{title}</Text>
        {!!children && children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {},
  secondaryText: {
    color: Colors.textLink,
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: Colors.googleButton,
    borderWidth: 1,
    borderColor: Colors.googleBorder,
  },
  googleText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  linkButton: {
    paddingVertical: 5,
  },
  linkText: {
    color: Colors.textLink,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CustomButton;