import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderApp from '../../components/HeaderApp';
import { styles, cardStyles, BRAND_COLOR } from './ViewGoalScreenStyles';
import { 
  healthGoalService, 
  UserHealthGoalResponse,
  NutrientTarget,
} from '../../services/HealthGoalService';

// --- Component Card Thư Viện ---
const HealthGoalCard: React.FC<{
  id: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
  isCustom: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}> = ({ 
  id,
  name, 
  description, 
  targets,
  isCustom,
  onEdit,
  onDelete,
  onSelect
}) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityConfig = (weight?: number) => {
    if (!weight) return { bg: '#F3F4F6', text: '#6B7280', label: 'N/A' };
    if (weight >= 0.7) return { bg: '#FEE2E2', text: '#EF4444', label: 'Cao' };
    if (weight >= 0.4) return { bg: '#FEF9C3', text: '#F59E0B', label: 'TB' };
    return { bg: '#ECFDF5', text: '#10B981', label: 'Thấp' };
  };

  const formatValue = (target: NutrientTarget) => {
    if (target.minValue === target.maxValue) {
      return `${target.minValue}${target.targetType || ''}`;
    }
    return `${target.minValue}-${target.maxValue}${target.targetType || ''}`;
  };

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.headerRow}>
        <View style={cardStyles.infoContainer}>
          <Text style={cardStyles.goalName}>{name}</Text>
          {description && <Text style={cardStyles.goalDesc}>{description}</Text>}
        </View>
        <View style={cardStyles.actions}>
          {isCustom && (
            <>
              <TouchableOpacity style={cardStyles.iconButton} onPress={onEdit}>
                <Icon name="pencil" size={16} color={BRAND_COLOR} />
              </TouchableOpacity>
              <TouchableOpacity style={cardStyles.iconButtonDanger} onPress={onDelete}>
                <Icon name="delete-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            onPress={() => setExpanded(!expanded)} 
            style={cardStyles.expandBtn}
          >
            <Icon 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={cardStyles.detailsContainer}>
          <View style={cardStyles.divider} />
          <View style={cardStyles.sectionHeader}>
            <Icon name="clipboard-list-outline" size={18} color={BRAND_COLOR} />
            <Text style={cardStyles.detailLabel}>CHỈ SỐ DINH DƯỠNG</Text>
          </View>
          <View style={cardStyles.nutrientList}>
            {targets.map((item, index) => {
              const pConfig = getPriorityConfig(item.weight);
              return (
                <View key={index} style={cardStyles.nutrientItem}>
                  <View style={cardStyles.nutrientIconBg}>
                    <Icon name="food-apple" size={20} color={BRAND_COLOR} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={cardStyles.nutrientLabel}>{item.name}</Text>
                    <Text style={cardStyles.nutrientValue}>{formatValue(item)}</Text>
                  </View>
                  <View style={[cardStyles.priorityBadge, { backgroundColor: pConfig.bg }]}>
                    <Text style={[cardStyles.priorityText, { color: pConfig.text }]}>
                      {pConfig.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={{
              backgroundColor: BRAND_COLOR,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={onSelect}
          >
            <Icon name="check-circle" size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
              Chọn mục tiêu này
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const ViewGoalScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Personal' | 'Expert'>('Personal');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGoal, setCurrentGoal] = useState<UserHealthGoalResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unified goals list from getListGoal API
  const [allGoals, setAllGoals] = useState<UserHealthGoalResponse[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Fetch current active goal
  const fetchCurrentGoal = async () => {
    try {
      setIsLoading(true);
      const goal = await healthGoalService.getCurrentActiveGoal();
      setCurrentGoal(goal);
    } catch (error: any) {
      console.error('Error fetching current goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all goals (custom + system) using getListGoal
  const fetchAllGoals = async () => {
    try {
      setIsLoadingLibrary(true);
      const goals = await healthGoalService.getListGoal();
      setAllGoals(goals);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách mục tiêu');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Remove current active goal
  const handleRemoveCurrentGoal = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy bỏ mục tiêu hiện tại?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await healthGoalService.removeCurrentActiveGoal();
              setCurrentGoal(null);
              Alert.alert('Thành công', 'Đã hủy mục tiêu hiện tại');
            } catch (error: any) {
              console.error('Error removing goal:', error);
              Alert.alert('Lỗi', error.message || 'Không thể hủy mục tiêu');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Delete custom goal
  const handleDeleteCustomGoal = async (goalId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa mục tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await healthGoalService.deleteCustom(goalId);
              Alert.alert('Thành công', 'Đã xóa mục tiêu');
              fetchAllGoals(); // Refresh the list
            } catch (error: any) {
              console.error('Error deleting goal:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa mục tiêu');
            }
          },
        },
      ]
    );
  };

  // Select goal as active
  const handleSelectGoal = async (goal: UserHealthGoalResponse) => {
    // Determine if it's a custom or system goal
    const type = goal.customHealthGoalId ? 'CUSTOM' : 'SYSTEM';
    const goalId = goal.customHealthGoalId || goal.healthGoalId || '';

    Alert.alert(
      'Chọn mục tiêu',
      'Bạn có muốn đặt mục tiêu này làm mục tiêu hiện tại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chọn',
          onPress: async () => {
            try {
              await healthGoalService.setAsActiveGoal(goalId, type);
              Alert.alert('Thành công', 'Đã cập nhật mục tiêu hiện tại');
              fetchCurrentGoal();
            } catch (error: any) {
              console.error('Error setting active goal:', error);
              Alert.alert('Lỗi', error.message || 'Không thể cập nhật mục tiêu');
            }
          },
        },
      ]
    );
  };

  // Calculate remaining days
  const calculateRemainingDays = (expiredAtUtc?: string): number | null => {
    if (!expiredAtUtc) return null;
    const now = new Date();
    const expireDate = new Date(expiredAtUtc);
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchCurrentGoal(),
      fetchAllGoals()
    ]);
    setIsRefreshing(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  // Format nutrient value for display
  const formatNutrientValue = (target: NutrientTarget): string => {
    if (target.minValue === target.maxValue) {
      return `${target.minValue}`;
    }
    return `${target.minValue}-${target.maxValue}`;
  };

  // Get primary nutrient (first one with highest weight)
  const getPrimaryNutrient = (targets: NutrientTarget[]): NutrientTarget | null => {
    if (!targets || targets.length === 0) return null;
    const sorted = [...targets].sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return sorted[0];
  };

  // Filter goals based on active tab
  const getFilteredGoals = (): UserHealthGoalResponse[] => {
    if (activeTab === 'Personal') {
      // Custom goals have customHealthGoalId
      return allGoals.filter(goal => goal.customHealthGoalId);
    } else {
      // System goals have healthGoalId
      return allGoals.filter(goal => goal.healthGoalId);
    }
  };

  useEffect(() => {
    fetchCurrentGoal();
    fetchAllGoals();
  }, []);

  const remainingDays = calculateRemainingDays(currentGoal?.expiredAtUtc);
  const primaryNutrient = currentGoal ? getPrimaryNutrient(currentGoal.targets) : null;
  const currentLibrary = getFilteredGoals();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <HeaderApp isHome={false} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={[BRAND_COLOR]}
            tintColor={BRAND_COLOR}
          />
        }
      >
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroSubtitle}>Quản lý dinh dưỡng</Text>
                <Text style={styles.heroTitle}>Mục Tiêu Của Bạn</Text>
              </View>
              <TouchableOpacity style={styles.createHeaderBtn}>
                <View style={styles.iconCircle}>
                  <Icon name="plus" size={16} color={BRAND_COLOR} />
                </View>
                <Text style={styles.createBtnText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Current Goal Section */}
        {isLoading ? (
          <View style={[styles.currentGoalCard, { alignItems: 'center', justifyContent: 'center', minHeight: 200 }]}>
            <ActivityIndicator size="large" color={BRAND_COLOR} />
            <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải...</Text>
          </View>
        ) : currentGoal ? (
          <View style={styles.currentGoalCard}>
            <View style={styles.cardHeader}>
              <View style={styles.statusRow}>
                <View style={styles.statusIconContainer}>
                  <Icon name="check-circle" size={20} color={BRAND_COLOR} />
                </View>
                <View>
                  <Text style={styles.statusLabel}>MỤC TIÊU HIỆN TẠI</Text>
                  <Text style={styles.goalTitle}>{currentGoal.name}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteIconButton}
                onPress={handleRemoveCurrentGoal}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Icon name="close-circle-outline" size={22} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>

            {currentGoal.description && (
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 12 }}>
                {currentGoal.description}
              </Text>
            )}

            {remainingDays !== null && (
              <View style={styles.validityBanner}>
                <View style={styles.validityHeader}>
                  <Icon name="calendar-clock" size={20} color={BRAND_COLOR} />
                  <Text style={styles.validityLabel}>Thời hạn còn lại</Text>
                </View>
                <View style={styles.validityContent}>
                  <Text style={styles.validityValue}>
                    {remainingDays === 0 ? 'Hết hạn' : `${remainingDays} ngày`}
                  </Text>
                  <Text style={styles.validityDate}>
                    Hết hạn: {formatDate(currentGoal.expiredAtUtc)}
                  </Text>
                </View>
              </View>
            )}

            {primaryNutrient && (
              <View style={styles.metricsSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="chart-line" size={18} color={BRAND_COLOR} />
                  <Text style={styles.sectionLabel}>CHỈ SỐ CHÍNH</Text>
                </View>
                <View style={styles.metricBox}>
                  <View style={styles.metricIconBg}>
                    <Icon name="water" size={22} color="#3B82F6" />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.metricName}>{primaryNutrient.name}</Text>
                    <Text style={styles.metricValue}>
                      {formatNutrientValue(primaryNutrient)}
                      {primaryNutrient.targetType || ''}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.currentGoalCard, { alignItems: 'center', paddingVertical: 40 }]}>
            <Icon name="target-variant" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12, fontWeight: '500' }}>
              Chưa có mục tiêu nào
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
              Chọn hoặc tạo mục tiêu mới để bắt đầu
            </Text>
          </View>
        )}

        <View style={styles.librarySection}>
          <View style={styles.libraryHeader}>
            <View style={styles.libraryTitleRow}>
              <Icon name="library-shelves" size={22} color={BRAND_COLOR} />
              <Text style={styles.libraryTitle}>Thư viện mục tiêu</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentLibrary.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabCard}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabItem, activeTab === 'Personal' && styles.activeTabItem]} 
                onPress={() => setActiveTab('Personal')}
              >
                <Icon 
                  name="account" 
                  size={18} 
                  color={activeTab === 'Personal' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[styles.tabText, activeTab === 'Personal' && styles.activeTabText]}>
                  Cá nhân
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabItem, activeTab === 'Expert' && styles.activeTabItem]} 
                onPress={() => setActiveTab('Expert')}
              >
                <Icon 
                  name="doctor" 
                  size={18} 
                  color={activeTab === 'Expert' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[styles.tabText, activeTab === 'Expert' && styles.activeTabText]}>
                  Chuyên gia
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Library content */}
          {isLoadingLibrary ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={BRAND_COLOR} />
              <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải...</Text>
            </View>
          ) : currentLibrary.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Icon name="folder-open-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12, fontWeight: '500' }}>
                Chưa có mục tiêu nào
              </Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
                {activeTab === 'Personal' 
                  ? 'Tạo mục tiêu cá nhân của bạn' 
                  : 'Chưa có mục tiêu chuyên gia nào'}
              </Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {currentLibrary.map((item) => {
                const isCustomGoal = !!item.customHealthGoalId;
                const goalId = item.customHealthGoalId || item.healthGoalId || item.id;
                
                return (
                  <HealthGoalCard 
                    key={item.id} 
                    id={goalId}
                    name={item.name}
                    description={item.description}
                    targets={item.targets}
                    isCustom={isCustomGoal}
                    onEdit={() => console.log('Edit', goalId)}
                    onDelete={() => handleDeleteCustomGoal(goalId)}
                    onSelect={() => handleSelectGoal(item)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewGoalScreen;