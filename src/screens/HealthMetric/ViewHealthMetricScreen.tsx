import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';
import { styles, BRAND_COLOR } from './ViewHealthMetricScreenStyles';
import HealthMetricService, { HealthMetric } from '../../services/HealthMetricService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HealthMetricStackParamList } from '../../navigation/HealthMetricStackNavigator';

type HealthMetricScreenNavigationProp = NativeStackNavigationProp<HealthMetricStackParamList, 'ViewHealthMetricMain'>;

const ViewHealthMetricScreen: React.FC = () => {
  const navigation = useNavigation<HealthMetricScreenNavigationProp>();
  
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [currentMetric, setCurrentMetric] = useState<HealthMetric | null>(null);
  const [historyMetrics, setHistoryMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchHealthMetrics = async () => {
    try {
      setIsLoading(true);
      const metrics = await HealthMetricService.getHealthMetrics();
      
      if (metrics.length > 0) {
        setCurrentMetric(metrics[0]);
        setHistoryMetrics(metrics.slice(1));
      } else {
        setCurrentMetric(null);
        setHistoryMetrics([]);
      }
    } catch (error: any) {
      // console.error('Error fetching health metrics:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sức khỏe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => navigation.goBack();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHealthMetrics();
    setIsRefreshing(false);
  };

  const handleDelete = async (metricId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bản ghi này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await HealthMetricService.deleteHealthMetric(metricId);
              Alert.alert('Thành công', 'Đã xóa bản ghi.');
              await fetchHealthMetrics();
            } catch (error: any) {
              // console.error('Error deleting metric:', error);
              Alert.alert('Lỗi', 'Không thể xóa bản ghi.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (metricId: string) => {
    navigation.navigate('EditHealthMetric', { metricId });
  };

  const handleCreateNew = () => {
    navigation.navigate('CreateHealthMetric');
  };

  useFocusEffect(
    useCallback(() => {
      fetchHealthMetrics();
    }, [])
  );

  const getBMICategory = (bmi: number): { label: string; color: string; bgColor: string } => {
    if (bmi < 18.5) return { label: 'Gầy', color: '#3B82F6', bgColor: '#EFF6FF' };
    if (bmi < 25) return { label: 'Bình thường', color: '#10B981', bgColor: '#ECFDF5' };
    if (bmi < 30) return { label: 'Thừa cân', color: '#F59E0B', bgColor: '#FFFBEB' };
    if (bmi < 35) return { label: 'Béo phì độ 1', color: '#EF4444', bgColor: '#FEF2F2' };
    if (bmi < 40) return { label: 'Béo phì độ 2', color: '#DC2626', bgColor: '#FEE2E2' };
    return { label: 'Béo phì độ 3', color: '#991B1B', bgColor: '#FEE2E2' };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderApp isHome={false} onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentMetric) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderApp isHome={false} onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <MaterialIcon name="clipboard-text-outline" size={80} color="#E5E7EB" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.emptySubtitle}>
            Hãy tạo bản ghi sức khỏe đầu tiên của bạn
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
            <MaterialIcon name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Tạo bản ghi mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bmiCategory = getBMICategory(currentMetric.bmi);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[BRAND_COLOR]} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Số Liệu Của Bạn</Text>
              </View>

              <TouchableOpacity style={styles.recordButton} onPress={handleCreateNew}>
                <View style={styles.iconCircle}>
                  <MaterialIcon name="plus" size={16} color={BRAND_COLOR} />
                </View>
                <Text style={styles.recordButtonText}>Ghi số liệu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <View style={styles.dateHeader}>
            <View style={styles.dateIconContainer}>
              <MaterialIcon name="calendar-month" size={22} color={BRAND_COLOR} />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formatDate(currentMetric.recordedAt)}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={styles.timeText}>{formatTime(currentMetric.recordedAt)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.dateActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleEdit(currentMetric.id)}
            >
              <MaterialIcon name="pencil" size={18} color={BRAND_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButtonDanger}
              onPress={() => handleDelete(currentMetric.id)}
            >
              <MaterialIcon name="delete-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BMI Highlight Card */}
        <View style={[styles.bmiHighlightCard, { backgroundColor: bmiCategory.bgColor, borderColor: bmiCategory.color }]}>
          <View style={styles.bmiContentRow}>
            <View style={styles.bmiHeader}>
              <View style={[styles.bmiIconContainer, { backgroundColor: bmiCategory.color }]}>
                <MaterialIcon name="heart-pulse" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.bmiInfo}>
                <Text style={styles.bmiLabel}>Chỉ Số BMI</Text>
                <Text style={styles.bmiDescription}>Đánh giá thể trạng</Text>
              </View>
            </View>
            <View style={styles.bmiRightSide}>
              <View style={styles.bmiValueContainer}>
                <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>
                  {currentMetric.bmi.toFixed(1)}
                </Text>
                <Text style={styles.bmiUnit}>kg/m²</Text>
              </View>
              <View style={[styles.bmiCategoryBadge, { backgroundColor: bmiCategory.color }]}>
                <Text style={styles.bmiCategoryText}>{bmiCategory.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metrics Container */}
        <View style={styles.metricsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcon name="clipboard-text-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>Thông Tin Cơ Thể</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconBg}>
                <MaterialIcon name="weight-kilogram" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.metricLabel}>CÂN NẶNG</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{currentMetric.weightKg}</Text>
                <Text style={styles.metricUnit}>kg</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconBg}>
                <MaterialIcon name="human-male-height" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.metricLabel}>CHIỀU CAO</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{currentMetric.heightCm}</Text>
                <Text style={styles.metricUnit}>cm</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconBg}>
                <MaterialIcon name="flash" size={24} color="#EF4444" />
              </View>
              <Text style={styles.metricLabel}>TỶ LỆ MỠ</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {currentMetric.bodyFatPercent ? currentMetric.bodyFatPercent.toFixed(1) : '--'}
                </Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconBg}>
                <MaterialIcon name="arm-flex" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.metricLabel}>KHỐI LƯỢNG CƠ</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {currentMetric.muscleMassKg ? currentMetric.muscleMassKg.toFixed(1) : '--'}
                </Text>
                <Text style={styles.metricUnit}>kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Energy Container */}
        <View style={styles.energyContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcon name="fire-circle" size={22} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Năng Lượng Tiêu Thụ</Text>
          </View>

          <View style={styles.bmrCardFull}>
            <View style={styles.bmrContent}>
              <View style={styles.bmrIconBox}>
                <MaterialIcon name="fire" size={26} color="#F59E0B" />
              </View>
              <View style={styles.bmrTextBox}>
                <Text style={styles.bmrLabelFull}>BMR</Text>
                <Text style={styles.bmrSubLabel}>Năng lượng tối thiểu</Text>
              </View>
              <View style={styles.bmrValueBox}>
                <Text style={styles.bmrValueFull}>{Math.round(currentMetric.bmr)}</Text>
                <Text style={styles.bmrUnitText}>kcal/ngày</Text>
              </View>
            </View>
          </View>

          <View style={styles.tdeeCard}>
            <View style={styles.tdeeHeader}>
              <View style={styles.tdeeIconContainer}>
                <MaterialIcon name="food-apple" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.tdeeInfo}>
                <Text style={styles.tdeeLabel}>TDEE</Text>
                <Text style={styles.tdeeSubLabel}>Calo giữ cân</Text>
              </View>
            </View>
            <View style={styles.tdeeValueContainer}>
              <Text style={styles.tdeeValue}>{Math.round(currentMetric.tdee)}</Text>
              <Text style={styles.tdeeUnit}>kcal/ngày</Text>
            </View>
          </View>
        </View>

        {/* Notes Card */}
        {currentMetric.notes && (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <MaterialIcon name="note-text-outline" size={20} color="#6B7280" />
              <Text style={styles.noteLabel}>GHI CHÚ</Text>
            </View>
            <Text style={styles.noteText}>{currentMetric.notes}</Text>
          </View>
        )}

        {/* History Header */}
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => setExpandedHistory(!expandedHistory)}
        >
          <View style={styles.historyTitleContainer}>
            <MaterialIcon name="history" size={22} color={BRAND_COLOR} />
            <Text style={styles.historyTitle}>Lịch Sử Cũ</Text>
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>{historyMetrics.length}</Text>
            </View>
          </View>
          <MaterialIcon
            name={expandedHistory ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* History Content */}
        {expandedHistory && (
          <View style={styles.historyContent}>
            {historyMetrics.length === 0 ? (
              <>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcon name="clipboard-list-outline" size={50} color="#E5E7EB" />
                </View>
                <Text style={styles.historyPlaceholder}>
                  Chưa có lịch sử cũ
                </Text>
              </>
            ) : (
              historyMetrics.map((metric) => {
                const bmiCat = getBMICategory(metric.bmi);
                return (
                  <View key={metric.id} style={styles.historyItem}>
                    {/* Header: Date & Time with Delete Button */}
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemDateContainer}>
                        <View style={styles.historyItemCalendarIcon}>
                          <MaterialIcon name="calendar" size={16} color={BRAND_COLOR} />
                        </View>
                        <View>
                          <Text style={styles.historyItemDate}>
                            {formatDate(metric.recordedAt)}
                          </Text>
                          <View style={styles.historyItemTimeRow}>
                            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                            <Text style={styles.historyItemTime}>
                              {formatTime(metric.recordedAt)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.historyDeleteButton}
                        onPress={() => handleDelete(metric.id)}
                      >
                        <MaterialIcon name="delete-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Body Metrics - Vertical Layout */}
                    {/* Row 1: Cân nặng & Chiều cao */}
                    <View style={styles.historyMetricsGrid}>
                      <View style={styles.historyMetricBox}>
                        <Text style={styles.historyMetricLabel}>CÂN NẶNG</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={styles.historyMetricValue}>{metric.weightKg}</Text>
                          <Text style={styles.historyMetricUnit}>kg</Text>
                        </View>
                      </View>

                      <View style={styles.historyMetricBox}>
                        <Text style={styles.historyMetricLabel}>CHIỀU CAO</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={styles.historyMetricValue}>{metric.heightCm}</Text>
                          <Text style={styles.historyMetricUnit}>cm</Text>
                        </View>
                      </View>
                    </View>

                    {/* Row 2: Tỷ lệ mỡ & Khối lượng cơ */}
                    <View style={styles.historyMetricsGrid}>
                      <View style={styles.historyMetricBox}>
                        <Text style={styles.historyMetricLabel}>TỶ LỆ MỠ</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={styles.historyMetricValue}>
                            {metric.bodyFatPercent ? metric.bodyFatPercent.toFixed(1) : '--'}
                          </Text>
                          <Text style={styles.historyMetricUnit}>%</Text>
                        </View>
                      </View>

                      <View style={styles.historyMetricBox}>
                        <Text style={styles.historyMetricLabel}>KHỐI LƯỢNG CƠ</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={styles.historyMetricValue}>
                            {metric.muscleMassKg ? metric.muscleMassKg.toFixed(1) : '--'}
                          </Text>
                          <Text style={styles.historyMetricUnit}>kg</Text>
                        </View>
                      </View>
                    </View>

                    {/* Row 3: BMI & BMR */}
                                        <View style={styles.historyMetricsGrid}>
                      <View style={[styles.historyMetricBox, styles.historyBMIBox]}>
                        <Text style={styles.historyMetricLabel}>BMI</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={[styles.historyMetricValue, { color: bmiCat.color }]}>
                            {metric.bmi.toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.historyMetricBox, styles.historyBMRBox]}>
                        <Text style={styles.historyMetricLabel}>BMR</Text>
                        <View style={styles.historyMetricValueRow}>
                          <Text style={[styles.historyMetricValue, { color: '#F59E0B' }]}>
                            {Math.round(metric.bmr)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* TDEE - Full Width */}
                    <View style={styles.historyTDEEBox}>
                      <View style={styles.historyTDEEContent}>
                        <View style={styles.historyTDEEIconBg}>
                          <MaterialIcon name="fire" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.historyTDEETextBox}>
                          <Text style={styles.historyTDEELabel}>CALO HÀNG NGÀY (TDEE)</Text>
                          <View style={styles.historyTDEEValueRow}>
                            <Text style={styles.historyTDEEValue}>{Math.round(metric.tdee)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Notes */}
                    {metric.notes && (
                      <View style={styles.historyNoteBox}>
                        <View style={styles.historyNoteHeader}>
                          <MaterialIcon name="note-text-outline" size={14} color="#6B7280" />
                          <Text style={styles.historyNoteLabel}>GHI CHÚ</Text>
                        </View>
                        <Text style={styles.historyNoteText}>{metric.notes}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewHealthMetricScreen;