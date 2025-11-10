// src/screens/Profile/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileHeader from '../../components/ProfileHeader';
import ProfileStat from '../../components/ProfileStat';
import RecipeCard from '../../components/RecipeCard';
import { useNavigation } from '@react-navigation/native'; // Để điều hướng khi có nút quay lại

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  // Dữ liệu "cứng" giống ảnh
  const userData = {
    name: 'Robin Jonnson',
    age: 26,
    gender: 'Nam',
    height: '165 cm',
    weight: '50.5 kg',
    email: 'robin_johnson@aar.com',
    address: 'Thạch Hộc, Thạch Thất, Hà Nội',
    phoneNumber: '0988 888 888',
    status: 'Chưa xác minh',
    avatarLarge: 'https://randomuser.me/api/portraits/men/32.jpg', // Ảnh đại diện lớn
  };

  const recipes = [
    { id: '1', title: 'Canh chua cá lóc', views: 120, image: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=CanhChua' },
    { id: '2', title: 'Thịt kho trứng', views: 200, image: 'https://via.placeholder.com/150/C70039/FFFFFF?text=ThitKho' },
    { id: '3', title: 'Gỏi cuốn', views: 85, image: 'https://via.placeholder.com/150/900C3F/FFFFFF?text=GoiCuon' },
    { id: '4', title: 'Phở bò', views: 300, image: 'https://via.placeholder.com/150/581845/FFFFFF?text=PhoBo' },
    { id: '5', title: 'Cà ri gà cay', views: 150, image: 'https://via.placeholder.com/150/FFC300/FFFFFF?text=CaRiGa' },
    { id: '6', title: 'Cà ri gà cay', views: 150, image: 'https://via.placeholder.com/150/DAF7A6/FFFFFF?text=CaRiGa' },
  ];

  const handleBackPress = () => {
    navigation.goBack(); // Quay lại màn hình trước
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ProfileHeader onBackPress={handleBackPress} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: userData.avatarLarge }} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{userData.name}</Text>
          <View style={styles.starRating}>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name={i < 4 ? 'star' : 'star-outline'} // 4 sao vàng, 1 sao viền
                size={20}
                color={i < 4 ? '#FFD700' : '#ccc'}
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuổi:</Text>
            <Text style={styles.infoValue}>{userData.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{userData.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chiều cao:</Text>
            <Text style={styles.infoValue}>{userData.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cân nặng:</Text>
            <Text style={styles.infoValue}>{userData.weight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{userData.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sđt:</Text>
            <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <Text style={styles.infoValueStatus}>{userData.status}</Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <ProfileStat value={1200} label="Following" />
            <ProfileStat value={1200} label="Follower" />
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Recipes Section */}
        <View style={styles.recipesSection}>
          <Text style={styles.recipesSectionTitle}>Công thức đã đăng</Text>
          <View style={styles.recipesHeaderActions}>
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                placeholder="Tìm công thức..."
                style={styles.searchInput}
                placeholderTextColor="#888"
              />
            </View>
            <TouchableOpacity style={styles.createRecipeButton}>
              <Text style={styles.createRecipeButtonText}>Tạo công thức</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipesGrid}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                imageUri={recipe.image}
                title={recipe.title}
                views={recipe.views}
                // isPrivate={true} // Bật nếu muốn hiển thị icon khóa
                onPress={() => console.log('View recipe:', recipe.title)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Màu nền hơi xám
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#eee',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  infoValueStatus: {
    fontSize: 15,
    color: '#FF6347', // Màu đỏ cam cho "Chưa xác minh"
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  followButton: {
    backgroundColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipesSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 15,
  },
  recipesSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recipesHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  createRecipeButton: {
    backgroundColor: '#FF69B4', // Màu hồng
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  createRecipeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Đảm bảo các thẻ trải đều
  },
});

export default ProfileScreen;