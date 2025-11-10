// src/components/RecipeCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RecipeCardProps {
  imageUri: string;
  title: string;
  views: number;
  onPress?: () => void;
  isPrivate?: boolean; // Nếu có icon khóa
}

const RecipeCard: React.FC<RecipeCardProps> = ({ imageUri, title, views, onPress, isPrivate = false }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.recipeImage} />
      <View style={styles.infoOverlay}>
        <Text style={styles.recipeTitle}>{title}</Text>
        <View style={styles.viewsContainer}>
          <Text style={styles.recipeViews}>{views} views</Text>
          {isPrivate && <Icon name="lock" size={14} color="#555" style={styles.lockIcon} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%', // Khoảng 2 thẻ trên 1 hàng, trừ margin
    marginVertical: 8,
    marginHorizontal: '1%', // Tạo khoảng cách giữa các thẻ
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  recipeImage: {
    width: '100%',
    height: 120, // Chiều cao ảnh cố định
    resizeMode: 'cover',
  },
  infoOverlay: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Đẩy icon khóa sang phải
  },
  recipeViews: {
    fontSize: 13,
    color: '#777',
  },
  lockIcon: {
    marginLeft: 5,
  },
});

export default RecipeCard;