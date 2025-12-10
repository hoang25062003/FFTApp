import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import styles from './ScanResultScreenStyles';
import { DetectedIngredientResponse } from '../../services/ScanService';
import { ScanStackParamList } from '../../navigation/ScanStackNavigator';

type ScanResultRouteProp = RouteProp<ScanStackParamList, 'ScanResult'>;

type SelectedIngredient = {
  id: number;
  name: string;
  confidence: number;
  selected: boolean;
};

const ScanResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScanResultRouteProp>();
  const { results, imageUri } = route.params;
  const ingredients = results;

  const [selectedItems, setSelectedItems] = useState<SelectedIngredient[]>([]);

  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const formattedIngredients = ingredients.map((item, index) => ({
        id: index + 1,
        name: item.ingredient,
        confidence: Math.round(item.confidence * 100),
        selected: true,
      }));
      setSelectedItems(formattedIngredients);
    }
  }, [ingredients]);

  const toggleItem = (id: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = selectedItems.every(item => item.selected);
    setSelectedItems(
      selectedItems.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const getSelectedCount = () => {
    return selectedItems.filter((item) => item.selected).length;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#10B981';
    if (confidence >= 70) return '#3B82F6';
    return '#F59E0B';
  };

  const handleSearch = () => {
    const selected = selectedItems.filter(item => item.selected);
    
    if (selected.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một nguyên liệu để tìm kiếm.');
      return;
    }

    const ingredientNames = selected.map(item => item.name);
    
    // Tạo search query từ các nguyên liệu đã chọn
    const searchQuery = ingredientNames.join(', ');
    
    // Navigate to Home screen with search parameters
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              routes: [
                {
                  name: 'Home',
                  params: {
                    searchQuery: searchQuery,
                    ingredientNames: ingredientNames,
                    fromScan: true,
                  },
                },
              ],
            },
          },
        ],
      })
    );
  };

  const handleBackToScan = () => {
    navigation.goBack();
  };

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy và quay lại?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (!ingredients || ingredients.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="food-off" size={80} color="#84B74A" />
          </View>
          <Text style={styles.emptyTitle}>Không tìm thấy nguyên liệu</Text>
          <Text style={styles.emptySubtitle}>Vui lòng thử lại với hình ảnh khác</Text>
          <TouchableOpacity style={styles.backButtonEmpty} onPress={handleBackToScan}>
            <Icon name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonEmptyText}>Chụp lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Icon name="close" size={26} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon name="chef-hat" size={24} color="#84B74A" />
          <Text style={styles.headerTitle}>Kết quả quét</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {imageUri && (
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.scannedImage} />
              <View style={styles.imageOverlay}>
                <View style={styles.imageBadge}>
                  <Icon name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.imageBadgeText}>Đã quét</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <View style={styles.infoLeft}>
              <Icon name="check-decagram" size={22} color="#84B74A" />
              <Text style={styles.infoTitle}>Nguyên liệu phát hiện</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedItems.length}</Text>
            </View>
          </View>
          <Text style={styles.infoSubtitle}>
            Chọn nguyên liệu để tìm công thức nấu ăn phù hợp
          </Text>
        </View>

        <View style={styles.selectAllContainer}>
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
            activeOpacity={0.7}
          >
            <View style={[
              styles.selectAllCheckbox,
              getSelectedCount() === selectedItems.length && styles.selectAllCheckboxActive
            ]}>
              {getSelectedCount() === selectedItems.length && (
                <Icon name="check" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.selectAllText}>
              {getSelectedCount() === selectedItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.selectedCountText}>
            {getSelectedCount()}/{selectedItems.length} đã chọn
          </Text>
        </View>

        <View style={styles.ingredientsList}>
          {selectedItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.ingredientCard,
                item.selected && styles.ingredientCardSelected
              ]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.ingredientLeft}>
                <View style={[
                  styles.ingredientCheckbox,
                  item.selected && styles.ingredientCheckboxSelected
                ]}>
                  {item.selected && (
                    <Icon name="check" size={18} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.ingredientInfo}>
                  <Text style={[
                    styles.ingredientName,
                    item.selected && styles.ingredientNameSelected
                  ]}>
                    {item.name}
                  </Text>
                  <View style={styles.confidenceContainer}>
                    <Icon 
                      name="bullseye-arrow" 
                      size={14} 
                      color={getConfidenceColor(item.confidence)} 
                    />
                    <Text style={[
                      styles.confidenceLabel,
                      { color: getConfidenceColor(item.confidence) }
                    ]}>
                      Độ chính xác: {item.confidence}%
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill,
                    { 
                      width: `${item.confidence}%`,
                      backgroundColor: getConfidenceColor(item.confidence)
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.rescanButton} 
          onPress={handleBackToScan}
          activeOpacity={0.7}
        >
          <Icon name="camera-retake" size={22} color="#6B7280" />
          <Text style={styles.rescanButtonText}>Chụp lại</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.searchButton,
            getSelectedCount() === 0 && styles.searchButtonDisabled
          ]}
          onPress={handleSearch}
          disabled={getSelectedCount() === 0}
          activeOpacity={0.8}
        >
          <Icon 
            name="magnify" 
            size={22} 
            color="#FFFFFF" 
          />
          <Text style={styles.searchButtonText}>
            Tìm công thức ({getSelectedCount()})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ScanResultScreen;