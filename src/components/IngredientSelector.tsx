import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Import thêm UsdaIngredient và getUsdaIngredients
import { getIngredients, getUsdaIngredients, Ingredient, UsdaIngredient } from '../services/IngredientService';

const BRAND_COLOR = '#8BC34A';

interface IngredientWithQuantity {
  ingredientId: string;
  ingredientName: string;
  quantityGram: number;
}

interface IngredientSelectorProps {
  selectedIngredients: IngredientWithQuantity[];
  onIngredientsChange: (ingredients: IngredientWithQuantity[]) => void;
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  selectedIngredients,
  onIngredientsChange,
}) => {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaIngredient[]>([]); // Lưu kết quả USDA
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usdaLoading, setUsdaLoading] = useState(false); // Loading khi tìm USDA

  useEffect(() => {
    if (showModal) {
      fetchIngredients();
    }
  }, [showModal]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await getIngredients();
      setAllIngredients(response.items);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API USDA
  const handleSearchUSDA = async () => {
    try {
      setUsdaLoading(true);
      const results = await getUsdaIngredients(searchQuery);
      setUsdaResults(results);
    } catch (error) {
      console.error('USDA Search Error:', error);
    } finally {
      setUsdaLoading(false);
    }
  };

  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isIngredientSelected = (ingredientId: string) => {
    return selectedIngredients.some((item) => item.ingredientId === ingredientId);
  };

  // Cập nhật hàm toggle để chấp nhận cả Ingredient hoặc UsdaIngredient
  const handleToggleIngredient = (item: Ingredient | UsdaIngredient) => {
    const isSelected = isIngredientSelected(item.id);

    if (isSelected) {
      onIngredientsChange(
        selectedIngredients.filter((si) => si.ingredientId !== item.id)
      );
    } else {
      const newItem: IngredientWithQuantity = {
        ingredientId: item.id,
        ingredientName: item.name,
        quantityGram: 0,
      };
      onIngredientsChange([...selectedIngredients, newItem]);
    }
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    onIngredientsChange(
      selectedIngredients.filter((item) => item.ingredientId !== ingredientId)
    );
  };

  const handleUpdateQuantity = (ingredientId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onIngredientsChange(
      selectedIngredients.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, quantityGram: numValue }
          : item
      )
    );
  };

  const handleOpenModal = () => {
    Keyboard.dismiss();
    setShowModal(true);
    setSearchQuery('');
    setUsdaResults([]); // Reset kết quả USDA cũ
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchQuery('');
  };

  // Gộp danh sách hiển thị: Nếu có kết quả USDA thì ưu tiên hiển thị hoặc nối thêm
  const displayData = usdaResults.length > 0 ? usdaResults : filteredIngredients;

  return (
    <View style={styles.container}>
      {/* 1. HIỂN THỊ DANH SÁCH ĐÃ CHỌN */}
      {selectedIngredients.length > 0 && (
        <View style={styles.selectedListContainer}>
          {selectedIngredients.map((item) => (
            <View key={item.ingredientId} style={styles.ingredientCard}>
              <View style={styles.cardMainContent}>
                <View style={styles.cardIconWrapper}>
                  <Icon name="food-apple" size={22} color="#F97316" />
                </View>
                <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
                  {item.ingredientName}
                </Text>
                <View style={styles.quantityRow}>
                  <Text style={styles.bracketText}>[</Text>
                  <TextInput
                    style={styles.inlineInput}
                    value={item.quantityGram > 0 ? item.quantityGram.toString() : ''}
                    onChangeText={(text) => handleUpdateQuantity(item.ingredientId, text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.bracketText}>]</Text>
                  <Text style={styles.unitText}>gram</Text>
                </View>
              </View>
              <View style={styles.verticalDivider} />
              <TouchableOpacity
                style={styles.cardRemoveBtn}
                onPress={() => handleRemoveIngredient(item.ingredientId)}
              >
                <Icon name="close" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 2. NÚT CHỌN NGUYÊN LIỆU */}
      <TouchableOpacity style={styles.selectButton} onPress={handleOpenModal}>
        <View style={styles.selectButtonContent}>
          <Icon 
            name="food-apple" 
            size={20} 
            color={selectedIngredients.length > 0 ? "#EF4444" : "#9CA3AF"} 
          />
          <Text style={styles.selectButtonText}>
            {selectedIngredients.length > 0 
              ? `Đã chọn ${selectedIngredients.length} nguyên liệu` 
              : "Nhấn để chọn nguyên liệu"}
          </Text>
        </View>
        <Icon name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* --- MODAL --- */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBg}>
                  <Icon name="food-apple" size={20} color={BRAND_COLOR} />
                </View>
                <Text style={styles.modalTitle}>Chọn nguyên liệu</Text>
              </View>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Nhập tên để tìm..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={(text) => {
                    setSearchQuery(text);
                    if (usdaResults.length > 0) setUsdaResults([]); // Reset USDA khi gõ lại
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setUsdaResults([]); }}>
                  <Icon name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            {loading || usdaLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BRAND_COLOR} />
                <Text style={styles.loadingText}>Đang xử lý...</Text>
              </View>
            ) : (
              <FlatList
                data={displayData}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                style={styles.list}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="database-off" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không tìm thấy nguyên liệu tại chỗ</Text>
                    
                    {/* NÚT TÌM TỪ USDA XUẤT HIỆN Ở ĐÂY */}
                    {searchQuery.length > 0 && (
                        <TouchableOpacity style={styles.usdaSearchBtn} onPress={handleSearchUSDA}>
                            <Icon name="cloud-search" size={20} color="#FFF" />
                            <Text style={styles.usdaSearchBtnText}>Tìm từ USDA</Text>
                        </TouchableOpacity>
                    )}
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = isIngredientSelected(item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.listItem, isSelected && styles.listItemSelected]}
                      onPress={() => handleToggleIngredient(item)}
                    >
                      <View style={styles.listItemContent}>
                        <View style={[styles.dot, isSelected && styles.dotSelected]} />
                        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                          {item.name}
                        </Text>
                      </View>
                      {isSelected && (
                        <Icon name="check-circle" size={22} color={BRAND_COLOR} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            
            {/* ĐÃ LOẠI BỎ PHẦN FOOTER CHỨA NÚT "XONG" */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  selectedListContainer: { marginBottom: 12, gap: 8 },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardMainContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cardIconWrapper: { marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  cardName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151', marginRight: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  bracketText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
  inlineInput: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '700', 
    padding: 0,
    marginHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  unitText: { marginLeft: 4, fontSize: 14, color: '#6B7280' },
  verticalDivider: { width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  cardRemoveBtn: { padding: 4 },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectButtonText: { fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%', // Tăng chiều cao một chút vì không còn nút Xong ở dưới
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalIconBg: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  closeButton: { padding: 4 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12, height: 44,
    margin: 20, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6B7280' },
  list: { flex: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { marginTop: 10, marginBottom: 20, color: '#9CA3AF', textAlign: 'center' },
  
  // Style cho nút Tìm USDA
  usdaSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6', // Màu xanh dương để phân biệt
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usdaSearchBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  listItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 14,
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  listItemSelected: { backgroundColor: '#F0F9FF' },
  listItemContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D1D5DB' },
  dotSelected: { backgroundColor: BRAND_COLOR },
  listItemText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
  listItemTextSelected: { color: '#1F2937', fontWeight: '700' },
});

export default IngredientSelector;