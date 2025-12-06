import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '@env'; 
import styles from './ViewRecipeScreenStyles';
import { getRecipeById, Recipe, CookingStep } from '../../services/RecipeService';
// ⭐ IMPORT USER SERVICE ĐỂ LẤY ID NGƯỜI DÙNG HIỆN TẠI
import UserService from '../../services/UserService'; 

const { width } = Dimensions.get('window');

type RootStackParamList = {
  ViewRecipe: { recipeId: string };
  EditProfile: { recipeId: string }; // Hoặc EditRecipe tùy tên màn hình bạn đặt
};

type ViewRecipeScreenRouteProp = RouteProp<RootStackParamList, 'ViewRecipe'>;

// Mở rộng type Recipe
interface FullRecipe extends Recipe {
  cookingSteps?: CookingStep[];
  authorAvatar?: string;
}

const ViewRecipeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ViewRecipeScreenRouteProp>();
  const { recipeId } = route.params;

  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ⭐ STATE KIỂM TRA QUYỀN SỞ HỮU
  const [isOwner, setIsOwner] = useState(false); 
  const [isFavorited, setIsFavorited] = useState(false); // State giả lập yêu thích

  useEffect(() => {
    loadData();
  }, [recipeId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Lấy email của User đang đăng nhập
      let currentUserEmail = '';
      try {
        const userProfile = await UserService.getUserProfile();
        // Lấy Email của mình
        if (userProfile.email) {
            currentUserEmail = userProfile.email;
        }
      } catch (err) {
        console.log('User chưa đăng nhập hoặc lỗi lấy profile');
      }

      // 2️⃣ Lấy chi tiết công thức
      const data = await getRecipeById(recipeId);
      setRecipe(data as FullRecipe);

      // 3️⃣ SO SÁNH EMAIL: Nếu email mình == email tác giả => Là bài của mình
      let isOwnerResult = false;
      if (currentUserEmail && data.author?.email) {
          // So sánh email, chuyển về chữ thường (toLowerCase) để tránh lỗi viết hoa/thường
          isOwnerResult = currentUserEmail.toLowerCase() === data.author.email.toLowerCase();
          console.log(`🤖 SO SÁNH EMAIL: ${currentUserEmail} === ${data.author.email} ? -> ${isOwnerResult}`);
      }
      
      setIsOwner(isOwnerResult);

      // Check trạng thái yêu thích từ API (giữ nguyên)
      if (data.isFavorited) setIsFavorited(true);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải công thức.');
    } finally {
      setLoading(false);
    }
  };

  // --- CÁC HÀM HELPER GIỮ NGUYÊN ---
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getStepImageUrl = (imgObj: any) => {
      const rawUrl = imgObj.image || imgObj.imageUrl;
      return getImageUrl(rawUrl);
  };

  const getDifficultyLabel = (difficulty?: string) => {
    const map: Record<string, string> = { 'EASY': 'Dễ', 'MEDIUM': 'Vừa', 'HARD': 'Khó' };
    return map[difficulty || 'EASY'] || 'Dễ';
  };

  const getDifficultyColor = (difficulty?: string) => {
    const map: Record<string, string> = { 
      'EASY': '#4CAF50', 'MEDIUM': '#FFC107', 'HARD': '#F44336' 
    };
    return map[difficulty || 'EASY'] || '#4CAF50';
  };

  // --- XỬ LÝ SỰ KIỆN NÚT BẤM ---

  const handleEditRecipe = () => {
      // Chuyển sang màn hình sửa
      // Đảm bảo bạn đã khai báo 'EditProfile' hoặc 'EditRecipe' trong Navigator
      navigation.navigate('EditProfile', { recipeId: recipeId }); 
      console.log('Chuyển sang trang chỉnh sửa công thức:', recipeId);
  };

  const handleToggleFavorite = () => {
      // Gọi API like/unlike ở đây
      setIsFavorited(!isFavorited);
      Alert.alert('Thông báo', !isFavorited ? 'Đã thêm vào yêu thích ❤️' : 'Đã xóa khỏi yêu thích 💔');
  };

  // --- RENDER UI ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!recipe) return null;

  const sortedSteps = recipe.cookingSteps
    ? [...recipe.cookingSteps].sort((a, b) => a.stepOrder - b.stepOrder)
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* ẢNH BÌA */}
      <View style={styles.imageContainer}>
        <Image 
           source={{ uri: getImageUrl(recipe.imageUrl) }} 
           style={styles.coverImage} 
           resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      {/* HEADER BACK BUTTON */}
      <SafeAreaView style={styles.headerAbsolute} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={{ height: 260 }} /> 

        <View style={styles.contentContainer}>
          <View style={styles.dragHandle} />

          {/* ... (GIỮ NGUYÊN PHẦN Title, Author, Description, Ingredients...) ... */}
          {/* ... Bạn copy y nguyên phần render nội dung ở câu trả lời trước vào đây ... */}
          
          <View style={styles.titleSection}>
             <Text style={styles.recipeTitle}>{recipe.name}</Text>
             <View style={styles.metaInfoRow}>
                <View style={styles.metaItem}>
                   <Icon name="clock-time-four-outline" size={18} color="#666" />
                   <Text style={styles.metaText}>{recipe.cookTime} phút</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.metaItem}>
                   <Icon name="account-group-outline" size={18} color="#666" />
                   <Text style={styles.metaText}>{recipe.ration} người</Text>
                </View>
             </View>
             
             <View style={styles.authorContainer}>
                {recipe.author?.avatarUrl ? (
                  <Image source={{ uri: getImageUrl(recipe.author.avatarUrl) }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Text style={styles.defaultAvatarText}>
                        {recipe.author?.firstName?.charAt(0) || recipe.author?.userName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
                <View>
                   <Text style={styles.authorLabel}>Công thức bởi</Text>
                   <Text style={styles.authorName}>
                       {recipe.author?.firstName ? `${recipe.author.firstName} ${recipe.author.lastName}` : (recipe.author?.userName || 'Ẩn danh')}
                   </Text>
                </View>
             </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.section}>
             <View style={styles.sectionHeaderRow}>
                 <Text style={styles.sectionHeader}>Mô tả món ăn</Text>
                 <Text style={styles.difficultyLabelText}>
                    Độ khó: <Text style={{ color: getDifficultyColor(recipe.difficulty?.value), fontWeight: 'bold' }}>
                        {getDifficultyLabel(recipe.difficulty?.value)}
                    </Text>
                 </Text>
             </View>
             {recipe.description ? (
                <Text style={styles.descriptionText}>{recipe.description}</Text>
             ) : null}
          </View>

          {/* Tags */}
          {recipe.labels && recipe.labels.length > 0 && (
             <View style={styles.tagContainer}>
               {recipe.labels.map((label) => (
                 <View key={label.id} style={[styles.tagBadge, { backgroundColor: label.colorCode ? label.colorCode + '20' : '#E8F5E9' }]}>
                    <Text style={[styles.tagText, { color: label.colorCode || '#2E7D32' }]}>{label.name}</Text>
                 </View>
               ))}
             </View>
          )}

          {/* Nguyên liệu */}
          <View style={styles.section}>
             <Text style={styles.sectionHeader}>Nguyên liệu</Text>
             <View style={styles.ingredientBox}>
                {recipe.ingredients?.map((ing, index) => (
                  <View key={ing.ingredientId || index} style={styles.ingredientRow}>
                     <View style={styles.bulletPoint} />
                     <Text style={styles.ingredientName}>{ing.name}</Text>
                     <Text style={styles.ingredientQuantity}>{ing.quantityGram}g</Text>
                  </View>
                ))}
             </View>
          </View>

          {/* Hướng dẫn nấu */}
          <View style={styles.section}>
             <Text style={styles.sectionHeader}>Hướng dẫn nấu</Text>
             {sortedSteps.length > 0 ? (
                sortedSteps.map((step, index) => (
                   <View key={step.id || index} style={styles.stepContainer}>
                      <Text style={styles.stepTitleLabel}>Bước {step.stepOrder}</Text>
                      <Text style={styles.stepInstruction}>{step.instruction}</Text>
                      {step.cookingStepImages && step.cookingStepImages.length > 0 && (
                         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepImageScroll}>
                            {step.cookingStepImages.map((img, imgIndex) => (
                               <Image 
                                  key={img.id || imgIndex}
                                  source={{ uri: getImageUrl(img.imageUrl) }} 
                                  style={styles.stepImage}
                                  resizeMode="cover"
                               />
                            ))}
                         </ScrollView>
                      )}
                   </View>
                ))
             ) : (
                <Text style={styles.emptyText}>Chưa có hướng dẫn cụ thể.</Text>
             )}
          </View>
          
          <View style={{ height: 100 }} /> 
        </View>
      </ScrollView>

      {/* ⭐ THANH CÔNG CỤ (ACTION BAR) CỐ ĐỊNH DƯỚI CÙNG ⭐ */}
      <View style={styles.bottomActionBar}>
          {isOwner ? (
              // 🟢 NẾU LÀ CHỦ SỞ HỮU (Bài nằm trong getMyRecipes) => NÚT CHỈNH SỬA
              <TouchableOpacity style={styles.editButton} onPress={handleEditRecipe}>
                  <Icon name="pencil" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.actionButtonText}>Chỉnh sửa công thức</Text>
              </TouchableOpacity>
          ) : (
              // 🔴 NẾU KHÔNG PHẢI CHỦ SỞ HỮU => NÚT YÊU THÍCH
              <TouchableOpacity 
                  style={[styles.favoriteButton, isFavorited && styles.favoriteButtonActive]} 
                  onPress={handleToggleFavorite}
              >
                  <Icon 
                      name={isFavorited ? "heart" : "heart-outline"} 
                      size={20} 
                      color={isFavorited ? "#FF4081" : "#fff"} 
                      style={{marginRight: 8}} 
                  />
                  <Text style={[styles.actionButtonText, isFavorited && {color: '#FF4081'}]}>
                      {isFavorited ? "Đã yêu thích" : "Thêm vào yêu thích"}
                  </Text>
              </TouchableOpacity>
          )}
      </View>

    </View>
  );
};

export default ViewRecipeScreen;