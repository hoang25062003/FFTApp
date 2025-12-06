import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';

// ✅ Xóa AsyncStorage import vì Service đã lo rồi
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

import HeaderApp from '../../components/HeaderApp';
import RecipeCard from '../../components/RecipeCard';
import Pagination from '../../components/Pagination';

import UserService, { UserProfile, getGenderDisplay } from '../../services/UserService';
import RecipeService, { Recipe } from '../../services/RecipeService';
import AuthService from '../../services/AuthService'; // ✅ Import AuthService
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

import { localStyles, BRAND_COLOR_EXPORT } from './ProfileScreenStyles'; 

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const { width } = Dimensions.get('window');
const BRAND_COLOR = BRAND_COLOR_EXPORT; 

const initialUserData: UserProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: 'Male',
    avatarUrl: null,
    dateOfBirth: null,
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    address: null,
    bio: null,
};

interface InfoRowProps {
    iconName: string;
    label: string;
    value: string;
    isLink?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ iconName, label, value, isLink = false }) => (
    <View style={localStyles.infoRow}>
        <View style={localStyles.infoIconContainer}>
            <MaterialIcon name={iconName} size={22} color={BRAND_COLOR} />
        </View>
        <View style={localStyles.infoContent}>
            <Text style={localStyles.infoLabel}>{label}</Text>
            <Text
                style={[localStyles.infoValue, isLink && { color: BRAND_COLOR }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {value}
            </Text>
        </View>
    </View>
);

const formatDateToVN = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return dateString;
};

const getFullImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('file://')) {
        return url;
    }
    return `${API_BASE_URL}${url}`;
};

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileNavigationProp>();
    const isFocused = useIsFocused();
    
    // States
    const [userData, setUserData] = useState<UserProfile>(initialUserData);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Recipe States
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUserProfile = useCallback(async () => {
        try {
            const profile = await UserService.getUserProfile();
            setUserData(profile);
            setError(null);
        } catch (err) {
            console.error('API Error:', err);
            setError('Không thể tải hồ sơ');
        }
    }, []);

    const fetchRecipes = useCallback(async () => {
        setIsLoadingRecipes(true);
        try {
            const response = await RecipeService.getMyRecipes({
                page: currentPage,
                pageSize: pageSize,
                title: searchQuery || undefined,
            });
            if (response && response.items) {
                setRecipes(response.items);
                setTotalRecipes(response.totalCount || 0);
            } else {
                setRecipes([]);
                setTotalRecipes(0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchUserProfile(), fetchRecipes()]);
            setIsLoading(false);
        };
        loadData();
    }, []); 

    useEffect(() => {
        if (isFocused && !isLoading) {
            fetchUserProfile();
        }
    }, [isFocused]);

    useEffect(() => {
        if (!isLoading) {
            fetchRecipes();
        }
    }, [currentPage, pageSize, searchQuery]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchUserProfile(), fetchRecipes()]);
        setRefreshing(false);
    };

    const handleBackPress = () => navigation.goBack();
    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
    const handleSearch = (text: string) => { setSearchQuery(text); setCurrentPage(1); };
    const handleEditProfile = () => navigation.navigate('EditProfile');
    const handleViewRecipe = (recipeId: string) => navigation.navigate('ViewRecipe', { recipeId });

    // ✅ CẬP NHẬT LOGIC ĐĂNG XUẤT SỬ DỤNG SERVICE
    const performLogout = async () => {
        try {
            // 1. Gọi hàm logout từ AuthService
            // Hàm này đã bao gồm: Gọi API logout (nếu có) + Xóa AsyncStorage (TokenManager.clearAll)
            await AuthService.logout(); 
            
            // 2. Reset navigation stack và chuyển về Login
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AuthFlow' }], // Đảm bảo 'Auth' là tên đúng trong AppNavigator của bạn
                })
            );
        } catch (error) {
            console.error("Logout Error:", error);
            // Dù lỗi API hay gì thì vẫn nên xóa token local và đẩy về login
            await AuthService.TokenManager.clearAll(); 
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AuthFlow' }],
                })
            );
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Đăng xuất", 
                    style: "destructive", 
                    onPress: performLogout 
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={localStyles.centerContainer}>
                <ActivityIndicator size="large" color={BRAND_COLOR} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={localStyles.centerContainer}>
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
                <TouchableOpacity onPress={fetchUserProfile} style={localStyles.retryButton}>
                    <Text style={{ color: '#fff' }}>Thử lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const fullName = `${userData.firstName} ${userData.lastName}`.trim() || 'Người dùng';
    const addressDisplay = userData.address || 'Chưa cập nhật';
    const bioDisplay = userData.bio || 'Chưa có tiểu sử giới thiệu bản thân.';
    const birthDateDisplay = formatDateToVN(userData.dateOfBirth);
    const totalPages = Math.ceil(totalRecipes / pageSize);
    const finalAvatarUrl = getFullImageUrl(userData.avatarUrl);

    return (
        <View style={localStyles.container}>
            <HeaderApp isHome={false} onBackPress={handleBackPress} />

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_COLOR]} />
                }
            >
                
                <View style={localStyles.headerSection}>
                    <ImageBackground 
                        source={require('../../assets/images/background.jpg')}
                        style={localStyles.gradientBg}
                        resizeMode="cover"
                    >
                        <View style={localStyles.patternOverlay} />
                    </ImageBackground>
                    
                    <View style={localStyles.profileHeader}>
                        <View style={localStyles.avatarSection}>
                            <View style={localStyles.avatarWrapper}>
                                {finalAvatarUrl ? (
                                    <Image 
                                        source={{ uri: finalAvatarUrl }} 
                                        style={localStyles.avatarImage} 
                                    />
                                ) : (
                                    <View style={localStyles.avatarPlaceholder}>
                                        <MaterialIcon name="account" size={50} color="#FFFFFF" />
                                    </View>
                                )}
                                <TouchableOpacity style={localStyles.editAvatarBadge} onPress={handleEditProfile}>
                                    <MaterialIcon name="camera" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={localStyles.profileInfo}>
                            <Text style={localStyles.profileName}>{fullName}</Text>
                            <Text style={localStyles.profileBio}>{bioDisplay}</Text>
                        </View>
                    </View>

                    <View style={localStyles.statsCard}>
                        <View style={localStyles.statItem}>
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="account-multiple" size={20} color={BRAND_COLOR} />
                            </View>
                            <Text style={localStyles.statValue}>{userData.followersCount}</Text>
                            <Text style={localStyles.statLabel}>Followers</Text>
                        </View>
                        
                        <View style={localStyles.statDivider} />
                        
                        <View style={localStyles.statItem}>
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="account-heart" size={20} color={BRAND_COLOR} />
                            </View>
                            <Text style={localStyles.statValue}>{userData.followingCount}</Text>
                            <Text style={localStyles.statLabel}>Following</Text>
                        </View>
                        
                        <View style={localStyles.statDivider} />
                        
                        <View style={localStyles.statItem}>
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="star" size={20} color="#FFB800" />
                            </View>
                            <Text style={localStyles.statValue}>4.5</Text>
                            <Text style={localStyles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    <View style={localStyles.actionButtonsContainer}>
                        <TouchableOpacity style={localStyles.editButton} onPress={handleEditProfile}>
                            <MaterialIcon name="pencil" size={20} color="#FFFFFF" />
                            <Text style={localStyles.editButtonText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={localStyles.shareButton}>
                            <MaterialIcon name="share-variant" size={20} color={BRAND_COLOR} />
                            <Text style={localStyles.shareButtonText}>Chia sẻ</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={localStyles.logoutButton} onPress={handleLogout}>
                            <MaterialIcon name="logout" size={20} color="#FF5252" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={localStyles.contentSection}>
                    <View style={localStyles.infoCard}>
                        <View style={localStyles.cardHeader}>
                            <MaterialIcon name="information" size={24} color={BRAND_COLOR} />
                            <Text style={localStyles.cardTitle}>Thông tin cá nhân</Text>
                        </View>
                        
                        <InfoRow iconName="calendar" label="Ngày sinh" value={birthDateDisplay} />
                        <InfoRow iconName="gender-male-female" label="Giới tính" value={getGenderDisplay(userData.gender)} />
                        <InfoRow iconName="email" label="Email" value={userData.email} isLink />
                        <InfoRow iconName="map-marker" label="Địa chỉ" value={addressDisplay} />
                    </View>

                    <View style={localStyles.recipeSection}>
                        <View style={localStyles.recipeSectionHeader}>
                            <View style={localStyles.recipeTitleContainer}>
                                <MaterialIcon name="book-open-variant" size={24} color={BRAND_COLOR} />
                                <Text style={localStyles.recipeSectionTitle}>Công thức của tôi</Text>
                                <View style={localStyles.recipeBadge}>
                                    <Text style={localStyles.recipeBadgeText}>{totalRecipes}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={localStyles.searchBarContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                placeholder="Tìm kiếm công thức..."
                                style={localStyles.searchInput}
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {isLoadingRecipes ? (
                            <ActivityIndicator size="small" color={BRAND_COLOR} style={{ marginVertical: 30 }} />
                        ) : recipes.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <View style={localStyles.emptyIconContainer}>
                                    <MaterialIcon name="chef-hat" size={60} color="#E5E7EB" />
                                </View>
                                <Text style={localStyles.emptyStateTitle}>
                                    {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có công thức nào'}
                                </Text>
                                <Text style={localStyles.emptyStateText}>
                                    {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy bắt đầu chia sẻ công thức của bạn'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={localStyles.recipesGrid}>
                                    {recipes.map((recipe) => (
                                        <RecipeCard
                                            key={recipe.id}
                                            imageUri={recipe.imageUrl || 'https://via.placeholder.com/150'} 
                                            title={recipe.name || 'Không có tiêu đề'}
                                            cookTime={recipe.cookTime || 0}
                                            ration={recipe.ration || 0}
                                            difficulty={recipe.difficulty?.value || 'EASY'}
                                            isPrivate={recipe.status === 'PRIVATE'}
                                            onPress={() => handleViewRecipe(recipe.id)}
                                        />
                                    ))}
                                </View>
                                {totalRecipes > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        pageSize={pageSize}
                                        totalItems={totalRecipes}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                        pageSizeOptions={[6, 10, 20]}
                                        showPageSizeSelector={true}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default ProfileScreen;