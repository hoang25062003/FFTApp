import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import styles from './ViewRecipeScreenStyles';
import { getRecipeById, RecipeDetail } from '../../services/RecipeService';
import UserService from '../../services/UserService';
import RatingService, { 
  AverageRatingResponse, 
  RatingResponse ,
  getAverageRating
} from '../../services/RatingService';
import HeaderApp from '../../components/HeaderApp';

type RootStackParamList = {
  ViewRecipe: { recipeId: string };
  EditProfile: { recipeId: string };
};

type ViewRecipeScreenRouteProp = RouteProp<RootStackParamList, 'ViewRecipe'>;
type TabType = 'detail' | 'review';

const ViewRecipeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ViewRecipeScreenRouteProp>();
  const { recipeId } = route.params;

  // --- Recipe State ---
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('detail');

  // --- Rating State ---
  const [avgRatingData, setAvgRatingData] = useState<AverageRatingResponse>({ avgRating: 4.5, ratingCount: 0 }); // Default 4.5
  const [reviews, setReviews] = useState<RatingResponse[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [recipeId]);

  // Hàm load tổng hợp dữ liệu
  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadRecipeData(),
        loadRatingData()
      ]);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm load riêng cho dữ liệu công thức
  const loadRecipeData = async () => {
    try {
      let currentUserEmail = '';
      try {
        const userProfile = await UserService.getUserProfile();
        if (userProfile.email) {
          currentUserEmail = userProfile.email;
        }
      } catch (err) {
        console.log('⚠️ User chưa đăng nhập hoặc lỗi lấy profile');
      }

      const data = await getRecipeById(recipeId);
      setRecipe(data);

      let isOwnerResult = false;
      if (currentUserEmail && data.author?.email) {
        isOwnerResult = currentUserEmail.toLowerCase() === data.author.email.toLowerCase();
      }

      setIsOwner(isOwnerResult);
      if (data.isFavorited) setIsFavorited(true);
    } catch (error) {
      console.error('❌ Error loading recipe:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết công thức.');
    }
  };

  // Hàm load riêng cho dữ liệu đánh giá (Đã sửa logic Hardcode)
  const loadRatingData = async () => {
    try {
      // --- THAY ĐỔI Ở ĐÂY ---
      // 1. Không gọi API lấy điểm trung bình nữa, set cứng 4.5
      // const avgData = await RatingService.getAverageRating(recipeId); 
      
      const avgData = { avgRating: 4.5, ratingCount: 10 }; // Hardcode 4.5 và giả lập 10 đánh giá
      console.log('✅ Average Rating (Hardcoded):', avgData);
      setAvgRatingData(avgData);

      // 2. Lấy danh sách đánh giá (Protected API)
      try {
        const ratingsData = await RatingService.getRecipeRatings(recipeId, { 
          pageNumber: 1, 
          pageSize: 20 
        });
        
        console.log('✅ Ratings Data:', JSON.stringify(ratingsData, null, 2));
        
        // Nếu muốn cập nhật số lượng đánh giá thật từ list thay vì số 10 giả lập ở trên:
        if (ratingsData.items && ratingsData.items.length > 0) {
           // setAvgRatingData({ avgRating: 4.5, ratingCount: ratingsData.items.length });
        }
        
        setReviews(ratingsData.items || []);
      } catch (authError: any) {
        console.log('⚠️ Khách chưa đăng nhập hoặc lỗi lấy list rating:', authError.message);
        setReviews([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading ratings:', error.message);
      // Đặt giá trị mặc định nếu có lỗi (vẫn giữ 4.5)
      setAvgRatingData({ avgRating: 4.5, ratingCount: 0 });
      setReviews([]);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [recipeId]);

  // --- Xử lý gửi đánh giá (API mới) ---
  const handleSendReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá.');
      return;
    }

    try {
      setSubmittingReview(true);
      
      await RatingService.rateRecipe(recipeId, {
        score: userRating,
        feedback: reviewComment
      });

      Alert.alert('Cảm ơn!', 'Đánh giá của bạn đã được gửi thành công.');
      setReviewComment('');
      setUserRating(5);
      
      // Reload lại dữ liệu đánh giá
      await loadRatingData();

    } catch (error: any) {
      console.error('❌ Error submitting review:', error);
      const message = error.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- Utilities ---
  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getDifficultyLabel = (difficulty?: string | number) => {
    const diffValue = typeof difficulty === 'object' ? (difficulty as any).value : difficulty;
    const map: Record<string, string> = { 'EASY': 'Dễ', 'MEDIUM': 'Vừa', 'HARD': 'Khó' };
    return map[String(diffValue)?.toUpperCase()] || 'Dễ';
  };

  const getDifficultyColor = (difficulty?: string | number) => {
    const diffValue = typeof difficulty === 'object' ? (difficulty as any).value : difficulty;
    const map: Record<string, string> = {
      'EASY': '#4CAF50', 'MEDIUM': '#FFC107', 'HARD': '#F44336'
    };
    return map[String(diffValue)?.toUpperCase()] || '#4CAF50';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'Không rõ';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Lỗi định dạng';
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleEditRecipe = () => {
    navigation.navigate('EditProfile', { recipeId: recipeId });
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      Alert.alert('Thành công', 'Đã lưu công thức vào bộ sưu tập!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BC34A" />
        <Text style={styles.loadingText}>Đang tải công thức...</Text>
      </View>
    );
  }

  if (!recipe) return null;

  const sortedSteps = recipe.cookingSteps
    ? [...recipe.cookingSteps].sort((a, b) => a.stepOrder - b.stepOrder)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#8BC34A" />

      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <View style={styles.innerContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#8BC34A']} />
          }
        >
          {/* HEADER SECTION */}
          <View style={styles.headerSection}>
            <View style={styles.headerBackground}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.headerContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>Chi tiết công thức</Text>
                  <Text style={styles.headerSubtitle}>Thông tin đầy đủ về món ăn</Text>
                </View>
                {!isOwner && (
                  <TouchableOpacity 
                    style={styles.headerIconContainer}
                    onPress={() => Alert.alert('Báo cáo', 'Chức năng báo cáo công thức đang được phát triển')}
                  >
                    <Icon name="flag-outline" size={24} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* TABS CARD */}
          <View style={styles.tabCard}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'detail' && styles.activeTabItem]}
                onPress={() => setActiveTab('detail')}
              >
                <Icon name="file-document-outline" size={20} color={activeTab === 'detail' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === 'detail' && styles.activeTabText]}>Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'review' && styles.activeTabItem]}
                onPress={() => setActiveTab('review')}
              >
                <Icon name="star-outline" size={20} color={activeTab === 'review' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === 'review' && styles.activeTabText]}>Đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TAB CONTENT: CHI TIẾT */}
          {activeTab === 'detail' && (
            <>
              {/* IMAGE & LABELS */}
              <View style={styles.imageCard}>
                <Image
                  source={{ uri: getImageUrl(recipe.imageUrl) }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
                {recipe.labels && recipe.labels.length > 0 && (
                  <View style={styles.tagOverlay}>
                    {recipe.labels.slice(0, 2).map((label) => (
                      <View
                        key={label.id}
                        style={[styles.tagBadge, { backgroundColor: label.colorCode || '#8BC34A' }]}
                      >
                        <Text style={styles.tagText}>{label.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* MAIN INFO */}
              <View style={styles.mainCard}>
                <Text style={styles.recipeTitle}>{recipe.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Icon name="clock-time-four-outline" size={18} color="#8BC34A" />
                    <Text style={styles.metaText}>{recipe.cookTime} phút</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Icon name="account-group-outline" size={18} color="#8BC34A" />
                    <Text style={styles.metaText}>{recipe.ration} người</Text>
                  </View>
                  <View style={[styles.metaBadge, { backgroundColor: getDifficultyColor(recipe.difficulty?.value) + '15' }]}>
                    <Icon name="speedometer" size={18} color={getDifficultyColor(recipe.difficulty?.value)} />
                    <Text style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty?.value) }]}>
                      {getDifficultyLabel(recipe.difficulty?.value)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <View style={styles.authorSection}>
                  <View style={styles.authorRow}>
                    {recipe.author?.avatarUrl ? (
                      <Image source={{ uri: getImageUrl(recipe.author.avatarUrl) }} style={styles.authorAvatar} />
                    ) : (
                      <View style={styles.defaultAvatar}>
                        <Text style={styles.defaultAvatarText}>
                          {recipe.author?.firstName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.authorInfo}>
                      <Text style={styles.authorLabel}>Công thức bởi</Text>
                      <Text style={styles.authorName}>
                        {recipe.author?.firstName
                          ? `${recipe.author.firstName} ${recipe.author.lastName}`
                          : 'Ẩn danh'}
                      </Text>
                    </View>
                  </View>
                </View>

                {recipe.description && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="text-box-outline" size={20} color="#8BC34A" />
                        <Text style={styles.sectionTitle}>Mô tả món ăn</Text>
                      </View>
                      <Text style={styles.descriptionText}>{recipe.description}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* NGUYÊN LIỆU */}
              <View style={styles.contentCard}>
                <View style={styles.sectionHeader}>
                  <Icon name="food-apple-outline" size={20} color="#8BC34A" />
                  <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                </View>
                <View style={styles.ingredientList}>
                  {recipe.ingredients?.map((ing, index) => (
                    <View key={ing.ingredientId || index} style={styles.ingredientRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>{ing.quantityGram}g</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* HƯỚNG DẪN NẤU */}
              <View style={styles.contentCard}>
                <View style={styles.sectionHeader}>
                  <Icon name="chef-hat" size={20} color="#8BC34A" />
                  <Text style={styles.sectionTitle}>Hướng dẫn nấu</Text>
                </View>
                {sortedSteps.length > 0 ? (
                  sortedSteps.map((step, index) => (
                    <View key={step.id || index} style={styles.stepCard}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{step.stepOrder}</Text>
                        </View>
                        <Text style={styles.stepTitle}>Bước {step.stepOrder}</Text>
                      </View>
                      <Text style={styles.stepInstruction}>{step.instruction}</Text>
                      {step.cookingStepImages && step.cookingStepImages.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.stepImageScroll}
                        >
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

              {/* NÚT TẠO BẢN SAO VÀ LƯU CÔNG THỨC */}
              {!isOwner && (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.duplicateButton}
                    onPress={() => Alert.alert('Tạo bản sao', 'Chức năng tạo bản sao công thức đang được phát triển')}
                    activeOpacity={0.8}
                  >
                    <Icon name="content-copy" size={20} color="#8BC34A" />
                    <Text style={styles.duplicateButtonText}>Tạo bản sao</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isFavorited && styles.saveButtonActive
                    ]}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={isFavorited ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={isFavorited ? "#8BC34A" : "#FFFFFF"}
                    />
                    <Text style={[
                      styles.saveButtonText,
                      isFavorited && styles.saveButtonTextActive
                    ]}>
                      {isFavorited ? "Đã lưu" : "Lưu"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* TAB CONTENT: ĐÁNH GIÁ */}
          {activeTab === 'review' && (
            <View style={styles.reviewContainer}>
              {/* 1. TỔNG QUAN ĐÁNH GIÁ */}
              <View style={styles.ratingSummaryCard}>
                <View style={styles.ratingMainSection}>
                  <View style={styles.ratingScoreContainer}>
                    <Text style={styles.ratingScore}>
                      {avgRatingData.avgRating ? avgRatingData.avgRating.toFixed(1) : '0.0'}
                    </Text>
                    <Icon name="star" size={72} color="#FFC107" />
                  </View>
                  <Text style={styles.ratingCount}>
                    {avgRatingData.ratingCount} đánh giá
                  </Text>
                </View>
              </View>

              {/* 2. FORM NHẬP ĐÁNH GIÁ */}
              {!isOwner && (
                <View style={styles.reviewInputContainer}>
                  <View style={styles.sectionHeader}>
                    <Icon name="pencil-outline" size={20} color="#8BC34A" />
                    <Text style={styles.sectionTitle}>Viết đánh giá của bạn</Text>
                  </View>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                        <Icon
                          name={star <= userRating ? "star" : "star-outline"}
                          size={36}
                          color="#FFC107"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="Món ăn này thế nào? Hãy chia sẻ cảm nhận của bạn..."
                    multiline
                    numberOfLines={4}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSendReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="send" size={18} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* 3. DANH SÁCH ĐÁNH GIÁ */}
              <View style={styles.reviewListCard}>
                <View style={styles.sectionHeader}>
                  <Icon name="comment-text-outline" size={20} color="#8BC34A" />
                  <Text style={styles.sectionTitle}>Nhận xét gần đây</Text>
                </View>

                {reviews.length > 0 ? (
                  reviews.map((item) => (
                    <View key={item.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        {/* Avatar User */}
                        {item.userInteractionResponse?.avatarUrl ? (
                          <Image 
                            source={{ uri: getImageUrl(item.userInteractionResponse.avatarUrl) }} 
                            style={styles.reviewerAvatar} 
                          />
                        ) : (
                          <View style={[styles.reviewerAvatar, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={styles.reviewerAvatarText}>
                              {item.userInteractionResponse?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.reviewerInfo}>
                          <Text style={styles.reviewerName}>
                            {item.userInteractionResponse 
                              ? `${item.userInteractionResponse.firstName} ${item.userInteractionResponse.lastName}` 
                              : 'Người dùng ẩn danh'}
                          </Text>
                          <View style={styles.reviewRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon 
                                key={star} 
                                name={star <= (item.score || 0) ? "star" : "star-outline"} 
                                size={14} 
                                color="#FFC107" 
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewDate}>
                          {item.createdAtUtc ? formatDate(item.createdAtUtc) : 'Không rõ'}
                        </Text>
                      </View>
                      <Text style={styles.reviewText}>
                        {item.feedback || 'Không có nội dung'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Chưa có đánh giá nào. Hãy là người đầu tiên!</Text>
                )}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* BOTTOM ACTION - CHỈ HIỂN THỊ NẾU LÀ OWNER */}
        {isOwner && (
          <View style={styles.bottomAction}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditRecipe}>
              <Icon name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Chỉnh sửa công thức</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ViewRecipeScreen;