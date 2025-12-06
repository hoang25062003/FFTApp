import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { X, Plus, ChevronDown, Trash2, Check, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import Services
import nutrientService, { NutrientInfo } from '../../services/NutrientService';
import healthGoalService, { CreateCustomHealthGoalRequest } from '../../services/HealthGoalService';

// Định nghĩa kiểu dữ liệu cho một dòng trên giao diện (Local State)
interface LocalTargetItem {
  id: string; // ID tạm của UI row
  nutrientId: string;
  nutrientName: string;
  unit: string;
  min: string;
  max: string;
  weight: string; // Mapping với 'weight' trong DTO
}

export default function CreateCustomGoalScreen({ navigation }: { navigation?: any }) {
  // --- STATE ---
  const [goalName, setGoalName] = useState('');
  const [description, setDescription] = useState('');
  
  // Danh sách các chất dinh dưỡng lấy từ API
  const [availableNutrients, setAvailableNutrients] = useState<NutrientInfo[]>([]);
  const [isLoadingNutrients, setIsLoadingNutrients] = useState(false);
  
  // State quản lý việc submit form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý danh sách các chỉ số dinh dưỡng (Targets)
  const [targets, setTargets] = useState<LocalTargetItem[]>([
    { id: 'init_1', nutrientId: '', nutrientName: '', unit: '', min: '', max: '', weight: '1' },
  ]);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEditingRowId, setCurrentEditingRowId] = useState<string | null>(null);

  // --- EFFECT: Lấy danh sách chất dinh dưỡng khi mount ---
  useEffect(() => {
    fetchNutrients();
  }, []);

  const fetchNutrients = async () => {
    try {
      setIsLoadingNutrients(true);
      const data = await nutrientService.getNutrients();
      setAvailableNutrients(data);
    } catch (error) {
      console.error('Failed to load nutrients', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách chất dinh dưỡng.');
    } finally {
      setIsLoadingNutrients(false);
    }
  };

  // --- HANDLERS: Quản lý danh sách Targets ---

  const handleAddTarget = () => {
    const newId = Date.now().toString();
    setTargets([
      ...targets,
      { id: newId, nutrientId: '', nutrientName: '', unit: '', min: '', max: '', weight: '1' },
    ]);
  };

  const handleRemoveTarget = (id: string) => {
    if (targets.length === 1) {
      Alert.alert('Thông báo', 'Cần ít nhất một chỉ số dinh dưỡng.');
      return;
    }
    setTargets(targets.filter((item) => item.id !== id));
  };

  const updateTargetField = (id: string, field: keyof LocalTargetItem, value: string) => {
    setTargets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- HANDLERS: Modal Selection ---

  const openNutrientModal = (rowId: string) => {
    setCurrentEditingRowId(rowId);
    setModalVisible(true);
  };

  const selectNutrient = (nutrient: NutrientInfo) => {
    if (currentEditingRowId) {
      setTargets((prev) =>
        prev.map((item) =>
          item.id === currentEditingRowId
            ? { 
                ...item, 
                nutrientId: nutrient.id, 
                nutrientName: nutrient.vietnameseName, 
                unit: nutrient.unit 
              }
            : item
        )
      );
    }
    setModalVisible(false);
    setCurrentEditingRowId(null);
  };

  // --- HANDLERS: Submit Form ---

  const handleCreate = async () => {
    // 1. Validation cơ bản
    if (!goalName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên mục tiêu.');
      return;
    }

    // 2. Validate Targets
    const validTargets = targets.filter(t => t.nutrientId !== '');
    if (validTargets.length === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một chất dinh dưỡng.');
      return;
    }

    // Kiểm tra logic số học
    for (const t of validTargets) {
        if(Number(t.min) > Number(t.max)) {
            Alert.alert('Lỗi logic', `Chất ${t.nutrientName}: Giá trị Tối thiểu không được lớn hơn Tối đa.`);
            return;
        }
    }

    setIsSubmitting(true);

    try {
      // 3. Chuẩn bị Payload theo DTO của HealthGoalService
      const payload: CreateCustomHealthGoalRequest = {
        name: goalName,
        description: description,
        targets: validTargets.map(t => ({
          nutrientId: t.nutrientId,
          targetType: 'MIN_MAX', // Mặc định loại target
          minValue: Number(t.min) || 0,
          maxValue: Number(t.max) || 0,
          weight: Number(t.weight) || 1, // Mapping priority sang weight
        }))
      };

      console.log('Sending Payload:', JSON.stringify(payload, null, 2));

      // 4. Call API
      await healthGoalService.createCustomGoal(payload);

      Alert.alert('Thành công', 'Đã tạo mục tiêu sức khỏe mới!', [
        { text: 'OK', onPress: () => navigation?.goBack() }
      ]);

    } catch (error: any) {
      console.error('Create Goal Error:', error);
      Alert.alert('Thất bại', error.message || 'Có lỗi xảy ra khi tạo mục tiêu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Tạo Mục Tiêu Mới</Text>
            <Text style={styles.headerSubtitle}>
              Thiết lập các chỉ số dinh dưỡng cá nhân hóa
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation?.goBack()}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Tên & Mô tả */}
          <View style={styles.sectionContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên mục tiêu <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Low Carb, Tăng cơ..."
                placeholderTextColor="#9ca3af"
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả mục tiêu này..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Chi Tiết Dinh Dưỡng</Text>

          {/* Danh sách Target Cards */}
          {targets.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Chỉ Số #{index + 1}</Text>
                {targets.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveTarget(item.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Selector Chất Dinh Dưỡng */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Loại chất <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.dropdown, !item.nutrientName && styles.dropdownPlaceholder]}
                  onPress={() => openNutrientModal(item.id)}
                >
                  <Text style={[styles.dropdownText, !item.nutrientName && { color: '#9ca3af' }]}>
                    {item.nutrientName || 'Chọn chất dinh dưỡng'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Min/Max Inputs */}
              <View style={styles.blueBox}>
                <Text style={styles.blueBoxTitle}>Phạm vi mục tiêu {item.unit ? `(${item.unit})` : ''}</Text>
                
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.subLabel}>Tối thiểu</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={item.min}
                        onChangeText={(val) => updateTargetField(item.id, 'min', val)}
                        />
                        {item.unit ? <Text style={styles.unitText}>{item.unit}</Text> : null}
                    </View>
                  </View>
                  
                  <View style={styles.col}>
                    <Text style={styles.subLabel}>Tối đa</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={item.max}
                        onChangeText={(val) => updateTargetField(item.id, 'max', val)}
                        />
                         {item.unit ? <Text style={styles.unitText}>{item.unit}</Text> : null}
                    </View>
                  </View>
                </View>

                {/* Priority / Weight */}
                <View style={[styles.formGroup, { marginTop: 12 }]}>
                  <Text style={styles.subLabel}>Độ ưu tiên (Trọng số 1-10)</Text>
                  <TextInput
                    style={styles.inputWhite}
                    keyboardType="numeric"
                    value={item.weight}
                    placeholder="1"
                    onChangeText={(val) => updateTargetField(item.id, 'weight', val)}
                  />
                </View>
              </View>
            </View>
          ))}

          {/* Nút Thêm */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddTarget}>
            <Plus size={20} color="#65a30d" />
            <Text style={styles.addButtonText}>Thêm chỉ số khác</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation?.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.createButton, isSubmitting && styles.disabledButton]} 
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
                <>
                <Save size={18} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.createButtonText}>Lưu Mục Tiêu</Text>
                </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- MODAL CHỌN NUTRIENT --- */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn Chất Dinh Dưỡng</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <X size={24} color="#111827" />
                </TouchableOpacity>
            </View>
            
            {isLoadingNutrients ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#84cc16" />
                    <Text style={{marginTop: 10, color: '#6b7280'}}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <FlatList
                    data={availableNutrients}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{padding: 16}}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.nutrientItem} 
                            onPress={() => selectNutrient(item)}
                        >
                            <View>
                                <Text style={styles.nutrientName}>{item.vietnameseName}</Text>
                                <Text style={styles.nutrientUnit}>Đơn vị: {item.unit}</Text>
                            </View>
                            <ChevronDown size={16} color="#9ca3af" style={{transform: [{rotate: '-90deg'}]}}/>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // Nền hơi xám nhẹ cho hiện đại
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  dropdownPlaceholder: {
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  blueBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  blueBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  numberInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  unitText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  inputWhite: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#84cc16',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65a30d',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#84cc16',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#84cc16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#a3a3a3',
    shadowOpacity: 0,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  nutrientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  nutrientUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  }
});