import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, ActivityIndicator, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';
import styles, { BRAND_COLOR } from './HomeScreenStyles';
import { getHistory, getRecipes, MyRecipe } from '../../services/RecipeService';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isLoadingDishes, setIsLoadingDishes] = useState(true);
    
    // Recently viewed from API
    const [recentlyViewed, setRecentlyViewed] = useState<MyRecipe[]>([]);
    
    // Today's dishes from API
    const [dishes, setDishes] = useState<MyRecipe[]>([]);

    // Load history data
    const loadHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const response = await getHistory({ pageNumber: 1, pageSize: 8 });
            setRecentlyViewed(response.items);
        } catch (error) {
            console.error('Error loading history:', error);
            setRecentlyViewed([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Load today's dishes
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

    // Load data on mount
    useEffect(() => {
        loadHistory();
        loadDishes();
    }, []);

    // Reload history when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken"); 
            console.log("Đã logout và xóa token");
            navigation.reset({
                index: 0,
                routes: [{ name: 'AuthFlow' }],
            });
        } catch (error) {
            console.log("Logout error: ", error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([loadHistory(), loadDishes()]);
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
        // Navigate to recipe detail screen
        navigation.navigate('RecipeDetail', { recipeId });
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
                {/* Header Section with Gradient */}
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

                {/* Search Card with Shadow */}
                <View style={styles.searchCard}>
                    <View style={styles.searchContainer}>
                        <Icon name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm món ăn, công thức..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Recently Viewed Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcon name="history" size={22} color={BRAND_COLOR} />
                        <Text style={styles.sectionTitle}>Đã xem gần đây</Text>
                        {!isLoadingHistory && (
                            <View style={styles.badgeCount}>
                                <Text style={styles.badgeText}>{recentlyViewed.length}</Text>
                            </View>
                        )}
                    </View>
                    
                    {isLoadingHistory ? (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="large" color={BRAND_COLOR} />
                        </View>
                    ) : recentlyViewed.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScrollContent}
                        >
                            {recentlyViewed.map(item => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.recentCard}
                                    onPress={() => handleRecipePress(item.id)}
                                >
                                    <View style={styles.recentCardImage}>
                                        {item.imageUrl ? (
                                            <Image 
                                                source={{ uri: item.imageUrl }} 
                                                style={{ width: '100%', height: '100%', borderRadius: 12 }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <MaterialIcon name="food" size={32} color={BRAND_COLOR} />
                                        )}
                                    </View>
                                    <Text style={styles.recentCardText} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <MaterialIcon name="history" size={48} color="#D1D5DB" />
                            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>
                                Chưa có lịch sử xem
                            </Text>
                        </View>
                    )}
                </View>

                {/* Today's Dishes Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcon name="chef-hat" size={22} color={BRAND_COLOR} />
                        <Text style={styles.sectionTitle}>Hôm nay ăn gì?</Text>
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
                            
                            return (
                                <TouchableOpacity 
                                    key={dish.id} 
                                    style={styles.dishCard}
                                    onPress={() => handleRecipePress(dish.id)}
                                    activeOpacity={0.7}
                                >
                                    {/* Dish Header */}
                                    <View style={styles.dishHeader}>
                                        <View style={styles.userInfo}>
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
                                        </View>

                                        <View style={[styles.difficultyTag, { backgroundColor: difficultyStyle.bgColor }]}>
                                            <MaterialIcon 
                                                name="speedometer" 
                                                size={14} 
                                                color={difficultyStyle.color} 
                                            />
                                            <Text style={[styles.difficultyText, { color: difficultyStyle.color }]}>
                                                {difficultyStyle.text}
                                            </Text>
                                        </View>

                                        <TouchableOpacity style={styles.moreButton}>
                                            <Icon name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Dish Title */}
                                    <Text style={styles.dishTitle}>{dish.name}</Text>

                                    {/* Dish Image */}
                                    <View style={styles.dishImageContainer}>
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
                                    </View>

                                    {/* Dish Info Grid */}
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

                                    {/* Dish Actions */}
                                    <View style={styles.dishActions}>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <View style={styles.actionIconBg}>
                                                <Icon name="bookmark-outline" size={18} color={BRAND_COLOR} />
                                            </View>
                                            <Text style={styles.actionText}>Lưu</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionButton}>
                                            <View style={styles.actionIconBg}>
                                                <Icon name="share-social-outline" size={18} color={BRAND_COLOR} />
                                            </View>
                                            <Text style={styles.actionText}>Chia sẻ</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
                                            <Icon name="restaurant" size={18} color="#FFFFFF" />
                                            <Text style={styles.primaryActionText}>Nấu ngay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <MaterialIcon name="chef-hat" size={48} color="#D1D5DB" />
                            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>
                                Chưa có công thức nào
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;