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
import { getRecipeById, RecipeDetail, deleteRecipe } from '../../services/RecipeService';
import UserService from '../../services/UserService';
import RatingService, { 
  AverageRatingResponse, 
  RatingResponse,
} from '../../services/RatingService';
import CommentService, { Comment, CreateCommentRequest } from '../../services/CommentService';
import DietRestrictionService from '../../services/DietRestrictionService';
import HeaderApp from '../../components/HeaderApp';
import ReportDialog from '../../components/ReportDialog';

type RootStackParamList = {
  ViewRecipe: { recipeId: string };
  EditProfile: { recipeId: string };
};

type ViewRecipeScreenRouteProp = RouteProp<RootStackParamList, 'ViewRecipe'>;
type TabType = 'detail' | 'review' | 'comment';

interface RestrictionWarning {
  type: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const ViewRecipeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ViewRecipeScreenRouteProp>();
  const { recipeId } = route.params;

  // --- Recipe State ---
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // --- Loading State cho từng tab ---
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  // --- Rating State ---
  const [avgRatingData, setAvgRatingData] = useState<AverageRatingResponse>({ avgRating: 0, ratingCount: 0 });
  const [reviews, setReviews] = useState<RatingResponse[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // --- Focus & Validation State ---
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [commentError, setCommentError] = useState('');

  // --- Report Dialog State ---
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string>('');
  const [reportTargetType, setReportTargetType] = useState<'recipe' | 'rating'>('rating');

  // --- Comment State ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToUserName, setReplyToUserName] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // --- Diet Restriction State ---
  const [userRestrictions, setUserRestrictions] = useState<Map<string, RestrictionWarning>>(new Map());

  useEffect(() => {
    loadInitialData();
  }, [recipeId]);

  // --- Hàm lấy danh sách hạn chế ăn uống ---
  const getUserRestrictions = async (): Promise<Map<string, RestrictionWarning>> => {
    try {
      const restrictions = await DietRestrictionService.getUserDietRestrictions({});
      const restrictionMap = new Map<string, RestrictionWarning>();
      
      restrictions.forEach(item => {
        const ingredientName = item.ingredientName?.toLowerCase() || '';
        const restrictionType = typeof item.type === 'object' && item.type !== null
          ? (item.type as any).value 
          : item.type;
        
        if (ingredientName) {
          const warning = getRestrictionWarningConfig(restrictionType as string);
          if (warning) {
            restrictionMap.set(ingredientName, warning);
          }
        }
      });
      
      return restrictionMap;
    } catch (error) {
      // console.error('Error fetching restrictions:', error);
      return new Map();
    }
  };

  // --- Hàm lấy config cảnh báo ---
  const getRestrictionWarningConfig = (restrictionType: string): RestrictionWarning | null => {
    if (!restrictionType) return null;
    
    const typeString = String(restrictionType).toUpperCase();
    
    switch (typeString) {
      case 'ALLERGY':
        return {
          type: 'ALLERGY',
          label: 'Dị ứng',
          color: '#DC2626',
          bgColor: '#FEE2E2',
          icon: 'alert-circle'
        };
      case 'DISLIKE':
        return {
          type: 'DISLIKE',
          label: 'Không thích',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          icon: 'thumb-down'
        };
      case 'TEMPORARYAVOID':
        return {
          type: 'TEMPORARYAVOID',
          label: 'Tạm tránh',
          color: '#7C3AED',
          bgColor: '#F3E8FF',
          icon: 'clock-time-four'
        };
      default:
        return null;
    }
  };

  // --- Hàm kiểm tra cảnh báo cho từng nguyên liệu ---
  const getRestrictionWarning = (ingredientName: string): RestrictionWarning | null => {
    return userRestrictions.get(ingredientName.toLowerCase()) || null;
  };

  // Hàm load dữ liệu ban đầu (chỉ recipe)
  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await loadRecipeData();
    } catch (error) {
      // console.error('❌ Error loading initial data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Hàm load riêng cho dữ liệu công thức
  const loadRecipeData = async () => {
    try {
      setLoadingDetail(true);
      let userEmail = '';
      let profile = null;
      
      try {
        profile = await UserService.getUserProfile();
        if (profile?.email) {
          userEmail = profile.email;
          setCurrentUserEmail(userEmail);
          setUserProfile(profile);
        }
      } catch (err) {
        // console.log('⚠️ User chưa đăng nhập hoặc lỗi lấy profile');
        setUserProfile(null);
      }

      const data = await getRecipeById(recipeId);
      setRecipe(data);

      let isOwnerResult = false;
      if (userEmail && data.author?.email) {
        isOwnerResult = userEmail.toLowerCase() === data.author.email.toLowerCase();
      }

      setIsOwner(isOwnerResult);
      if (data.isFavorited) setIsFavorited(true);
    } catch (error) {
      // console.error('❌ Error loading recipe:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết công thức.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Hàm load riêng cho dữ liệu đánh giá - GỌI API
  const loadRatingData = async () => {
    try {
      setLoadingReview(true);
      
      const avgData = await RatingService.getAverageRating(recipeId);
      setAvgRatingData(avgData);

      try {
        const ratingsData = await RatingService.getRecipeRatings(recipeId, { 
          pageNumber: 1, 
          pageSize: 20 
        });
        setReviews(ratingsData.items || []);
      } catch (authError: any) {
        // console.log('⚠️ Khách chưa đăng nhập hoặc lỗi lấy list rating:', authError.message);
        setReviews([]);
      }
    } catch (error: any) {
      // console.error('❌ Error loading ratings:', error.message);
      setAvgRatingData({ avgRating: 0, ratingCount: 0 });
      setReviews([]);
    } finally {
      setLoadingReview(false);
    }
  };

  // Hàm load riêng cho dữ liệu bình luận
  const loadCommentData = async () => {
    try {
      setLoadingComment(true);
      const commentsData = await CommentService.getComments(recipeId);
      setComments(commentsData || []);
    } catch (error: any) {
      // console.error('❌ Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComment(false);
    }
  };

  // Load restrictions khi tab detail active
  useEffect(() => {
    if (activeTab === 'detail') {
      const loadRestrictions = async () => {
        const restrictions = await getUserRestrictions();
        setUserRestrictions(restrictions);
      };
      loadRestrictions();
    }
  }, [activeTab]);

  // Load data khi chuyển tab - REVIEW
  useEffect(() => {
    if (activeTab === 'review' && reviews.length === 0 && !loadingReview) {
      loadRatingData();
    }
  }, [activeTab]);

  // Load data khi chuyển tab - COMMENT
  useEffect(() => {
    if (activeTab === 'comment' && comments.length === 0 && !loadingComment) {
      loadCommentData();
    }
  }, [activeTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadRecipeData(),
        activeTab === 'review' && loadRatingData(),
        activeTab === 'comment' && loadCommentData()
      ].filter(Boolean));
    } catch (error) {
      // console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [recipeId, activeTab]);

  // --- Xử lý chia sẻ công thức ---
  const handleShareRecipe = async () => {
    if (isSharing || !recipe) return;
    
    setIsSharing(true);
    
    try {
      // Tạo URL chia sẻ công thức
      const recipeUrl = `recipe/${recipeId}`;
      const shareText = `Hãy thử công thức "${recipe.name}" - ${recipe.cookTime} phút nấu, dành cho ${recipe.ration} người`;
      
      // Gọi share native
      if (require('react-native').Share) {
        await require('react-native').Share.share({
          message: shareText,
          url: recipeUrl,
          title: recipe.name,
        });
      }
    } catch (error) {
      // console.error('Error sharing recipe:', error);
      Alert.alert('Thông báo', 'Không thể chia sẻ công thức lúc này');
    } finally {
      setIsSharing(false);
    }
  };

  // --- Xử lý gửi đánh giá ---
  const handleSendReview = async () => {
    if (userRating < 4 && !reviewComment.trim()) {
      setCommentError('Bắt buộc phải nhập nhận xét khi đánh giá dưới 4 sao');
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
      setCommentError('');
      
      await loadRatingData();

    } catch (error: any) {
      // console.error('❌ Error submitting review:', error);
      const message = error.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- Xử lý xóa rating ---
  const handleDeleteRating = (ratingId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await RatingService.deleteRating(ratingId);
              Alert.alert('Thành công', 'Đánh giá đã được xóa.');
              await loadRatingData();
            } catch (error: any) {
              // console.error('❌ Error deleting rating:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa đánh giá.');
            }
          }
        }
      ]
    );
  };

  // --- Xử lý báo cáo rating ---
  const handleReportRating = (ratingId: string) => {
    setReportTargetId(ratingId);
    setReportTargetType('rating');
    setReportDialogVisible(true);
  };

  // --- Xử lý khi thay đổi rating ---
  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    if (rating >= 4) {
      setCommentError('');
    }
  };

  // --- Xử lý khi thay đổi comment ---
  const handleCommentChange = (text: string) => {
    setReviewComment(text);
    if (commentError && text.trim()) {
      setCommentError('');
    }
  };

  // --- Xử lý xóa công thức ---
  const handleDeleteRecipe = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setInitialLoading(true);
              await deleteRecipe(recipeId);
              Alert.alert('Thành công', 'Công thức đã được xóa.', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate('Home');
                    }
                  }
                }
              ]);
            } catch (error: any) {
              // console.error('❌ Error deleting recipe:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa công thức.');
            } finally {
              setInitialLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- Kiểm tra xem rating có phải của user hiện tại không ---
  const isMyRating = (rating: RatingResponse): boolean => {
    if (!currentUserEmail || !rating.userInteractionResponse?.email) {
      return false;
    }
    return currentUserEmail.toLowerCase() === rating.userInteractionResponse.email.toLowerCase();
  };

  // --- Xử lý gửi bình luận ---
  const handleSendComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingComment(true);
      
      const request: CreateCommentRequest = {
        content: commentText,
        parentCommentId: replyToCommentId,
      };

      await CommentService.createComment(recipeId, request);
      
      setCommentText('');
      setReplyToCommentId(null);
      setReplyToUserName('');
      
      await loadCommentData();
      
      Alert.alert('Thành công', 'Bình luận đã được gửi');
    } catch (error: any) {
      // console.error('❌ Error submitting comment:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  // --- Xử lý reply bình luận ---
  const handleReply = (commentId: string, userName: string) => {
    setReplyToCommentId(commentId);
    setReplyToUserName(userName);
  };

  // --- Hủy reply ---
  const handleCancelReply = () => {
    setReplyToCommentId(null);
    setReplyToUserName('');
  };

  // --- Xử lý xóa comment ---
  const handleDeleteComment = (commentId: string, commentUserId?: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const isMyComment = commentUserId === currentUserEmail;
              const isAdminOrMod = UserService.isAdminOrModerator(userProfile);
              
              if (isMyComment) {
                await CommentService.deleteComment(commentId);
              } else if (isOwner) {
                await CommentService.deleteCommentAsAuthor(commentId);
              } else if (isAdminOrMod) {
                await CommentService.deleteCommentAsAdmin(commentId);
              }
              
              Alert.alert('Thành công', 'Bình luận đã được xóa');
              await loadCommentData();
            } catch (error: any) {
              // console.error('❌ Error deleting comment:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa bình luận');
            }
          }
        }
      ]
    );
  };

  // --- Render một comment item ---
  const renderCommentItem = (comment: Comment, isReply: boolean = false) => {
    const commentUserName = `${comment.firstName} ${comment.lastName}`;
    const isMyComment = !!(currentUserEmail && comment.userId && comment.userId === currentUserEmail);
    
    const canDelete = UserService.canDeleteComment(
      userProfile,
      isOwner,
      isMyComment
    );

    return (
      <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
        <View style={styles.commentHeader}>
          {comment.avatarUrl ? (
            <Image 
              source={{ uri: getImageUrl(comment.avatarUrl) }} 
              style={styles.commentAvatar} 
            />
          ) : (
            <View style={[styles.commentAvatar, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={styles.commentAvatarText}>
                {comment.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <View style={styles.commentInfo}>
            <Text style={styles.commentUserName}>{commentUserName}</Text>
            <Text style={styles.commentDate}>
              {comment.createdAtUtc ? formatDate(comment.createdAtUtc) : 'Không rõ'}
            </Text>
          </View>
          
          {canDelete && (
            <TouchableOpacity
              style={styles.commentActionIcon}
              onPress={() => handleDeleteComment(comment.id, comment.userId)}
            >
              <Icon name="delete-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.commentText}>{comment.content}</Text>
        
        {!isReply && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => handleReply(comment.id, commentUserName)}
          >
            <Icon name="reply" size={16} color="#8BC34A" />
            <Text style={styles.replyButtonText}>Trả lời</Text>
          </TouchableOpacity>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => renderCommentItem(reply, true))}
          </View>
        )}
      </View>
    );
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
    if (!dateString) return 'Không rõ';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
      
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
    navigation.navigate('EditRecipe', { recipeId: recipeId });
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      Alert.alert('Thành công', 'Đã lưu công thức vào bộ sưu tập!');
    }
  };

  if (initialLoading) {
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
                {isOwner ? (
                  <TouchableOpacity 
                    style={styles.headerIconContainer}
                    onPress={handleDeleteRecipe}
                  >
                    <Icon name="delete-outline" size={24} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.headerIconContainer}
                    onPress={() => {
                      setReportTargetId(recipeId);
                      setReportTargetType('recipe');
                      setReportDialogVisible(true);
                    }}
                  >
                    <Icon name="flag-outline" size={24} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* TABS */}
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
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'comment' && styles.activeTabItem]}
                onPress={() => setActiveTab('comment')}
              >
                <Icon name="comment-outline" size={20} color={activeTab === 'comment' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === 'comment' && styles.activeTabText]}>
                  Bình luận {comments.length > 0 && `(${comments.length})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TAB: CHI TIẾT */}
          {activeTab === 'detail' && (
            <>
              {loadingDetail ? (
                <View style={styles.tabLoadingContainer}>
                  <ActivityIndicator size="large" color="#8BC34A" />
                  <Text style={styles.tabLoadingText}>Đang tải chi tiết...</Text>
                </View>
              ) : (
                <>
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

                  <View style={styles.contentCard}>
                    <View style={styles.sectionHeader}>
                      <Icon name="food-apple-outline" size={20} color="#8BC34A" />
                      <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                    </View>
                    <View style={styles.ingredientList}>
                      {recipe.ingredients?.map((ing, index) => {
                        const warning = getRestrictionWarning(ing.name);
                        
                        return (
                          <View key={ing.ingredientId || index} style={styles.ingredientRow}>
                            <View style={styles.bulletDot} />
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.ingredientName}>{ing.name}</Text>
                                {warning && (
                                  <View style={[
                                    styles.warningBadge,
                                    { backgroundColor: warning.bgColor, borderColor: warning.color }
                                  ]}>
                                    <Icon 
                                      name={warning.icon} 
                                      size={12} 
                                      color={warning.color} 
                                    />
                                    <Text style={[
                                      styles.warningBadgeText,
                                      { color: warning.color }
                                    ]}>
                                      {warning.label}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.quantityBadge}>
                              <Text style={styles.quantityText}>{ing.quantityGram}g</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

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

                  {!isOwner && (
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={styles.duplicateButton}
                        onPress={handleShareRecipe}
                        disabled={isSharing}
                        activeOpacity={0.8}
                      >
                        {isSharing ? (
                          <ActivityIndicator size="small" color="#8BC34A" />
                        ) : (
                          <>
                            <Icon name="share-variant" size={20} color="#8BC34A" />
                            <Text style={styles.duplicateButtonText}>Chia sẻ</Text>
                          </>
                        )}
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

                  {isOwner && (
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={styles.duplicateButton}
                        onPress={handleShareRecipe}
                        disabled={isSharing}
                        activeOpacity={0.8}
                      >
                        {isSharing ? (
                          <ActivityIndicator size="small" color="#8BC34A" />
                        ) : (
                          <>
                            <Icon name="share-variant" size={20} color="#8BC34A" />
                            <Text style={styles.duplicateButtonText}>Chia sẻ</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleEditRecipe}
                        activeOpacity={0.8}
                      >
                        <Icon
                          name="pencil"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.saveButtonText}>
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* TAB: ĐÁNH GIÁ */}
          {activeTab === 'review' && (
            <View style={styles.reviewContainer}>
              {loadingReview ? (
                <View style={styles.tabLoadingContainer}>
                  <ActivityIndicator size="large" color="#8BC34A" />
                  <Text style={styles.tabLoadingText}>Đang tải đánh giá...</Text>
                </View>
              ) : (
                <>
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

                  {!isOwner && (
                    <View style={styles.reviewInputContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="pencil-outline" size={20} color="#8BC34A" />
                        <Text style={styles.sectionTitle}>Viết đánh giá của bạn</Text>
                      </View>
                      <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity key={star} onPress={() => handleRatingChange(star)}>
                            <Icon
                              name={star <= userRating ? "star" : "star-outline"}
                              size={36}
                              color="#FFC107"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <View style={[
                        styles.inputWrapper,
                        isCommentFocused && styles.inputFocused,
                        !!commentError && styles.inputError
                      ]}>
                        <TextInput
                          style={styles.inputBox}
                          placeholder="Món ăn này thế nào? Hãy chia sẻ cảm nhận của bạn..."
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={4}
                          value={reviewComment}
                          onChangeText={handleCommentChange}
                          onFocus={() => setIsCommentFocused(true)}
                          onBlur={() => setIsCommentFocused(false)}
                        />
                      </View>
                      
                      {commentError ? (
                        <Text style={styles.errorText}>{commentError}</Text>
                      ) : null}

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

                  <View style={styles.reviewListCard}>
                    <View style={styles.sectionHeader}>
                      <Icon name="comment-text-outline" size={20} color="#8BC34A" />
                      <Text style={styles.sectionTitle}>Nhận xét gần đây</Text>
                    </View>

                    {reviews.length > 0 ? (
                      reviews.map((item) => (
                        <View key={item.id} style={styles.reviewItem}>
                          <View style={styles.reviewHeader}>
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
                            
                            <View style={styles.reviewActions}>
                              <Text style={styles.reviewDate}>
                                {item.createdAtUtc ? formatDate(item.createdAtUtc) : 'Không rõ'}
                              </Text>
                              
                              {isMyRating(item) ? (
                                <TouchableOpacity
                                  style={styles.actionIcon}
                                  onPress={() => handleDeleteRating(item.id)}
                                >
                                  <Icon name="delete-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={styles.actionIcon}
                                  onPress={() => handleReportRating(item.id)}
                                >
                                  <Icon name="flag-outline" size={20} color="#F59E0B" />
                                </TouchableOpacity>
                              )}
                            </View>
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
                </>
              )}
            </View>
          )}

          {/* TAB: BÌNH LUẬN */}
          {activeTab === 'comment' && (
            <View style={styles.commentContainer}>
              {loadingComment ? (
                <View style={styles.tabLoadingContainer}>
                  <ActivityIndicator size="large" color="#8BC34A" />
                  <Text style={styles.tabLoadingText}>Đang tải bình luận...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.commentInputContainer}>
                    <View style={styles.sectionHeader}>
                      <Icon name="message-text-outline" size={20} color="#8BC34A" />
                      <Text style={styles.sectionTitle}>Viết bình luận</Text>
                    </View>
                    
                    {replyToCommentId && (
                      <View style={styles.replyingToContainer}>
                        <Text style={styles.replyingToText}>
                          Đang trả lời <Text style={styles.replyingToName}>@{replyToUserName}</Text>
                        </Text>
                        <TouchableOpacity onPress={handleCancelReply}>
                          <Icon name="close-circle" size={20} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    <View style={styles.commentInputWrapper}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Viết bình luận của bạn... (gõ @ để đề cập ai đó)"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                        value={commentText}
                        onChangeText={setCommentText}
                      />
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.commentSubmitButton,
                        (!commentText.trim() || submittingComment) && { opacity: 0.5 }
                      ]}
                      onPress={handleSendComment}
                      disabled={submittingComment || !commentText.trim()}
                    >
                      {submittingComment ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Icon name="send" size={18} color="#FFFFFF" />
                          <Text style={styles.commentSubmitText}>
                            {replyToCommentId ? 'Gửi trả lời' : 'Gửi bình luận'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commentListCard}>
                    <View style={styles.sectionHeader}>
                      <Icon name="comment-text-multiple-outline" size={20} color="#8BC34A" />
                      <Text style={styles.sectionTitle}>Bình luận gần đây</Text>
                    </View>

                    {comments.length > 0 ? (
                      comments.map(comment => renderCommentItem(comment))
                    ) : (
                      <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
                    )}
                  </View>
                </>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>


      </View>
    </SafeAreaView>
  );
};

export default ViewRecipeScreen;