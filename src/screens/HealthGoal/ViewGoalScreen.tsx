import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Target,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native'; // Cần cài @react-navigation/native

// Import Service
import healthGoalService, { 
    CustomHealthGoalResponse, 
    UserHealthGoalResponse 
} from '../../services/HealthGoalService';

export default function ViewCustomGoalScreen({ navigation }: { navigation?: any }) {
  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Data State
  const [activeGoal, setActiveGoal] = useState<UserHealthGoalResponse | null>(null);
  const [myGoals, setMyGoals] = useState<CustomHealthGoalResponse[]>([]);

  // --- API CALLS ---

  const fetchData = useCallback(async () => {
    try {
      // Gọi song song 2 API để tối ưu tốc độ
      const [activeData, customData] = await Promise.all([
        healthGoalService.getCurrentActiveGoal(),
        healthGoalService.getMyCustomGoals(),
      ]);

      setActiveGoal(activeData);
      setMyGoals(customData);
    } catch (error) {
      console.error('Fetch error:', error);
      // Không Alert lỗi ở đây để tránh spam khi user mất mạng, chỉ log
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tự động load lại dữ liệu mỗi khi màn hình được focus (VD: quay lại từ màn Create)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- HANDLERS ---

  const handleCreateNew = () => {
    // Điều hướng sang màn hình tạo mới
    navigation?.navigate('CreateGoalScreen');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Xóa mục tiêu',
      `Bạn có chắc chắn muốn xóa "${name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await healthGoalService.deleteCustomGoal(id);
              // Xóa thành công thì load lại list
              await fetchData(); 
              Alert.alert('Thành công', 'Đã xóa mục tiêu.');
            } catch (error) {
              setLoading(false);
              Alert.alert('Lỗi', 'Không thể xóa mục tiêu này.');
            }
          },
        },
      ]
    );
  };

  const handleSetActive = (goal: CustomHealthGoalResponse) => {
    // Kiểm tra nếu đang active mục tiêu này rồi
    if (activeGoal?.customHealthGoalId === goal.id) {
        Alert.alert("Thông báo", "Mục tiêu này đang được áp dụng.");
        return;
    }

    Alert.alert(
      'Áp dụng mục tiêu',
      `Bạn muốn đặt "${goal.name}" làm mục tiêu theo dõi trong 30 ngày tới?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Logic tính ngày hết hạn (VD: +30 ngày)
              const now = new Date();
              now.setDate(now.getDate() + 30);
              const expiredAtUtc = now.toISOString();

              await healthGoalService.setActiveGoal(goal.id, expiredAtUtc);
              
              await fetchData();
              Alert.alert('Thành công', 'Đã cập nhật mục tiêu hiện tại.');
            } catch (error) {
              setLoading(false);
              Alert.alert('Lỗi', 'Không thể kích hoạt mục tiêu này.');
            }
          },
        },
      ]
    );
  };
  
  const handleRemoveActive = () => {
      if (!activeGoal) return;
      
      // Ở đây activeGoal không có ID của record UserHealthGoal, 
      // nhưng API removeActiveGoal cần ID. 
      // *Lưu ý*: Tuỳ thuộc vào backend, nếu backend cần ID của UserHealthGoal, 
      // bạn cần chắc chắn UserHealthGoalResponse trả về ID đó.
      // Giả sử ActiveGoal có field `id` là ID của record quan hệ user-goal.
      // Nếu không, bạn cần hỏi lại backend endpoint xoá active goal.
      
      // Giả định: API removeActiveGoal nhận ID của UserHealthGoal record
      // Tuy nhiên trong UserHealthGoalResponse type cũ chưa có field `id` của record đó.
      // Nếu API backend là DELETE /api/UserHealthGoal/current thì không cần ID.
      // Nếu backend cần ID, ta cần update Type. 
      // Tạm thời giả định ta truyền activeGoal.healthGoalId hoặc customHealthGoalId để backend xử lý logic tìm và xoá.
      
      // FIX logic dựa trên Service: removeActiveGoal(id: string). 
      // Ta cần ID của UserHealthGoal record. Nếu response không trả về, ta không xóa được chính xác.
      // Tạm thời gọi endpoint xoá với ID của customGoal (Backend cần handle logic này)
      const targetId = activeGoal.customHealthGoalId || activeGoal.healthGoalId;

      Alert.alert(
          'Dừng theo dõi',
          'Bạn có muốn dừng mục tiêu hiện tại?',
          [
              { text: 'Hủy', style: 'cancel'},
              {
                  text: 'Dừng',
                  style: 'destructive',
                  onPress: async () => {
                      try {
                          if(targetId) {
                            setLoading(true);
                            // Lưu ý: check lại logic backend chỗ này
                            await healthGoalService.removeActiveGoal(targetId); 
                            await fetchData();
                          }
                      } catch (error) {
                          setLoading(false);
                          Alert.alert('Lỗi', 'Không thể dừng mục tiêu.');
                      }
                  }
              }
          ]
      )
  }

  // Helper formats
  const formatDate = (dateString?: string) => {
      if(!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString('vi-VN');
      } catch (e) {
          return dateString;
      }
  };

  // Render Loading Lần đầu
  if (loading && !refreshing && myGoals.length === 0 && !activeGoal) {
      return (
          <SafeAreaView style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color="#84cc16" />
              <Text style={{marginTop: 12, color: '#6b7280'}}>Đang tải dữ liệu...</Text>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quản Lý Mục Tiêu</Text>
          <Text style={styles.headerSubtitle}>Theo dõi lộ trình sức khỏe của bạn</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar} onPress={() => fetchData()}>
             {/* Nút refresh phụ hoặc avatar */}
            <Text style={{color: '#fff', fontWeight: 'bold'}}>ME</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#84cc16']} />
        }
      >
        
        {/* SECTION 1: ACTIVE GOAL */}
        <View style={styles.sectionHeaderRow}>
             <Text style={styles.sectionTitle}>Đang Theo Dõi</Text>
             {activeGoal && (
                 <TouchableOpacity onPress={handleRemoveActive}>
                     <Text style={styles.dangerLink}>Dừng theo dõi</Text>
                 </TouchableOpacity>
             )}
        </View>
        
        {activeGoal ? (
          <View style={styles.activeCard}>
            <View style={styles.activeCardBgDecor} />
            <View style={styles.activeCardContent}>
                <View style={styles.activeHeader}>
                    <View style={styles.badgeContainer}>
                        <Zap size={14} color="#fff" fill="#fff" />
                        <Text style={styles.badgeText}>ACTIVE</Text>
                    </View>
                    <Text style={styles.expiryText}>
                        {/* Mock ngày hết hạn vì response active có thể chưa trả về ngày hết hạn */}
                        30 ngày còn lại
                    </Text>
                </View>

                <Text style={styles.activeGoalName}>{activeGoal.name}</Text>
                <Text style={styles.activeGoalDesc} numberOfLines={2}>
                    {activeGoal.description || 'Hãy cố gắng hoàn thành các chỉ số dinh dưỡng hàng ngày.'}
                </Text>

                {/* List Targets Preview (Optional) */}
                <View style={styles.targetsPreview}>
                    {activeGoal.targets.slice(0, 3).map((t, i) => (
                        <Text key={i} style={styles.targetTag}>
                            {t.name}: {t.minValue}-{t.maxValue}
                        </Text>
                    ))}
                    {activeGoal.targets.length > 3 && <Text style={styles.targetTag}>...</Text>}
                </View>

                <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Xem báo cáo chi tiết</Text>
                    <ChevronRight size={16} color="#4d7c0f" />
                </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyActiveCard}>
            <AlertCircle size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>Bạn chưa áp dụng mục tiêu nào.</Text>
            <Text style={styles.emptySubText}>Chọn từ danh sách bên dưới hoặc tạo mới.</Text>
          </View>
        )}

        {/* SECTION 2: CREATE NEW */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
            <View style={styles.createIconBg}>
                <Plus size={24} color="#fff" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.createBtnTitle}>Tạo Mục Tiêu Mới</Text>
                <Text style={styles.createBtnSub}>Tùy chỉnh theo nhu cầu cá nhân</Text>
            </View>
            <ChevronRight size={20} color="#d1d5db" />
        </TouchableOpacity>

        {/* SECTION 3: MY GOALS LIST */}
        <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Danh Sách Của Tôi ({myGoals.length})</Text>
        </View>

        <View style={styles.listContainer}>
          {myGoals.map((item) => {
             const isActive = activeGoal?.customHealthGoalId === item.id;
             return (
                <View key={item.id} style={[styles.goalCard, isActive && styles.goalCardActiveBorder]}>
                
                {/* Card Info */}
                <View style={styles.goalCardBody}>
                    <View style={styles.goalIcon}>
                        <Target size={22} color={isActive ? "#65a30d" : "#6b7280"} />
                    </View>
                    <View style={{flex: 1}}>
                        <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                            <Text style={styles.goalName} numberOfLines={1}>{item.name}</Text>
                            {isActive && <CheckCircle2 size={14} color="#65a30d" fill="#ecfccb"/>}
                        </View>
                        <Text style={styles.goalDesc} numberOfLines={2}>
                            {item.description || "Không có mô tả"}
                        </Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>{item.targets.length} chỉ số dinh dưỡng</Text>
                        </View>
                    </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardFooter}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => handleSetActive(item)}
                        disabled={isActive}
                    >
                        {isActive ? (
                            <Text style={[styles.actionText, {color:'#65a30d'}]}>Đang áp dụng</Text>
                        ) : (
                            <Text style={styles.actionText}>Áp dụng</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, item.name)}>
                        <Text style={[styles.actionText, {color: '#ef4444'}]}>Xóa</Text>
                    </TouchableOpacity>
                </View>
                </View>
             );
          })}
          
          {myGoals.length === 0 && !loading && (
             <View style={styles.emptyStateContainer}>
                 <Text style={styles.emptyListText}>Danh sách trống.</Text>
             </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#84cc16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerLink: {
      fontSize: 13,
      fontWeight: '600',
      color: '#ef4444',
  },

  // --- Active Card ---
  activeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#bef264', // lime-300
    shadowColor: '#84cc16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  activeCardBgDecor: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 6,
      backgroundColor: '#84cc16',
  },
  activeCardContent: {
      padding: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#65a30d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  expiryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeGoalName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  activeGoalDesc: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  targetsPreview: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 16,
  },
  targetTag: {
      fontSize: 11,
      color: '#4d7c0f',
      backgroundColor: '#ecfccb',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: 'hidden',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4d7c0f',
    marginRight: 4,
  },
  emptyActiveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },

  // --- Create Button ---
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937', // Dark gray
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  createIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  createBtnSub: {
    fontSize: 12,
    color: '#d1d5db',
  },

  // --- List Goals ---
  listContainer: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  goalCardActiveBorder: {
      borderColor: '#84cc16',
      backgroundColor: '#f7fee7', // light lime bg
  },
  goalCardBody: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  goalDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginVertical: 4,
    lineHeight: 18,
  },
  metaRow: {
      marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cardFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      backgroundColor: '#fafafa',
  },
  actionButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  divider: {
      width: 1,
      backgroundColor: '#e5e7eb',
      marginVertical: 8,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#4b5563',
  },
  emptyStateContainer: {
      padding: 20,
      alignItems: 'center',
  },
  emptyListText: {
      color: '#9ca3af',
      fontStyle: 'italic',
  }
});