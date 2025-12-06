// src/components/ProfileHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Hoặc Ionicons, tùy bạn chọn

interface ProfileHeaderProps {
  onBackPress?: () => void;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onBackPress,
  onNotificationsPress,
  onAvatarPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
        <Icon name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      <View style={styles.rightIcons}>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    // Đảm bảo chiều cao hợp lý
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Đảm bảo title ở giữa
    textAlign: 'center',
    marginLeft: 20, // Tạm bù trừ icon trái
    marginRight: 20, // Tạm bù trừ icon phải
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginLeft: 10,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
});

export default ProfileHeader;