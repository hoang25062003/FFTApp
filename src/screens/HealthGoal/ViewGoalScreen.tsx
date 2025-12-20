// FILE: src/screens/HealthGoal/ViewGoalScreen.tsx

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
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderApp from '../../components/HeaderApp';
import { styles, cardStyles, BRAND_COLOR } from './ViewGoalScreenStyles';

// Import type from DateTimePicker for TypeScript
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { 
  healthGoalService, 
  UserHealthGoalResponse,
  NutrientTarget,
} from '../../services/HealthGoalService';
import { HealthGoalStackParamList } from '../../navigation/HealthGoalStackNavigator';

type HealthGoalScreenNavigationProp = NativeStackNavigationProp<HealthGoalStackParamList, 'HealthGoalMain'>;

// ============================================================================
// COMPONENT: CARD THƯ VIỆN
// ============================================================================
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

    switch (weight) {
      case 1:
        return { bg: '#DBEAFE', text: '#1E40AF', label: 'Cốt lõi' };
      case 2:
        return { bg: '#F3E8FF', text: '#6B21A8', label: 'Trọng yếu' };
      case 3:
        return { bg: '#F1F5F9', text: '#475569', label: 'Cơ bản' };
      case 4:
        return { bg: '#FEF3C7', text: '#92400E', label: 'Chừng mực' };
      case 5:
        return { bg: '#DCFCE7', text: '#15803D', label: 'Linh hoạt' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: 'Khác' };
    }
  };

  const formatValue = (target: NutrientTarget) => {
    const isUsingEnergyPercent = target.minEnergyPct > 0 || target.maxEnergyPct > 0;
    
    if (isUsingEnergyPercent) {
      if (target.minEnergyPct === target.maxEnergyPct) {
        return `${target.minEnergyPct}%`;
      }
      return `${target.minEnergyPct}-${target.maxEnergyPct}%`;
    } else {
      if (target.minValue === target.maxValue) {
        return `${target.minValue} ${target.unit}`;
      }
      return `${target.minValue}-${target.maxValue} ${target.unit}`;
    }
  };

  const getTargetTypeLabel = (target: NutrientTarget): string => {
    const isUsingEnergyPercent = target.minEnergyPct > 0 || target.maxEnergyPct > 0;
    return isUsingEnergyPercent ? '% Năng Lượng' : 'Tuyệt Đối';
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
              const typeLabel = getTargetTypeLabel(item);
              
              return (
                <View key={index} style={cardStyles.nutrientItem}>
                  <View style={cardStyles.nutrientIconBg}>
                    <Icon name="pill" size={20} color={BRAND_COLOR} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={cardStyles.nutrientLabel}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={cardStyles.nutrientValue}>{formatValue(item)}</Text>
                      <View style={cardStyles.typeBadge}>
                        <Text style={cardStyles.typeText}>{typeLabel}</Text>
                      </View>
                    </View>
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

// ============================================================================
// COMPONENT: HISTORY CARD
// ============================================================================
const HistoryCard: React.FC<{
  goal: UserHealthGoalResponse;
}> = ({ goal }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const formatValue = (target: NutrientTarget) => {
    const isUsingEnergyPercent = target.minEnergyPct > 0 || target.maxEnergyPct > 0;
    
    if (isUsingEnergyPercent) {
      if (target.minEnergyPct === target.maxEnergyPct) {
        return `${target.minEnergyPct}%`;
      }
      return `${target.minEnergyPct}-${target.maxEnergyPct}%`;
    } else {
      if (target.minValue === target.maxValue) {
        return `${target.minValue} ${target.unit}`;
      }
      return `${target.minValue}-${target.maxValue} ${target.unit}`;
    }
  };

  const getPriorityConfig = (weight?: number) => {
    if (!weight) return { bg: '#F3F4F6', text: '#6B7280', label: 'N/A' };
    switch (weight) {
      case 1: return { bg: '#DBEAFE', text: '#1E40AF', label: 'Cốt lõi' };
      case 2: return { bg: '#F3E8FF', text: '#6B21A8', label: 'Trọng yếu' };
      case 3: return { bg: '#F1F5F9', text: '#475569', label: 'Cơ bản' };
      case 4: return { bg: '#FEF3C7', text: '#92400E', label: 'Chừng mực' };
      case 5: return { bg: '#DCFCE7', text: '#15803D', label: 'Linh hoạt' };
      default: return { bg: '#F3F4F6', text: '#6B7280', label: 'Khác' };
    }
  };

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.headerRow}>
        <View style={cardStyles.infoContainer}>
          <Text style={cardStyles.goalName}>{goal.name}</Text>
          {goal.description && <Text style={cardStyles.goalDesc}>{goal.description}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="calendar-start" size={14} color="#6B7280" />
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {formatDate(goal.startedAtUtc)}
              </Text>
            </View>
            <Icon name="arrow-right" size={12} color="#D1D5DB" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="calendar-end" size={14} color="#6B7280" />
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {formatDate(goal.expiredAtUtc)}
              </Text>
            </View>
          </View>
        </View>
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

      {expanded && (
        <View style={cardStyles.detailsContainer}>
          <View style={cardStyles.divider} />
          <View style={cardStyles.sectionHeader}>
            <Icon name="clipboard-list-outline" size={18} color={BRAND_COLOR} />
            <Text style={cardStyles.detailLabel}>CHỈ SỐ DINH DƯỠNG</Text>
          </View>
          <View style={cardStyles.nutrientList}>
            {goal.targets.map((item, index) => {
              const pConfig = getPriorityConfig(item.weight);
              
              return (
                <View key={index} style={cardStyles.nutrientItem}>
                  <View style={cardStyles.nutrientIconBg}>
                    <Icon name="pill" size={20} color={BRAND_COLOR} />
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
        </View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
const ViewGoalScreen: React.FC = () => {
  const navigation = useNavigation<HealthGoalScreenNavigationProp>();
  
  // --- States quản lý dữ liệu ---
  const [mainTab, setMainTab] = useState<'Goal' | 'History'>('Goal');
  const [activeTab, setActiveTab] = useState<'Personal' | 'Expert'>('Personal');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGoal, setCurrentGoal] = useState<UserHealthGoalResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allGoals, setAllGoals] = useState<UserHealthGoalResponse[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [historyGoals, setHistoryGoals] = useState<UserHealthGoalResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- States cho DatePicker ---
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [goalToActivate, setGoalToActivate] = useState<UserHealthGoalResponse | null>(null);

  // 1. Fetch current active goal
  const fetchCurrentGoal = async () => {
    try {
      setIsLoading(true);
      const goal = await healthGoalService.getCurrentActiveGoal();
      setCurrentGoal(goal);
    } catch (error: any) {
      // console.error('Error fetching current goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch library goals
  const fetchAllGoals = async () => {
    try {
      setIsLoadingLibrary(true);
      const goals = await healthGoalService.getListGoal();
      setAllGoals(goals);
    } catch (error: any) {
      // console.error('Error fetching goals:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách mục tiêu');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // 3. Fetch history goals
  const fetchHistoryGoals = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await healthGoalService.getHistory();
      setHistoryGoals(history);
    } catch (error: any) {
      // console.error('Error fetching history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử mục tiêu');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 4. Remove current goal
  const handleRemoveCurrentGoal = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy bỏ mục tiêu hiện tại?',
      [
        { text: 'Hủy', style: 'cancel' },
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
              // console.error('Error removing goal:', error);
              Alert.alert('Lỗi', error.message || 'Không thể hủy mục tiêu');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // 5. Delete custom goal
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
              fetchAllGoals();
            } catch (error: any) {
              // console.error('Error deleting goal:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa mục tiêu');
            }
          },
        },
      ]
    );
  };

  const handleSelectGoal = (goal: UserHealthGoalResponse) => {
    setGoalToActivate(goal);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); 
    setTempDate(tomorrow);
    setShowPicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;

    if (Platform.OS === 'android') {
      setShowPicker(false);
      handleConfirmActivation(currentDate);
    } else {
      setTempDate(currentDate);
    }
  };

  const handleConfirmActivation = async (date: Date) => {
    if (!goalToActivate) return;

    if (date.getTime() <= new Date().getTime()) {
      Alert.alert('Ngày không hợp lệ', 'Ngày hết hạn phải lớn hơn thời điểm hiện tại.');
      return;
    }

    const type = goalToActivate.customHealthGoalId ? 'CUSTOM' : 'SYSTEM';
    const goalId = goalToActivate.customHealthGoalId || goalToActivate.healthGoalId || '';
    const expiredAtUtc = date.toISOString();

    try {
      setIsLoading(true);
      await healthGoalService.setAsActiveGoal(goalId, type, expiredAtUtc);
      
      Alert.alert('Thành công', `Đã áp dụng mục tiêu "${goalToActivate.name}" đến ngày ${date.toLocaleDateString('vi-VN')}`);
      
      setGoalToActivate(null);
      fetchCurrentGoal();
    } catch (error: any) {
      // console.error('Error setting active goal:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật mục tiêu');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmIOSDate = () => {
    setShowPicker(false);
    handleConfirmActivation(tempDate);
  };

  const handleCreateNew = () => {
    navigation.navigate('HealthGoalCreate');
  };

  const handleEdit = (goalId: string) => {
    navigation.navigate('EditHealthGoal', { goalId });
  };

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
    if (mainTab === 'Goal') {
      await Promise.all([
        fetchCurrentGoal(),
        fetchAllGoals()
      ]);
    } else {
      await fetchHistoryGoals();
    }
    setIsRefreshing(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const formatNutrientValue = (target: NutrientTarget): string => {
    const isUsingEnergyPercent = target.minEnergyPct > 0 || target.maxEnergyPct > 0;
    
    if (isUsingEnergyPercent) {
      if (target.minEnergyPct === target.maxEnergyPct) {
        return `${target.minEnergyPct}%`;
      }
      return `${target.minEnergyPct}-${target.maxEnergyPct}%`;
    } else {
      if (target.minValue === target.maxValue) {
        return `${target.minValue} ${target.unit}`;
      }
      return `${target.minValue}-${target.maxValue} ${target.unit}`;
    }
  };

  const getFilteredGoals = (): UserHealthGoalResponse[] => {
    if (activeTab === 'Personal') {
      return allGoals.filter(goal => goal.customHealthGoalId);
    } else {
      return allGoals.filter(goal => goal.healthGoalId);
    }
  };

  const getNutrientIcon = (index: number): string => {
    return 'pill';
  };

  const getTargetTypeLabel = (target: NutrientTarget): string => {
    const isUsingEnergyPercent = target.minEnergyPct > 0 || target.maxEnergyPct > 0;
    return isUsingEnergyPercent ? '% Năng Lượng' : 'Tuyệt Đối';
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCurrentGoal();
      fetchAllGoals();
    }, [])
  );

  useEffect(() => {
    if (mainTab === 'History') {
      fetchHistoryGoals();
    }
  }, [mainTab]);

  const remainingDays = calculateRemainingDays(currentGoal?.expiredAtUtc);
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroSubtitle}>Quản lý dinh dưỡng</Text>
                <Text style={styles.heroTitle}>Mục Tiêu Của Bạn</Text>
              </View>
              <TouchableOpacity style={styles.createHeaderBtn} onPress={handleCreateNew}>
                <View style={styles.iconCircle}>
                  <Icon name="plus" size={16} color={BRAND_COLOR} />
                </View>
                <Text style={styles.createBtnText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Tab Switcher */}
        <View style={styles.mainTabCard}>
          <View style={styles.mainTabContainer}>
            <TouchableOpacity 
              style={[styles.mainTabItem, mainTab === 'Goal' && styles.activeMainTabItem]} 
              onPress={() => setMainTab('Goal')}
            >
              <Icon 
                name="target" 
                size={18} 
                color={mainTab === 'Goal' ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[styles.mainTabText, mainTab === 'Goal' && styles.activeMainTabText]}>
                Mục tiêu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mainTabItem, mainTab === 'History' && styles.activeMainTabItem]} 
              onPress={() => setMainTab('History')}
            >
              <Icon 
                name="history" 
                size={18} 
                color={mainTab === 'History' ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[styles.mainTabText, mainTab === 'History' && styles.activeMainTabText]}>
                Lịch sử
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {mainTab === 'Goal' ? (
          <>
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
                        {remainingDays <= 0 ? 'Hết hạn' : `${remainingDays} ngày`}
                      </Text>
                      <Text style={styles.validityDate}>
                        Hết hạn: {formatDate(currentGoal.expiredAtUtc)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Display ALL nutrients */}
                {currentGoal.targets && currentGoal.targets.length > 0 && (
                  <View style={styles.metricsSection}>
                    <View style={styles.sectionHeader}>
                      <Icon name="clipboard-list" size={18} color={BRAND_COLOR} />
                      <Text style={styles.sectionLabel}>CÁC CHỈ SỐ</Text>
                    </View>
                    {currentGoal.targets.map((target, index) => {
                      const typeLabel = getTargetTypeLabel(target);
                      return (
                        <View key={index} style={[styles.metricBox, index > 0 && { marginTop: 8 }]}>
                          <View style={styles.metricIconBg}>
                            <Icon name={getNutrientIcon(index)} size={22} color={BRAND_COLOR} />
                          </View>
                          <View style={{flex: 1}}>
                            <Text style={styles.metricName}>{target.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <Text style={styles.metricValue}>
                                {formatNutrientValue(target)}
                              </Text>
                              <View style={styles.metricTypeBadge}>
                                <Text style={styles.metricTypeText}>{typeLabel}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })}
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
                        onEdit={() => handleEdit(goalId)}
                        onDelete={() => handleDeleteCustomGoal(goalId)}
                        onSelect={() => handleSelectGoal(item)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </>
        ) : (
          // HISTORY TAB
          <View style={styles.historySection}>
            <View style={styles.libraryHeader}>
              <View style={styles.libraryTitleRow}>
                <Icon name="history" size={22} color={BRAND_COLOR} />
                <Text style={styles.libraryTitle}>Lịch sử mục tiêu</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{historyGoals.length}</Text>
                </View>
              </View>
            </View>

            {isLoadingHistory ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={BRAND_COLOR} />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải lịch sử...</Text>
              </View>
            ) : historyGoals.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Icon name="history" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12, fontWeight: '500' }}>
                  Chưa có lịch sử nào
                </Text>
                <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }}>
                  Các mục tiêu đã hoàn thành hoặc hết hạn sẽ hiển thị ở đây
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {historyGoals.map((goal) => (
                  <HistoryCard key={goal.id} goal={goal} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* DATE PICKER */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
          onChange={onDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: '#EF4444', fontSize: 16 }}>Hủy</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>Ngày hết hạn</Text>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: 16 }}>Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                onChange={onDateChange}
                textColor="black"
                locale="vi-VN"
              />
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
};

export default ViewGoalScreen;