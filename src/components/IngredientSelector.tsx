import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getIngredients, Ingredient } from '../services/IngredientService';

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
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredIngredients(allIngredients);
    } else {
      const filtered = allIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [searchText, allIngredients]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await getIngredients(); 
      const ingredients = response.items;
      setAllIngredients(ingredients);
      setFilteredIngredients(ingredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const isIngredientSelected = (ingredientId: string) => {
    return selectedIngredients.some((item) => item.ingredientId === ingredientId);
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    const isSelected = isIngredientSelected(ingredient.id);

    if (isSelected) {
      handleRemoveIngredient(ingredient.id);
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

  const handleOpenDropdown = () => {
    setIsDropdownVisible(true);
    setSearchText('');
  };

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
    setSearchText('');
  };

  return (
    <View>
      {/* Selected Ingredients List */}
      {selectedIngredients.map((item) => (
        <View key={item.ingredientId} style={styles.selectedIngredientRow}>
          <View style={styles.ingredientNameSection}>
            <Text style={styles.ingredientName}>{item.ingredientName}</Text>
          </View>

          <View style={styles.quantitySection}>
            <TextInput
              style={styles.quantityInput}
              value={item.quantityGram > 0 ? item.quantityGram.toString() : ''}
              onChangeText={(text) => handleUpdateQuantity(item.ingredientId, text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.unitText}>g</Text>

            <TouchableOpacity
              style={styles.removeIconButton}
              onPress={() => handleRemoveIngredient(item.ingredientId)}
            >
              <Icon name="close-circle" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      ))}


      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handleOpenDropdown}
        activeOpacity={0.7}
      >
      
        <TextInput
          style={styles.input}
          placeholder="Thêm nguyên liệu..."
          placeholderTextColor="#9CA3AF"
          editable={false}
          pointerEvents="none"
        />
        <Icon name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDropdown}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDropdown}
        >
          <View style={styles.dropdownContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn nguyên liệu</Text>
              <TouchableOpacity onPress={handleCloseDropdown}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nguyên liệu..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Ingredients List */}
            <FlatList
              data={filteredIngredients}
              keyExtractor={(item) => item.id}
              style={styles.ingredientsList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon 
                    name={loading ? "hourglass-outline" : "search-outline"} 
                    size={48} 
                    color="#D1D5DB" 
                  />
                  <Text style={styles.emptyText}>
                    {loading ? 'Đang tải...' : 'Không tìm thấy nguyên liệu'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = isIngredientSelected(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.ingredientItem,
                      selected && styles.ingredientItemSelected
                    ]}
                    onPress={() => handleSelectIngredient(item)}
                  >
                    <View style={styles.ingredientItemContent}>
                      <View style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected
                      ]}>
                        {selected && (
                          <Icon name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={[
                        styles.ingredientItemText,
                        selected && styles.ingredientItemTextSelected
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Selected Ingredients Styles
  selectedIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  ingredientNameSection: {
    flex: 1,
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    width: 70,
    height: 46,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#fff',
    fontWeight: '600',
  },
  unitText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  removeIconButton: {
    padding: 4,
    marginLeft: 4,
  },

  // Input Field Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  inputIcon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  ingredientsList: {
    maxHeight: 450,
  },
  ingredientItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ingredientItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  ingredientItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#8BC34A',
    borderColor: '#8BC34A',
  },
  ingredientItemText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  ingredientItemTextSelected: {
    color: '#1F2937',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
  },
});

export default IngredientSelector;