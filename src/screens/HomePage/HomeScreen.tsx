import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, ActivityIndicator, Image, Alert, Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';
import styles, { BRAND_COLOR } from './HomeScreenStyles';

import { getRecipes, MyRecipe, saveRecipe, unsaveRecipe, getSavedRecipes, searchRecipes } from '../../services/RecipeService';
import { getIngredients, Ingredient } from '../../services/IngredientService';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
    const [isLoadingDishes, setIsLoadingDishes] = useState(true);
    const [savingRecipes, setSavingRecipes] = useState<Set<string>>(new Set());
    
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [dishes, setDishes] = useState<MyRecipe[]>([]);
    const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

    const isSearching = searchQuery.trim().length > 0;

    const loadSavedRecipeIds = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setSavedRecipeIds(new Set());
                return;
            }
            const savedRecipes = await getSavedRecipes({ pageNumber: 1, pageSize: 1000 });
            const ids = new Set(savedRecipes.items.map(recipe => recipe.id));
            setSavedRecipeIds(ids);
        } catch (error) {
            console.error('Error loading saved recipes:', error);
            setSavedRecipeIds(new Set());
        }
    };

    const loadIngredients = async () => {
        try {
            setIsLoadingIngredients(true);
            const response = await getIngredients(1, 10);
            setIngredients(response.items);
        } catch (error) {
            console.error('Error loading ingredients:', error);
            setIngredients([]);
        } finally {
            setIsLoadingIngredients(false);
        }
    };

    const loadDishes = async () => {
        try {
            setIsLoadingDishes(true);
            const response = await getRecipes({ page: 1, pageSize: 10 });
            setDishes(response.items);
        } catch (error) {
            console.error('Error loading dishes:', error);
            setDishes([]);
        } finally {
            setIsLoadingDishes(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadDishes();
            return;
        }

        Keyboard.dismiss();
        try {
            setIsLoadingDishes(true);
            const response = await searchRecipes({ 
                keyword: searchQuery, 
                pageNumber: 1, 
                pageSize: 20 
            });
            setDishes(response.items);
        } catch (error) {
            console.error('Error searching dishes:', error);
            setDishes([]);
            Alert.alert("Lỗi", "Không thể tìm kiếm món ăn lúc này.");
        } finally {
            setIsLoadingDishes(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        loadDishes();
    };

    const loadAllData = async () => {
        await Promise.all([
            loadIngredients(),
            loadDishes(),
            loadSavedRecipeIds()
        ]);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSavedRecipeIds();
        }, [])
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (isSearching) {
            await handleSearch();
        } else {
            await loadAllData();
        }
        setIsRefreshing(false);
    };

    const getDifficultyStyle = (difficulty: string | number) => {
        const difficultyValue = typeof difficulty === 'number' ? difficulty : 0;
        if (difficultyValue <= 1) {
            return { color: '#10B981', bgColor: '#ECFDF5', text: 'Dễ' };
        } else if (difficultyValue === 2) {
            return { color: '#F59E0B', bgColor: '#FFFBEB', text: 'Vừa' };
        } else {
            return { color: '#EF4444', bgColor: '#FEF2F2', text: 'Khó' };
        }
    };

    const handleRecipePress = (recipeId: string) => {
        navigation.navigate('ViewRecipeScreen', { recipeId });
    };

    const handleIngredientPress = (ingredientId: string) => {
        navigation.navigate('IngredientDetail', { ingredientId });
    };

    const handleProfilePress = (author: any) => {
        const username = author?.userName || author?.username;
        if (username) {
            navigation.navigate('ProfileScreen', { username });
        } else {
            Alert.alert('Thông báo', 'Không thể xem thông tin người dùng này');
        }
    };

    const handleSaveRecipe = async (recipeId: string, isSaved: boolean) => {
        if (savingRecipes.has(recipeId)) return;
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu công thức');
            return;
        }

        setSavingRecipes(prev => new Set(prev).add(recipeId));

        try {
            if (isSaved) {
                await unsaveRecipe(recipeId);
                setSavedRecipeIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(recipeId);
                    return newSet;
                });
            } else {
                await saveRecipe(recipeId);
                setSavedRecipeIds(prev => new Set(prev).add(recipeId));
            }
        } catch (error) {
            console.error('Error saving/unsaving recipe:', error);
        } finally {
            setSavingRecipes(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        }
    };

    // ✅ HÀM CHUYỂN HƯỚNG ĐẾN TRANG INGREDIENTS
    const handleViewAllIngredients = () => {
        navigation.navigate('IngredientsScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeaderApp />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefreshing} 
                        onRefresh={handleRefresh}
                        colors={[BRAND_COLOR]}
                    />
                }
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerBackground}>
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />
                        
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.headerSubtitle}>Chào mừng trở lại</Text>
                                <Text style={styles.headerTitle}>Khám Phá Món Ngon</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Card */}
                <View style={styles.searchCard}>
                    <View style={styles.searchContainer}>
                        <TouchableOpacity onPress={handleSearch}>
                            <Icon name="search-outline" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm món ăn, công thức..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Icon name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Ingredients Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcon name="food-apple" size={22} color={BRAND_COLOR} />
                        <Text style={styles.sectionTitle}>Danh sách nguyên liệu</Text>
                        {/* ✅ NÚT XEM TẤT CẢ - BỎ BADGE SỐ LƯỢNG */}
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={handleViewAllIngredients}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>Xem tất cả</Text>
                            <Icon name="chevron-forward" size={16} color={BRAND_COLOR} />
                        </TouchableOpacity>
                    </View>
                    
                    {isLoadingIngredients ? (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="large" color={BRAND_COLOR} />
                        </View>
                    ) : ingredients.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScrollContent}
                        >
                            {ingredients.map(item => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.recentCard}
                                    onPress={() => handleIngredientPress(item.id)}
                                >
                                    <View style={styles.recentCardImage}>
                                        {item.imageUrl ? (
                                            <Image 
                                                source={{ uri: item.imageUrl }} 
                                                style={{ width: '100%', height: '100%', borderRadius: 12 }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <MaterialIcon name="food-apple" size={32} color={BRAND_COLOR} />
                                        )}
                                        {item.isNew && (
                                            <View style={styles.newBadge}>
                                                <Text style={styles.newBadgeText}>Mới</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.recentCardText} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    {item.categoryNames && item.categoryNames.length > 0 && (
                                        <Text style={styles.categoryText} numberOfLines={1}>
                                            {item.categoryNames[0].name}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <Text style={{ color: '#9CA3AF' }}>Chưa có nguyên liệu nào</Text>
                        </View>
                    )}
                </View>

                {/* Dishes Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcon name="chef-hat" size={22} color={BRAND_COLOR} />
                        <Text style={styles.sectionTitle}>
                            {isSearching ? "Kết quả tìm kiếm" : "Hôm nay ăn gì?"}
                        </Text>
                    </View>

                    {isLoadingDishes ? (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color={BRAND_COLOR} />
                        </View>
                    ) : dishes.length > 0 ? (
                        dishes.map(dish => {
                            const difficultyStyle = getDifficultyStyle(dish.difficulty.value);
                            const authorName = dish.author 
                                ? `${dish.author.firstName} ${dish.author.lastName}` 
                                : 'Ẩn danh';
                            const isSaved = savedRecipeIds.has(dish.id);
                            const isSaving = savingRecipes.has(dish.id);
                            
                            return (
                                <View key={dish.id} style={styles.dishCard}>
                                    <View style={styles.dishHeader}>
                                        <TouchableOpacity 
                                            style={styles.userInfo}
                                            onPress={() => handleProfilePress(dish.author)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.userAvatar}>
                                                {dish.author?.avatarUrl ? (
                                                    <Image 
                                                        source={{ uri: dish.author.avatarUrl }} 
                                                        style={{ width: '100%', height: '100%', borderRadius: 20 }}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <MaterialIcon name="account" size={20} color={BRAND_COLOR} />
                                                )}
                                            </View>
                                            <Text style={styles.userName}>{authorName}</Text>
                                        </TouchableOpacity>

                                        <View style={[styles.difficultyTag, { backgroundColor: difficultyStyle.bgColor }]}>
                                            <MaterialIcon name="speedometer" size={14} color={difficultyStyle.color} />
                                            <Text style={[styles.difficultyText, { color: difficultyStyle.color }]}>
                                                {difficultyStyle.text}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.dishTitle}>{dish.name}</Text>

                                    <TouchableOpacity 
                                        style={styles.dishImageContainer}
                                        onPress={() => handleRecipePress(dish.id)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.dishImage}>
                                            {dish.imageUrl ? (
                                                <Image 
                                                    source={{ uri: dish.imageUrl }} 
                                                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <MaterialIcon name="food-variant" size={60} color="#E0E0E0" />
                                            )}
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.dishInfoGrid}>
                                        <View style={styles.infoCard}>
                                            <View style={styles.infoIconBg}>
                                                <Icon name="time-outline" size={18} color="#F59E0B" />
                                            </View>
                                            <Text style={styles.infoValue}>{dish.cookTime}</Text>
                                            <Text style={styles.infoLabel}>phút</Text>
                                        </View>
                                        <View style={styles.infoCard}>
                                            <View style={[styles.infoIconBg, { backgroundColor: '#DBEAFE' }]}>
                                                <Icon name="people-outline" size={18} color="#3B82F6" />
                                            </View>
                                            <Text style={styles.infoValue}>{dish.ration}</Text>
                                            <Text style={styles.infoLabel}>người</Text>
                                        </View>
                                        <View style={styles.infoCard}>
                                            <View style={[styles.infoIconBg, { backgroundColor: '#FEF3C7' }]}>
                                                <Icon name="star" size={18} color="#F59E0B" />
                                            </View>
                                            <Text style={styles.infoValue}>
                                                {dish.averageRating ? dish.averageRating.toFixed(1) : 'N/A'}
                                            </Text>
                                            <Text style={styles.infoLabel}>đánh giá</Text>
                                        </View>
                                    </View>

                                    <View style={styles.dishActions}>
                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => handleSaveRecipe(dish.id, isSaved)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <ActivityIndicator size="small" color={BRAND_COLOR} />
                                            ) : (
                                                <>
                                                    <View style={styles.actionIconBg}>
                                                        <Icon 
                                                            name={isSaved ? "bookmark" : "bookmark-outline"} 
                                                            size={18} 
                                                            color={isSaved ? BRAND_COLOR : "#6B7280"} 
                                                        />
                                                    </View>
                                                    <Text style={[styles.actionText, isSaved && { color: BRAND_COLOR }]}>
                                                        {isSaved ? 'Đã lưu' : 'Lưu'}
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionButton}>
                                            <View style={styles.actionIconBg}>
                                                <Icon name="share-social-outline" size={18} color={BRAND_COLOR} />
                                            </View>
                                            <Text style={styles.actionText}>Chia sẻ</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.primaryActionButton]}
                                            onPress={() => handleRecipePress(dish.id)}
                                        >
                                            <Icon name="restaurant" size={18} color="#FFFFFF" />
                                            <Text style={styles.primaryActionText}>Nấu ngay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <MaterialIcon name="chef-hat" size={48} color="#D1D5DB" />
                            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>
                                {isSearching ? "Không tìm thấy kết quả" : "Chưa có công thức nào"}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;