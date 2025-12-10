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
import { getIngredients, Ingredient } from '../services/IngredientService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchIngredients();
    }
  }, [showModal]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await getIngredients();
      const ingredients = response.items;
      setAllIngredients(ingredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isIngredientSelected = (ingredientId: string) => {
    return selectedIngredients.some((item) => item.ingredientId === ingredientId);
  };

  const handleToggleIngredient = (ingredient: Ingredient) => {
    const isSelected = isIngredientSelected(ingredient.id);

    if (isSelected) {
      onIngredientsChange(
        selectedIngredients.filter((item) => item.ingredientId !== ingredient.id)
      );
    } else {
      const newItem: IngredientWithQuantity = {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {/* 1. HIỂN THỊ DANH SÁCH ĐÃ CHỌN (1 HÀNG NGANG) */}
      {selectedIngredients.length > 0 && (
        <View style={styles.selectedListContainer}>
          {selectedIngredients.map((item) => (
            <View key={item.ingredientId} style={styles.ingredientCard}>
              
              {/* Main Content: Icon + Tên + Input (Cùng 1 hàng) */}
              <View style={styles.cardMainContent}>
                
                {/* Icon */}
                <View style={styles.cardIconWrapper}>
                    <Icon name="food-apple" size={22} color="#F97316" />
                </View>

                {/* Tên: Flex 1 để chiếm chỗ trống và đẩy Input sang phải */}
                <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
                  {item.ingredientName}
                </Text>

                {/* Input: Căn sát phải */}
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

              {/* Đường kẻ dọc ngăn cách */}
              <View style={styles.verticalDivider} />

              {/* Nút xóa (X) */}
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

      {/* 2. NÚT CHỌN NGUYÊN LIỆU (PHÍA DƯỚI) */}
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
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BRAND_COLOR} />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredIngredients}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                style={styles.list}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="database-off" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không tìm thấy kết quả nào</Text>
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
                        {/* 1. Left Dot (Thay cho checkbox vuông) */}
                        <View style={[styles.dot, isSelected && styles.dotSelected]} />
                        
                        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                          {item.name}
                        </Text>
                      </View>

                      {/* 2. Right Check Icon (Thêm tích V bên phải) */}
                      {isSelected && (
                        <Icon name="check-circle" size={22} color={BRAND_COLOR} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* Footer Modal */}
            <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.doneButton} onPress={handleCloseModal}>
                    <Text style={styles.doneButtonText}>Xong</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  
  // --- CARD DANH SÁCH ---
  selectedListContainer: {
    marginBottom: 12,
    gap: 8, 
  },
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
  cardMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    flex: 1, 
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8, 
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bracketText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
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
  unitText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  verticalDivider: {
    width: 1,
    height: 24, 
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  cardRemoveBtn: {
    padding: 4,
  },

  // --- SELECT BUTTON ---
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
  selectButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      
  },
  selectButtonText: {
      fontSize: 15,
      color: '#9CA3AF',
      fontWeight: '500',
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
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
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, color: '#9CA3AF' },

  // --- LIST ITEM STYLES (UPDATED) ---
  listItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', // Đẩy nội dung sang 2 bên
    paddingHorizontal: 20, 
    paddingVertical: 14,
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  listItemSelected: { backgroundColor: '#F0F9FF' },
  
  listItemContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    flex: 1, // Chiếm hết phần bên trái
  },
  
  // Style cho chấm tròn (thay checkbox cũ)
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6, // Tròn
    backgroundColor: '#D1D5DB', // Màu xám khi chưa chọn
  },
  dotSelected: {
    backgroundColor: BRAND_COLOR, // Màu xanh khi chọn
  },
  
  listItemText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
  listItemTextSelected: { color: '#1F2937', fontWeight: '700' },

  modalFooter: {
      padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  doneButton: {
      backgroundColor: BRAND_COLOR, borderRadius: 12, paddingVertical: 14, alignItems: 'center'
  },
  doneButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default IngredientSelector;