import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, Image, 
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import profileService, { UserFollowerDto } from '../../services/ProfileService';

const BRAND_COLOR = '#8BC34A';

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
  const [userList, setUserList] = useState<UserFollowerDto[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let result: UserFollowerDto[] = [];

      if (activeTab === 'Followers') {
        result = await profileService.getFollowers();
      } else {
        result = await profileService.getFollowing();
      }

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

      setUserList(prev =>
        prev.map(u => 
          u.id === userId ? { ...u, isFollowing: !currentlyFollowing } : u
        )
      );
    } catch (error: any) {
      console.log("❌ Follow error:", error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
    } finally {
      setProcessingId(null);
    }
  };

  const renderUserItem = ({ item }: { item: UserFollowerDto }) => {
    const displayName = item.fullName || `${item.firstName} ${item.lastName}`.trim();
    
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
    <SafeAreaView style={followStyles.container}>
      {/* Header Section */}
      <View style={followStyles.headerSection}>
        <View style={followStyles.headerBackground}>
          <View style={followStyles.decorativeCircle1} />
          <View style={followStyles.decorativeCircle2} />
          
          <View style={followStyles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={followStyles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={followStyles.headerTitleContainer}>
              <Text style={followStyles.headerSubtitle}>Kết nối</Text>
              <Text style={followStyles.headerTitle}>
                {activeTab === 'Followers' ? 'Người theo dõi' : 'Đang theo dõi'}
              </Text>
            </View>

            <View style={{ width: 40 }} />
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
    </SafeAreaView>
  );
};

const followStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },

  // Header Styles
  headerSection: {
    marginBottom: 20,
  },
  headerBackground: {
    height: 140,
    backgroundColor: BRAND_COLOR,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -20,
    left: -20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  // Tab Styles
  tabCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: BRAND_COLOR,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // User Card Styles
  listContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    minWidth: 120,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BRAND_COLOR,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  followingButtonText: {
    color: BRAND_COLOR,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ListFollowScreen;