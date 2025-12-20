import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';
import IngredientDetailDialog from '../../components/IngredientDetailDialog';

// Import Services
import IngredientService, { Ingredient } from '../../services/IngredientService';
import IngredientCategoryService, { IngredientCategory } from '../../services/IngredientCategoryService';

// Import styles
import { styles, BRAND_COLOR } from './IngredientsScreenStyles';

const IngredientsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Dialog state
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Load data
  useEffect(() => {
    loadIngredients();
    loadCategories();
  }, []);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const response = await IngredientService.getIngredients(1, 50);
      setIngredients(response.items || []);
    } catch (error) {
      // console.error('Error loading ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await IngredientCategoryService.getIngredientCategories();
      setCategories(data || []);
    } catch (error) {
      // console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Filter ingredients
  const filteredIngredients = ingredients.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || 
      item.categoryNames?.some(cat => cat.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleIngredientPress = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowDetailDialog(true);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <View style={styles.innerContainer}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Kho Nguyên Liệu</Text>
                <Text style={styles.headerSubtitle}>
                  Khám phá các nguyên liệu và thông tin dinh dưỡng
                </Text>
              </View>
              <View style={styles.headerIconContainer}>
                <Icon name="food-apple" size={28} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </View>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm nguyên liệu..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Icon name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                Keyboard.dismiss();
                setIsFilterVisible(!isFilterVisible);
              }}
            >
              <Icon name="filter-variant" size={20} color={BRAND_COLOR} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardDismissMode="on-drag"
        >
          {/* Filter Section */}
          {isFilterVisible && (
            <View style={styles.filterCard}>
              <View style={styles.filterHeader}>
                <Icon name="filter-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.filterTitle}>Danh mục</Text>
              </View>

              {isLoadingCategories ? (
                <ActivityIndicator size="small" color={BRAND_COLOR} />
              ) : (
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryPill,
                        selectedCategory === category.id && styles.categoryPillActive,
                      ]}
                      onPress={() => handleCategoryPress(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category.id && styles.categoryTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                      {selectedCategory === category.id && (
                        <Icon name="check" size={14} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Results Info */}
          <View style={styles.resultsInfo}>
            <Icon name="playlist-check" size={18} color="#6B7280" />
            <Text style={styles.resultsText}>
              {filteredIngredients.length} nguyên liệu
              {selectedCategory && ' (đã lọc)'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
                <Icon name="close" size={14} color={BRAND_COLOR} />
              </TouchableOpacity>
            )}
          </View>

          {/* Ingredients List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLOR} />
              <Text style={styles.loadingText}>Đang tải nguyên liệu...</Text>
            </View>
          ) : filteredIngredients.length > 0 ? (
            <FlatList
              data={filteredIngredients}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ingredientCard}
                  onPress={() => handleIngredientPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ingredientImageContainer}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.ingredientImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Icon name="food-apple" size={40} color={BRAND_COLOR} />
                    )}
                    {item.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Mới</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.categoryNames && item.categoryNames.length > 0 && (
                      <View style={styles.categoryBadge}>
                        <Icon name="tag-outline" size={12} color="#6B7280" />
                        <Text style={styles.ingredientCategory} numberOfLines={1}>
                          {item.categoryNames[0].name}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="database-off" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Không tìm thấy nguyên liệu</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Danh sách nguyên liệu đang trống'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Ingredient Detail Dialog */}
      {/* {selectedIngredient && (
        <IngredientDetailDialog
          visible={showDetailDialog}
          ingredient={selectedIngredient}
          onClose={() => setShowDetailDialog(false)}
        />
      )} */}
    </SafeAreaView>
  );
};

export default IngredientsScreen;