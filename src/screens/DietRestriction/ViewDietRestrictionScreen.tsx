import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderApp from '../../components/HeaderApp';
import { styles } from './ViewDietRestrictionScreenStyles';

// --- IMPORT SERVICE ---
import DietRestrictionService, {
  UserDietRestrictionResponse,
  RestrictionType as ApiRestrictionType,
} from '../../services/DietRestrictionService';

// --- IMPORT TYPES ---
import { DietRestrictionStackParamList } from '../../navigation/NavigationTypes';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BRAND_COLOR = '#8BC34A';

// --- Types ---
type DietRestriction = UserDietRestrictionResponse;
type FilterType = 'ALL' | 'ALLERGY' | 'DISLIKE' | 'TEMPORARYAVOID';
type SortType = 'NAME_ASC' | 'NAME_DESC' | 'TYPE' | 'DATE';

// ✅ Type cho Navigation
type ViewDietRestrictionNavigationProp = NativeStackNavigationProp<
  DietRestrictionStackParamList,
  'ViewDietRestrictionMain'
>;

interface RestrictionStats {
  total: number;
  byType: {
    allergy: number;
    dislike: number;
    temporaryAvoid: number;
  };
}

// ✅ FIX: Tách SearchBar thành component riêng với React.memo
const SearchBar = memo(({ 
  searchQuery, 
  onSearchChange,
  onSubmit,
  onClear
}: { 
  searchQuery: string; 
  onSearchChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) => {
  return (
    <View style={styles.searchBar}>
      <Icon name="magnify" size={22} color="#9CA3AF" />
      <TextInput
        placeholder="Tìm kiếm nguyên liệu..."
        value={searchQuery}
        onChangeText={onSearchChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        blurOnSubmit={true}
        style={styles.searchInput}
        placeholderTextColor="#9CA3AF"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Icon name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';

const ViewDietRestrictionScreen: React.FC = () => {
  const navigation = useNavigation<ViewDietRestrictionNavigationProp>(); // ✅ Thêm type
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [data, setData] = useState<DietRestriction[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [sortType, setSortType] = useState<SortType>('NAME_ASC');
  
  const [stats, setStats] = useState<RestrictionStats>({
    total: 0,
    byType: { allergy: 0, dislike: 0, temporaryAvoid: 0 }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const animateLayout = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const getSafeTypeValue = useCallback((typeData: any): string => {
    if (!typeData) return '';
    if (typeof typeData === 'object' && typeData.value) {
      return typeData.value;
    }
    return String(typeData);
  }, []);

  const fetchData = useCallback(async (currentType: FilterType, currentKeyword: string) => {
    if (!isRefreshing) setIsLoading(true);
    
    try {
      const filterParams = {
          type: currentType === 'ALL' ? undefined : currentType,
          keyword: currentKeyword.trim() || undefined
      };

      const listData = await DietRestrictionService.getUserDietRestrictions(filterParams);
      setData(listData);

      const statsData = await DietRestrictionService.getRestrictionStats();
      setStats({
          total: statsData.total || 0,
          byType: {
              allergy: statsData.byType?.allergy || 0,
              dislike: statsData.byType?.dislike || 0,
              temporaryAvoid: statsData.byType?.temporaryAvoid || 0
          }
      });

    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [isRefreshing]);

  // ✅ Chỉ gọi API khi activeSearchQuery hoặc filterType thay đổi
  useEffect(() => {
    if (isFocused) {
      fetchData(filterType, activeSearchQuery);
    }
  }, [activeSearchQuery, filterType, isFocused, fetchData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(filterType, activeSearchQuery);
  }, [fetchData, filterType, activeSearchQuery]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa hạn chế này?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await DietRestrictionService.deleteRestriction(id);
              animateLayout();
              setData((prevData) => prevData.filter((item) => item.id !== id));
              
              const statsData = await DietRestrictionService.getRestrictionStats();
              setStats({
                  total: statsData.total || 0,
                  byType: {
                      allergy: statsData.byType?.allergy || 0,
                      dislike: statsData.byType?.dislike || 0,
                      temporaryAvoid: statsData.byType?.temporaryAvoid || 0
                  }
              });
            } catch (error) {
              console.error('Lỗi xóa:', error);
              Alert.alert('Lỗi', 'Không thể xóa mục này.');
            }
          },
        },
      ]);
    },
    [animateLayout]
  );

  // ✅ SỬA: Navigate với type-safe
  const handleAdd = useCallback(() => {
    navigation.navigate('CreateDietRestriction');
  }, [navigation]);

  const toggleSort = useCallback(() => {
    animateLayout();
    if (sortType === 'NAME_ASC') setSortType('DATE');
    else if (sortType === 'DATE') setSortType('TYPE');
    else setSortType('NAME_ASC');
  }, [sortType, animateLayout]);

  const getSortLabel = useMemo(() => {
    switch (sortType) {
      case 'NAME_ASC': return 'Tên A-Z';
      case 'NAME_DESC': return 'Tên Z-A';
      case 'TYPE': return 'Theo loại';
      case 'DATE': return 'Hết hạn';
      default: return '';
    }
  }, [sortType]);

  const getDisplayName = useCallback((item: DietRestriction): string => {
    return item.ingredientName || item.ingredientCategoryName || 'Không rõ tên';
  }, []);

  const getTypeConfig = useCallback((rawType: any) => {
    const typeString = getSafeTypeValue(rawType);
    const config = DietRestrictionService.getRestrictionTypeConfig(typeString);
    
    if (typeString === ApiRestrictionType.ALLERGY) {
        return { ...config, icon: 'alert-circle-outline', borderColor: '#FECACA' };
    }
    if (typeString === ApiRestrictionType.DISLIKE) {
        return { ...config, icon: 'thumb-down-outline', borderColor: '#FDE68A' };
    }
    if (typeString === ApiRestrictionType.TEMPORARYAVOID) {
        return { ...config, icon: 'clock-time-four-outline', borderColor: '#DDD6FE' };
    }
    return {
        label: typeString || 'Khác',
        icon: 'help-circle-outline',
        color: '#6B7280',
        bg: '#F3F4F6',
        borderColor: '#E5E7EB'
    };
  }, [getSafeTypeValue]);

  const formatExpiryDate = useCallback((dateString: string | undefined): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
    } catch {
      return null;
    }
  }, []);

  const sortedData = useMemo(() => {
    const dataToSort = [...data];

    dataToSort.sort((a, b) => {
      const typeA = getSafeTypeValue(a.type);
      const typeB = getSafeTypeValue(b.type);

      switch (sortType) {
        case 'NAME_ASC':
          return getDisplayName(a).localeCompare(getDisplayName(b), 'vi');
        case 'NAME_DESC':
          return getDisplayName(b).localeCompare(getDisplayName(a), 'vi');
        case 'TYPE':
          return typeA.localeCompare(typeB);
        case 'DATE':
          if (!a.expiredAtUtc && !b.expiredAtUtc) return 0;
          if (!a.expiredAtUtc) return 1;
          if (!b.expiredAtUtc) return -1;
          return (
            new Date(a.expiredAtUtc!).getTime() -
            new Date(b.expiredAtUtc!).getTime()
          );
        default:
          return 0;
      }
    });

    return dataToSort;
  }, [data, sortType, getDisplayName, getSafeTypeValue]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setActiveSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
  }, []);

  const FilterPill = useCallback(({ type, label }: { type: FilterType; label: string }) => {
    const isActive = filterType === type;
    return (
      <TouchableOpacity
        style={[styles.pill, isActive && styles.pillActive]}
        onPress={() => {
          setFilterType(type);
        }}
      >
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }, [filterType]);

  const renderItem = useCallback(({ item }: { item: DietRestriction }) => {
    const typeConfig = getTypeConfig(item.type);
    const isIngredient = !!item.ingredientName;
    const displayName = getDisplayName(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isIngredient ? '#E0F2F1' : '#FFF3E0' },
            ]}
          >
            <Icon
              name={isIngredient ? 'food-apple-outline' : 'food-variant'}
              size={24}
              color={isIngredient ? '#009688' : '#FF9800'}
            />
          </View>

          <View style={styles.cardHeaderTextContainer}>
            <Text style={styles.itemName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.itemSubtype}>
              {isIngredient ? 'Nguyên liệu đơn' : 'Nhóm thực phẩm'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          <View
            style={[
              styles.tag,
              { backgroundColor: typeConfig.bg, borderColor: typeConfig.borderColor },
            ]}
          >
            <Icon name={typeConfig.icon} size={14} color={typeConfig.color} />
            <Text style={[styles.tagText, { color: typeConfig.color }]}>
              {typeConfig.label} 
            </Text>
          </View>

          {item.expiredAtUtc && (
            <View style={[styles.tag, styles.expiryTag]}>
              <Icon name="calendar-clock" size={14} color="#555" />
              <Text style={styles.expiryTagText}>
                {formatExpiryDate(item.expiredAtUtc)}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText} numberOfLines={2}>
              <Text style={{ fontWeight: '600' }}>Ghi chú: </Text>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    );
  }, [getTypeConfig, getDisplayName, formatExpiryDate, handleDelete]);

  // ✅ ListHeaderComponent với useMemo
  const listHeader = useMemo(() => (
    <>
      <View style={styles.headerSection}>
        <View style={styles.headerBackground}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Hạn Chế Ăn Uống</Text>
            </View>
            <TouchableOpacity style={styles.recordButton} onPress={handleAdd}>
              <View style={styles.iconCircle}>
                <Icon name="plus" size={16} color={BRAND_COLOR} />
              </View>
              <Text style={styles.recordButtonText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="format-list-checks" size={20} color={BRAND_COLOR} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.statValue}>{stats.byType.allergy}</Text>
            <Text style={styles.statLabel}>Dị ứng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="thumb-down" size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.byType.dislike}</Text>
            <Text style={styles.statLabel}>Không thích</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.sectionHeader}>
          <Icon name="filter-variant" size={22} color={BRAND_COLOR} />
          <Text style={styles.sectionTitle}>Tìm kiếm & Lọc</Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
            <Icon name="sort" size={18} color={BRAND_COLOR} />
            <Text style={styles.sortButtonText}>{getSortLabel}</Text>
          </TouchableOpacity>
        </View>

        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
        />

        <View style={styles.pillsContainer}>
          <FilterPill type="ALL" label="Tất cả" />
          <FilterPill type="ALLERGY" label="Dị ứng" />
          <FilterPill type="DISLIKE" label="Không thích" />
          <FilterPill type="TEMPORARYAVOID" label="Tạm tránh" />
        </View>
      </View>

      <View style={styles.listHeader}>
        <Icon name="clipboard-list" size={22} color={BRAND_COLOR} />
        <Text style={styles.listTitle}>Danh Sách Hạn Chế</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{sortedData.length}</Text>
        </View>
      </View>
    </>
  ), [stats, toggleSort, getSortLabel, sortedData.length, handleAdd, searchQuery, handleSearchChange, handleSearchSubmit, handleClearSearch, FilterPill]);

  const emptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Icon name="food-off-outline" size={60} color="#CFD8DC" />
      </View>
      <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
      <Text style={styles.emptyText}>
        {activeSearchQuery
          ? `Không tìm thấy món nào có tên "${activeSearchQuery}"`
          : filterType !== 'ALL' 
            ? 'Chưa có hạn chế nào thuộc loại này.'
            : 'Chưa có hạn chế nào được thêm.'}
      </Text>
    </View>
  ), [activeSearchQuery, filterType]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      {isLoading && !isRefreshing ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={{marginTop: 10, color: '#666'}}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[BRAND_COLOR]}
            />
          }
          ListHeaderComponent={listHeader}
          renderItem={renderItem}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

export default ViewDietRestrictionScreen;