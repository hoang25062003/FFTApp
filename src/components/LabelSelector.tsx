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
import { getLabels, Label } from '../services/LabelService';

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
      // Remove label
      onLabelsChange(selectedLabels.filter((l) => l.id !== label.id));
    } else {
      // Add label
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
      {/* Selected Labels Tags */}
      {selectedLabels.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          {selectedLabels.map((label) => (
            <View
              key={label.id}
              style={[styles.labelTag, { backgroundColor: label.colorCode }]}
            >
              <Text style={styles.labelTagText}>{label.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveLabel(label.id)}>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Input Field */}
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handleOpenDropdown}
        activeOpacity={0.7}
      >
        <TextInput
          style={styles.input}
          placeholder="Thêm nhãn..."
          editable={false}
          pointerEvents="none"
        />
        <Icon name="chevron-down" size={20} color="#999" />
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
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nhãn..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>

            {/* Labels List */}
            <FlatList
              data={filteredLabels}
              keyExtractor={(item) => item.id}
              style={styles.labelsList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {loading ? 'Đang tải...' : 'Không tìm thấy nhãn'}
                </Text>
              }
              renderItem={({ item }) => {
                const selected = isLabelSelected(item.id);
                return (
                  <TouchableOpacity
                    style={styles.labelItem}
                    onPress={() => handleToggleLabel(item)}
                  >
                    <View style={styles.labelItemLeft}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: item.colorCode },
                        ]}
                      />
                      <Text style={styles.labelItemText}>{item.name}</Text>
                    </View>
                    {selected && (
                      <Icon name="checkmark-circle" size={20} color="#27ae60" /> 
                    )}
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
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  labelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  labelTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  labelsList: {
    maxHeight: 400,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labelItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  labelItemText: {
    fontSize: 15,
    color: '#333',
  },
  selectedText: {
    fontSize: 13,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 24,
  },
});

export default LabelSelector;