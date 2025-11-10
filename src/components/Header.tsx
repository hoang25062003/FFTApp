import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import CustomButton from './CustomButton';
import { BackButtonProps } from '../types';
import { Colors, FontSize } from '../constants/Colors';

// Giả định bạn có logo.png trong src/assets/images/logo.png
const LOGO_IMAGE = require('../assets/images/logo.png');

const HeaderLogo: React.FC<BackButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Nút Quay lại */}
      <CustomButton variant="back" onPress={onPress} style={styles.backButtonPosition} title={''} />

      {/* Logo */}
      <View style={styles.logoBox}>
        <Image 
          source={LOGO_IMAGE} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
        <Text style={styles.headerTitle}>Đăng ký</Text>
        <Text style={styles.headerSubtitle}>Bắt đầu hành trình sức khỏe của bạn!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  backButtonPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10, // Đảm bảo nút nằm trên cùng
  },
  logoBox: {
    alignItems: 'center',
    paddingTop: 30, // Để chừa chỗ cho nút back
  },
  logoImage: {
    width: 150,
    height: 80,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: FontSize.header,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default HeaderLogo;
