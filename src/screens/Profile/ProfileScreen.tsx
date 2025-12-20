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
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused, CommonActions, useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

import HeaderApp from '../../components/HeaderApp';
import RecipeCard from '../../components/RecipeCard';
import Pagination from '../../components/Pagination';
import ReportDialog from '../../components/ReportDialog';

import UserService, { UserProfile, getGenderDisplay } from '../../services/UserService';
import profileService, { PublicProfileDto } from '../../services/ProfileService';
import RecipeService, { MyRecipe as Recipe } from '../../services/RecipeService';
import AuthService from '../../services/AuthService';

import { localStyles, BRAND_COLOR_EXPORT } from './ProfileScreenStyles';

const BRAND_COLOR = BRAND_COLOR_EXPORT;

type ProfileScreenRouteProp = RouteProp<{ ProfileScreen: { username?: string } }, 'ProfileScreen'>;

const initialUserData: UserProfile | PublicProfileDto = {
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
            <MaterialIcon name={iconName} size={20} color={BRAND_COLOR} />
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
    const navigation = useNavigation<any>();
    const route = useRoute<ProfileScreenRouteProp>();
    const isFocused = useIsFocused();

    const username = route.params?.username;
    const isOwnProfile = !username;

    const [userData, setUserData] = useState<UserProfile | PublicProfileDto>(initialUserData);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isReportVisible, setReportVisible] = useState(false);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'my_recipes' | 'saved_recipes'>('my_recipes');

    const fetchUserProfile = useCallback(async () => {
        try {
            if (isOwnProfile) {
                const profile = await UserService.getUserProfile();
                setUserData(profile);
                setIsFollowing(false);
            } else {
                const profile = await profileService.getUserProfileByUsername(username!);
                setUserData(profile);
                setIsFollowing(profile.isFollowing);
            }
            setError(null);
        } catch (err) {
            // console.error('API Error:', err);
            setError('Không thể tải hồ sơ');
        }
    }, [isOwnProfile, username]);

    const fetchRecipes = useCallback(async () => {
        setIsLoadingRecipes(true);
        try {
            let response;
            if (isOwnProfile) {
                if (activeTab === 'my_recipes') {
                    response = await RecipeService.getMyRecipes({
                        page: currentPage,
                        pageSize: pageSize,
                        title: searchQuery || undefined,
                    });
                } else {
                    response = await RecipeService.getSavedRecipes({
                        pageNumber: currentPage,
                        pageSize: pageSize,
                        keyword: searchQuery || undefined,
                    });
                }
            } else {
                response = await RecipeService.getRecipes({
                    page: currentPage,
                    pageSize: pageSize,
                });
            }

            if (response && response.items) {
                setRecipes(response.items);
                setTotalRecipes(response.totalCount || 0);
            } else {
                setRecipes([]);
                setTotalRecipes(0);
            }
        } catch (err) {
            // console.error(err);
            setRecipes([]);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [currentPage, pageSize, searchQuery, activeTab, isOwnProfile]);

    const handleFollowToggle = async () => {
        if (isOwnProfile || !userData.id) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await profileService.unfollowUser(userData.id);
                setIsFollowing(false);
                setUserData(prev => ({
                    ...prev,
                    followersCount: Math.max(0, prev.followersCount - 1)
                }));
            } else {
                await profileService.followUser(userData.id);
                setIsFollowing(true);
                setUserData(prev => ({
                    ...prev,
                    followersCount: prev.followersCount + 1
                }));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSubmitReport = async (reason: string) => {
        try {
            // console.log('Sending report for user:', userData.id, 'Reason:', reason);
            // TODO: await profileService.reportUser(userData.id, reason);
            setReportVisible(false);
            setTimeout(() => {
                Alert.alert('Đã gửi', 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm.');
            }, 300);
        } catch (error) {
            // console.error(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi báo cáo.');
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            await fetchUserProfile();
            setIsLoading(false);
        };
        loadProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    useEffect(() => {
        if (isFocused) {
            fetchUserProfile();
        }
    }, [isFocused, fetchUserProfile]);

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
    const handleViewRecipe = (recipeId: string) => {
        navigation.navigate('ViewRecipeScreen', { recipeId });
    };

    const handleTabChange = (tab: 'my_recipes' | 'saved_recipes') => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setCurrentPage(1);
            setSearchQuery('');
        }
    };

    const performLogout = async () => {
        try {
            await AuthService.logout();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AuthFlow' }],
                })
            );
        } catch (error) {
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
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", style: "destructive", onPress: performLogout }
        ]);
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
                <TouchableOpacity
                    onPress={handleLogout}
                    style={[localStyles.retryButton, { backgroundColor: '#FF5252', marginTop: 10 }]}
                >
                    <Text style={{ color: '#fff' }}>Đăng xuất</Text>
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
                {/* Header Section - New Design */}
                <View style={localStyles.headerSection}>
                    <View style={localStyles.headerBackground}>
                        <View style={localStyles.decorativeCircle1} />
                        <View style={localStyles.decorativeCircle2} />
                        <View style={localStyles.headerContent}>
                            <View>
                                <Text style={localStyles.headerTitle}>
                                    {isOwnProfile ? 'Hồ Sơ Của Tôi' : 'Trang Cá Nhân'}
                                </Text>
                                <Text style={localStyles.headerSubtitle}>
                                    {isOwnProfile ? 'Quản lý thông tin cá nhân' : `Thông tin của ${userData.firstName}`}
                                </Text>
                            </View>
                            <View style={localStyles.headerIconContainer}>
                                <MaterialIcon name="account-circle" size={28} color="rgba(255,255,255,0.8)" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Profile Card */}
                <View style={localStyles.profileCard}>
                    {/* Avatar & Info */}
                    <View style={localStyles.avatarSection}>
                        <View style={localStyles.avatarWrapper}>
                            {finalAvatarUrl ? (
                                <Image source={{ uri: finalAvatarUrl }} style={localStyles.avatarImage} />
                            ) : (
                                <View style={localStyles.avatarPlaceholder}>
                                    <MaterialIcon name="account" size={40} color="#9CA3AF" />
                                </View>
                            )}
                            {isOwnProfile && (
                                <TouchableOpacity style={localStyles.editAvatarBadge} onPress={handleEditProfile}>
                                    <MaterialIcon name="camera" size={14} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={localStyles.profileInfo}>
                        <Text style={localStyles.profileName}>{fullName}</Text>
                        <Text style={localStyles.profileBio}>{bioDisplay}</Text>
                    </View>

                    {/* Stats Card */}
                    <View style={localStyles.statsCard}>
                        <TouchableOpacity
                            style={localStyles.statItem}
                            onPress={() => navigation.navigate('ListFollowScreen', { initialTab: 'Followers' })}
                        >
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="account-multiple" size={18} color={BRAND_COLOR} />
                            </View>
                            <Text style={localStyles.statValue}>{userData.followersCount}</Text>
                            <Text style={localStyles.statLabel}>Người theo dõi</Text>
                        </TouchableOpacity>

                        <View style={localStyles.statDivider} />

                        <TouchableOpacity
                            style={localStyles.statItem}
                            onPress={() => navigation.navigate('ListFollowScreen', { initialTab: 'Following' })}
                        >
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="account-heart" size={18} color={BRAND_COLOR} />
                            </View>
                            <Text style={localStyles.statValue}>{userData.followingCount}</Text>
                            <Text style={localStyles.statLabel}>Đang theo dõi</Text>
                        </TouchableOpacity>

                        <View style={localStyles.statDivider} />

                        <View style={localStyles.statItem}>
                            <View style={localStyles.statIconBg}>
                                <MaterialIcon name="star" size={18} color="#FFB800" />
                            </View>
                            <Text style={localStyles.statValue}>4.5</Text>
                            <Text style={localStyles.statLabel}>Đánh giá</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={localStyles.actionButtonsContainer}>
                        {isOwnProfile ? (
                            <>
                                <TouchableOpacity style={localStyles.editButton} onPress={handleEditProfile}>
                                    <MaterialIcon name="pencil" size={18} color="#FFFFFF" />
                                    <Text style={localStyles.editButtonText}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={localStyles.shareButton}>
                                    <MaterialIcon name="share-variant" size={18} color={BRAND_COLOR} />
                                    <Text style={localStyles.shareButtonText}>Chia sẻ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={localStyles.logoutButton} onPress={handleLogout}>
                                    <MaterialIcon name="logout" size={18} color="#FF5252" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[localStyles.editButton, isFollowing && { backgroundColor: '#E5E7EB' }]}
                                    onPress={handleFollowToggle}
                                    disabled={followLoading}
                                >
                                    {followLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <MaterialIcon
                                                name={isFollowing ? "account-check" : "account-plus"}
                                                size={18}
                                                color={isFollowing ? BRAND_COLOR : "#FFFFFF"}
                                            />
                                            <Text style={[localStyles.editButtonText, isFollowing && { color: BRAND_COLOR }]}>
                                                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={localStyles.shareButton}>
                                    <MaterialIcon name="share-variant" size={18} color={BRAND_COLOR} />
                                    <Text style={localStyles.shareButtonText}>Chia sẻ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={localStyles.reportButton} onPress={() => setReportVisible(true)}>
                                    <MaterialIcon name="flag" size={18} color="#F59E0B" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Content Section */}
                <View style={localStyles.contentSection}>
                    {/* Info Card */}
                    <View style={localStyles.infoCard}>
                        <View style={localStyles.cardHeader}>
                            <MaterialIcon name="information" size={22} color={BRAND_COLOR} />
                            <Text style={localStyles.cardTitle}>Thông tin cá nhân</Text>
                        </View>
                        <InfoRow iconName="calendar" label="Ngày sinh" value={birthDateDisplay} />
                        <InfoRow iconName="gender-male-female" label="Giới tính" value={getGenderDisplay(userData.gender)} />
                        <InfoRow iconName="email" label="Email" value={userData.email} isLink />
                        <InfoRow iconName="map-marker" label="Địa chỉ" value={addressDisplay} />
                    </View>

                    {/* Recipe Section */}
                    <View style={localStyles.recipeSection}>
                        <View style={localStyles.recipeSectionHeader}>
                            <View style={localStyles.recipeTitleContainer}>
                                <MaterialIcon name="book-open-variant" size={22} color={BRAND_COLOR} />
                                <Text style={localStyles.recipeSectionTitle}>
                                    {isOwnProfile ? 'Danh sách công thức' : 'Công thức của ' + userData.firstName}
                                </Text>
                                <View style={localStyles.recipeBadge}>
                                    <Text style={localStyles.recipeBadgeText}>{totalRecipes}</Text>
                                </View>
                            </View>
                        </View>

                        {isOwnProfile && (
                            <View style={localStyles.tabContainer}>
                                <TouchableOpacity
                                    style={[localStyles.tabButton, activeTab === 'my_recipes' && localStyles.activeTabButton]}
                                    onPress={() => handleTabChange('my_recipes')}
                                >
                                    <MaterialIcon name="chef-hat" size={18} color={activeTab === 'my_recipes' ? '#FFF' : '#6B7280'} style={{ marginRight: 6 }} />
                                    <Text style={[localStyles.tabText, activeTab === 'my_recipes' ? localStyles.activeTabText : localStyles.inactiveTabText]}>Của tôi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[localStyles.tabButton, activeTab === 'saved_recipes' && localStyles.activeTabButton]}
                                    onPress={() => handleTabChange('saved_recipes')}
                                >
                                    <MaterialIcon name="bookmark" size={18} color={activeTab === 'saved_recipes' ? '#FFF' : '#6B7280'} style={{ marginRight: 6 }} />
                                    <Text style={[localStyles.tabText, activeTab === 'saved_recipes' ? localStyles.activeTabText : localStyles.inactiveTabText]}>Đã lưu</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={localStyles.searchBarContainer}>
                            <Ionicons name="search" size={18} color="#9CA3AF" />
                            <TextInput
                                placeholder={isOwnProfile ? (activeTab === 'my_recipes' ? "Tìm của tôi..." : "Tìm đã lưu...") : "Tìm kiếm..."}
                                style={localStyles.searchInput}
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {isLoadingRecipes ? (
                            <ActivityIndicator size="small" color={BRAND_COLOR} style={{ marginVertical: 30 }} />
                        ) : recipes.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <MaterialIcon name="chef-hat" size={50} color="#E5E7EB" />
                                <Text style={localStyles.emptyStateTitle}>Không tìm thấy công thức</Text>
                            </View>
                        ) : (
                            <>
                                <View style={localStyles.recipesGrid}>
                                    {recipes.map((recipe) => (
                                        <RecipeCard
                                            key={recipe.id}
                                            imageUri={recipe.imageUrl || 'https://via.placeholder.com/150'}
                                            title={recipe.name || 'Không tiêu đề'}
                                            cookTime={recipe.cookTime || 0}
                                            ration={recipe.ration || 0}
                                            difficulty={'EASY'}
                                            isPrivate={false}
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

            {/* <ReportDialog
                visible={isReportVisible}
                reportedUser={fullName}
                onClose={() => setReportVisible(false)}
                onSubmit={handleSubmitReport}
            /> */}
        </View>
    );
};

export default ProfileScreen;