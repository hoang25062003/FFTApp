import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet, // Import StyleSheet
  Dimensions, // Import Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Giả định cấu trúc types và service từ file IngredientService ---
// Bạn cần thay thế bằng các import thực tế nếu file này là một phần của project lớn
interface Ingredient {
  id: number;
  name: string;
  // ... các thuộc tính khác của Ingredient
}

interface CategoryName {
  id: number;
  name: string;
}

interface IngredientDetail extends Ingredient {
  imageUrl?: string;
  calories?: number;
  categoryNames?: CategoryName[];
  updatedAtUtc?: string;
  protein?: number;
  totalFat?: number;
  starch?: number;
  description?: string;
}

// Giả định một service cơ bản
const IngredientService = {
  getIngredientById: async (id: number): Promise<IngredientDetail> => {
    // Đây là nơi bạn sẽ thực hiện cuộc gọi API thực tế.
    // Dưới đây là dữ liệu giả để component có thể render.
    console.log(`Fetching detail for ingredient ID: ${id}`);
    
    // Thêm độ trễ để mô phỏng tải
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // Dữ liệu giả định
    return {
      id: id,
      name: id === 1 ? 'Quả Táo Đỏ' : 'Nguyên liệu không xác định',
      imageUrl: id === 1 
        ? 'https://via.placeholder.com/300x180/F59E0B/FFFFFF?text=Apple+Image' 
        : undefined,
      calories: 52,
      categoryNames: [{ id: 1, name: 'Trái cây' }],
      updatedAtUtc: '2025-12-01T10:00:00Z',
      protein: 0.3,
      totalFat: 0.2,
      starch: 13.8,
      description: 'Táo là một loại trái cây bổ dưỡng, giàu chất xơ và vitamin C. Ăn táo thường xuyên giúp cải thiện tiêu hóa và tăng cường miễn dịch.',
    } as IngredientDetail;
  },
};
// -----------------------------------------------------------------


const { width, height } = Dimensions.get('window');
export const BRAND_COLOR = '#8BC34A'; // Màu thương hiệu (Xanh lá)

// --- Stylesheet ---
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  ingredientImage: {
    width: '100%',
    height: '100%',
  },
  basicInfo: {
    gap: 12,
  },
  ingredientName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Nutrition Grid
  nutritionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  nutritionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  nutritionUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Search Button
  searchButton: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Description Card
  descriptionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
// --- End Stylesheet ---


interface IngredientDetailDialogProps {
  visible: boolean;
  ingredient: Ingredient;
  onClose: () => void;
}

const IngredientDetailDialog: React.FC<IngredientDetailDialogProps> = ({
  visible,
  ingredient,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ingredientDetail, setIngredientDetail] = useState<IngredientDetail | null>(null);

  useEffect(() => {
    if (visible && ingredient) {
      loadIngredientDetail();
    }
  }, [visible, ingredient]);

  const loadIngredientDetail = async () => {
    try {
      setIsLoading(true);
      // Giả sử IngredientService.getIngredientById đã được định nghĩa
      const detail = await IngredientService.getIngredientById(ingredient.id); 
      setIngredientDetail(detail);
    } catch (error) {
      console.error('Error loading ingredient detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết nguyên liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    // Sử dụng try-catch hoặc kiểm tra date.isValid() (nếu dùng thư viện) để đảm bảo an toàn
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return 'Không hợp lệ';
    }
  };

  const renderNutritionCard = (
    icon: string,
    label: string,
    value: number,
    unit: string,
    bgColor: string,
    iconColor: string
  ) => (
    <View style={styles.nutritionCard}>
      <View style={[styles.nutritionIconBg, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>
        {value} <Text style={styles.nutritionUnit}>{unit}</Text>
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBg}>
                <Icon name="food-apple" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.headerTitle}>Chi tiết nguyên liệu</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLOR} />
              <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
          ) : ingredientDetail ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Image & Basic Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.imageContainer}>
                  {ingredientDetail.imageUrl ? (
                    <Image
                      source={{ uri: ingredientDetail.imageUrl }}
                      style={styles.ingredientImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name="food-apple" size={60} color={BRAND_COLOR} />
                  )}
                </View>
                <View style={styles.basicInfo}>
                  <Text style={styles.ingredientName}>{ingredientDetail.name}</Text>
                                    <View style={styles.infoRow}>
                    <Icon name="fire" size={16} color="#F59E0B" />
                    <Text style={styles.infoLabel}>Năng lượng:</Text>
                    <Text style={styles.infoValue}>
                      {ingredientDetail.calories || 0} kcal/100g
                    </Text>
                  </View>
                  {ingredientDetail.categoryNames && ingredientDetail.categoryNames.length > 0 && (
                    <View style={styles.infoRow}>
                      <Icon name="tag" size={16} color={BRAND_COLOR} />
                      <Text style={styles.infoLabel}>Danh mục:</Text>
                      <Text style={styles.infoValue}>
                        {ingredientDetail.categoryNames[0].name}
                      </Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Icon name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Cập nhật lần cuối:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(ingredientDetail.updatedAtUtc)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Nutrition Section */}
              <View style={styles.sectionHeader}>
                <Icon name="nutrition" size={20} color={BRAND_COLOR} />
                <Text style={styles.sectionTitle}>Dinh dưỡng chính (trên 100g)</Text>
              </View>
              <View style={styles.nutritionGrid}>
                {renderNutritionCard(
                  'food-drumstick',
                  'Chất đạm',
                  ingredientDetail.protein || 0,
                  'g',
                  '#FEF3C7',
                  '#F59E0B'
                )}
                {renderNutritionCard(
                  'oil',
                  'Tổng chất béo',
                  ingredientDetail.totalFat || 0,
                  'g',
                  '#DBEAFE',
                  '#3B82F6'
                )}
                {renderNutritionCard(
                  'candy',
                  'Tinh bột',
                  ingredientDetail.starch || 0,
                  'g',
                  '#FEF2F2',
                  '#EF4444'
                )}
              </View>

              {/* Search Button */}
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => {
                  onClose();
                  // TODO: Navigate to search recipes with this ingredient
                  Alert.alert('Tính năng', `Tìm kiếm công thức với ${ingredientDetail.name}`);
                }}
              >
                <Icon name="magnify" size={20} color="#FFFFFF" />
                <Text style={styles.searchButtonText}>
                  Tìm công thức với {ingredientDetail.name}
                </Text>
              </TouchableOpacity>

              {/* Additional Info */}
              {ingredientDetail.description && (
                <View style={styles.descriptionCard}>
                  <View style={styles.descriptionHeader}>
                    <Icon name="information-outline" size={18} color={BRAND_COLOR} />
                    <Text style={styles.descriptionTitle}>Mô tả</Text>
                  </View>
                  <Text style={styles.descriptionText}>
                    {ingredientDetail.description}
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Không thể tải thông tin nguyên liệu</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default IngredientDetailDialog;