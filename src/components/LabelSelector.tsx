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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getLabels, Label } from '../services/LabelService';

const BRAND_COLOR = '#8BC34A';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  onLabelsChange,
}) => {
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<Label[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredLabels(allLabels);
    } else {
      const filtered = allLabels.filter((label) =>
        label.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLabels(filtered);
    }
  }, [searchText, allLabels]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const labels = await getLabels();
      setAllLabels(labels);
      setFilteredLabels(labels);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLabelSelected = (labelId: string) => {
    return selectedLabels.some((l) => l.id === labelId);
  };

  const handleToggleLabel = (label: Label) => {
    if (isLabelSelected(label.id)) {
      onLabelsChange(selectedLabels.filter((l) => l.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    onLabelsChange(selectedLabels.filter((l) => l.id !== labelId));
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
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedHeader}>
            <Icon name="tag-multiple" size={16} color="#6B7280" />
            <Text style={styles.selectedHeaderText}>
              Đã chọn ({selectedLabels.length})
            </Text>
          </View>
          <View style={styles.tagsWrapper}>
            {selectedLabels.map((label) => (
              <View
                key={label.id}
                style={[styles.tag, { backgroundColor: label.colorCode + '20', borderColor: label.colorCode }]}
              >
                <View style={[styles.colorDot, { backgroundColor: label.colorCode }]} />
                <Text style={[styles.tagText, { color: label.colorCode }]}>
                  {label.name}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveLabel(label.id)}
                  style={styles.removeButton}
                >
                  <Icon name="close-circle" size={16} color={label.colorCode} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Input Field */}
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handleOpenDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.inputIconBg}>
          <Icon name="tag-plus" size={18} color={BRAND_COLOR} />
        </View>
        <Text style={styles.inputPlaceholder}>Thêm nhãn...</Text>
        <Icon name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDropdown}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBg}>
                  <Icon name="tag-multiple" size={20} color={BRAND_COLOR} />
                </View>
                <Text style={styles.modalTitle}>Chọn nhãn</Text>
              </View>
              <TouchableOpacity onPress={handleCloseDropdown} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nhãn..."
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

            {/* List */}
            <FlatList
              data={filteredLabels}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon 
                    name={loading ? 'loading' : 'tag-off-outline'} 
                    size={48} 
                    color="#D1D5DB" 
                  />
                  <Text style={styles.emptyText}>
                    {loading ? 'Đang tải...' : 'Không tìm thấy nhãn'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = isLabelSelected(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.labelItem,
                      selected && styles.labelItemSelected
                    ]}
                    onPress={() => handleToggleLabel(item)}
                  >
                    <View style={styles.labelItemContent}>
                      <View style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                        { borderColor: item.colorCode }
                      ]}>
                        {selected && (
                          <Icon name="check" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={[styles.colorDot, { backgroundColor: item.colorCode }]} />
                      <Text style={[
                        styles.labelItemText,
                        selected && styles.labelItemTextSelected
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                    {selected && (
                      <View style={[styles.selectedBadge, { backgroundColor: item.colorCode }]}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Footer */}

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Selected Labels
  selectedContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  selectedHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeButton: {
    marginLeft: 2,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  inputIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  list: {
    maxHeight: 400,
  },
  labelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  labelItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  labelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  labelItemText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  labelItemTextSelected: {
    color: '#1F2937',
    fontWeight: '700',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  doneButton: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LabelSelector;