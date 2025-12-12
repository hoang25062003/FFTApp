import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, Image, 
  SafeAreaView, ActivityIndicator, Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderApp from '../../components/HeaderApp';
import profileService from '../../services/ProfileService';
import { followStyles, BRAND_COLOR } from './ListFollowScreenStyles';

// Extend UserFollowerDto to include isFollowing
interface UserFollowerDtoWithFollow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  avatarUrl?: string | null;
  fullName?: string;
  isFollowing: boolean;
}

type TabType = 'Followers' | 'Following';

interface ListFollowScreenProps {
  route: {
    params?: {
      initialTab?: TabType;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const ListFollowScreen: React.FC<ListFollowScreenProps> = ({ route, navigation }) => {
  const initialTab: TabType = route.params?.initialTab ?? 'Followers';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState<UserFollowerDtoWithFollow[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let result: UserFollowerDtoWithFollow[] = [];

      if (activeTab === 'Followers') {
        const followersData = await profileService.getFollowers();
        console.log("📋 Followers raw data:", followersData);
        
        // Fetch PublicProfile cho từng user để lấy isFollowing
        const followersWithStatus = await Promise.all(
          followersData.map(async (user) => {
            try {
              const profile = await profileService.getUserProfileByUsername(user.userName);
              return {
                ...user,
                isFollowing: profile.isFollowing
              };
            } catch (error) {
              console.log(`❌ Error fetching profile for ${user.userName}:`, error);
              return {
                ...user,
                isFollowing: false // Fallback nếu không fetch được
              };
            }
          })
        );
        
        result = followersWithStatus;
      } else {
        const followingData = await profileService.getFollowing();
        console.log("📋 Following raw data:", followingData);
        
        // Tất cả users trong "Following" đều là người mình đang follow
        result = followingData.map(user => ({
          ...user,
          isFollowing: true
        }));
      }

      console.log("✅ Final processed data:", result);
      setUserList(result);
    } catch (error: any) {
      console.log("❌ Fetch list error:", error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const toggleFollow = async (userId: string, currentlyFollowing: boolean) => {
    try {
      setProcessingId(userId);

      if (currentlyFollowing) {
        await profileService.unfollowUser(userId);
      } else {
        await profileService.followUser(userId);
      }

      // Cập nhật state local
      setUserList(prev =>
        prev.map(u => 
          u.id === userId ? { ...u, isFollowing: !currentlyFollowing } : u
        )
      );

      // Nếu đang ở tab "Following" và unfollow, xóa user khỏi danh sách
      if (activeTab === 'Following' && currentlyFollowing) {
        setUserList(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error: any) {
      console.log("❌ Follow error:", error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBackPress = () => navigation.goBack();

  const renderUserItem = ({ item }: { item: UserFollowerDtoWithFollow }) => {
    const displayName = item.fullName || `${item.firstName} ${item.lastName}`.trim();
    
    console.log(`👤 Rendering user: ${displayName}, isFollowing: ${item.isFollowing}`);
    
    return (
      <View style={followStyles.userCard}>
        <TouchableOpacity
          style={followStyles.userInfo}
          onPress={() => {
            navigation.navigate('ProfileScreen', { username: item.userName });
          }}
        >
          <View style={followStyles.avatarContainer}>
            <Image 
              source={{ 
                uri: item.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName)
              }}
              style={followStyles.avatar} 
            />
          </View>
          <View style={followStyles.userTextContainer}>
            <Text style={followStyles.userName}>{displayName}</Text>
            <Text style={followStyles.userHandle}>@{item.userName}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={processingId === item.id}
          onPress={() => toggleFollow(item.id, item.isFollowing)}
          style={[
            followStyles.followButton,
            item.isFollowing && followStyles.followingButton,
            processingId === item.id && { opacity: 0.5 }
          ]}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color={item.isFollowing ? BRAND_COLOR : '#FFFFFF'} />
          ) : (
            <>
              <Icon 
                name={item.isFollowing ? 'check' : 'plus'} 
                size={16} 
                color={item.isFollowing ? BRAND_COLOR : '#FFFFFF'} 
              />
              <Text style={[
                followStyles.followButtonText,
                item.isFollowing && followStyles.followingButtonText
              ]}>
                {item.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={followStyles.emptyContainer}>
      <View style={followStyles.emptyIconWrapper}>
        <Icon 
          name={activeTab === 'Followers' ? 'account-group-outline' : 'account-plus-outline'} 
          size={64} 
          color="#D1D5DB" 
        />
      </View>
      <Text style={followStyles.emptyTitle}>
        {activeTab === 'Followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
      </Text>
      <Text style={followStyles.emptySubtitle}>
        {activeTab === 'Followers' 
          ? 'Hãy chia sẻ nội dung thú vị để thu hút người theo dõi' 
          : 'Khám phá và kết nối với những người dùng khác'}
      </Text>
    </View>
  );

  return (
    <View style={followStyles.container}>
      {/* Header App */}
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      {/* Header Section */}
      <View style={followStyles.headerSection}>
        <View style={followStyles.headerBackground}>
          <View style={followStyles.decorativeCircle1} />
          <View style={followStyles.decorativeCircle2} />
          
          <View style={followStyles.headerContent}>
            <View style={followStyles.headerTitleContainer}>
              <Text style={followStyles.headerSubtitle}>Kết nối</Text>
              <Text style={followStyles.headerTitle}>
                {activeTab === 'Followers' ? 'Người theo dõi' : 'Đang theo dõi'}
              </Text>
            </View>
            <View style={followStyles.headerIconContainer}>
              <Icon 
                name={activeTab === 'Followers' ? 'account-group' : 'account-heart'} 
                size={28} 
                color="rgba(255,255,255,0.8)" 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Tab Section */}
      <View style={followStyles.tabCard}>
        <View style={followStyles.tabContainer}>
          <TouchableOpacity
            style={[followStyles.tabItem, activeTab === 'Followers' && followStyles.tabItemActive]}
            onPress={() => setActiveTab('Followers')}
          >
            <Icon 
              name="account-group" 
              size={18} 
              color={activeTab === 'Followers' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[followStyles.tabText, activeTab === 'Followers' && followStyles.tabTextActive]}>
              Người theo dõi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[followStyles.tabItem, activeTab === 'Following' && followStyles.tabItemActive]}
            onPress={() => setActiveTab('Following')}
          >
            <Icon 
              name="account-heart" 
              size={18} 
              color={activeTab === 'Following' ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[followStyles.tabText, activeTab === 'Following' && followStyles.tabTextActive]}>
              Đang theo dõi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User List */}
      {loading ? (
        <View style={followStyles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={followStyles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={userList}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={followStyles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh}
              colors={[BRAND_COLOR]}
              tintColor={BRAND_COLOR}
            />
          }
        />
      )}
    </View>
  );
};

export default ListFollowScreen;