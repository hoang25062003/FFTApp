import { useState, useRef } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';
import IngredientService, { Ingredient } from '../services/IngredientService';
import IngredientCategoryService, { IngredientCategory } from '../services/IngredientCategoryService';
import {
  createIngredientRestriction,
  createIngredientCategoryRestriction,
  RestrictionType as ApiRestrictionType
} from '../services/DietRestrictionService';

type TabType = 'ingredient' | 'group';
type RestrictionType = 'ALLERGY' | 'DISLIKE' | 'TEMPORARYAVOID';
type FocusedField = 'item' | 'type' | 'date' | 'note' | null;

export interface SelectionItem {
  id: string;
  name: string;
  type: 'INGREDIENT' | 'LABEL';
}

interface DietRestrictionErrors {
  item?: string;
  type?: string;
  date?: string;
  list?: string; // Lưu lỗi khi fetch danh sách nguyên liệu/nhóm
}

export const useCreateDietRestriction = (navigation: any) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper: Lấy thời điểm bắt đầu của ngày mai
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // --- Form State ---
  const [activeTab, setActiveTab] = useState<TabType>('ingredient');
  const [restrictionType, setRestrictionType] = useState<RestrictionType>('ALLERGY');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTomorrow()); // Mặc định là ngày mai
  const [selectedItem, setSelectedItem] = useState<SelectionItem | null>(null);

  // --- UI State ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  // --- Data State ---
  const [listData, setListData] = useState<(Ingredient | IngredientCategory)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<DietRestrictionErrors>({});

  // Fetch dữ liệu cho modal: Lỗi được đẩy vào errors.list thay vì Alert
  const fetchSelectionData = async () => {
    setIsLoading(true);
    setListData([]);
    // Xóa lỗi danh sách cũ trước khi tải mới
    setErrors(prev => ({ ...prev, list: undefined }));

    try {
      if (activeTab === 'ingredient') {
        const data = await IngredientService.getIngredients();
        setListData(data.items || []);
      } else {
        const data = await IngredientCategoryService.getIngredientCategories();
        setListData(data || []);
      }
    } catch (error: any) {
      const context = activeTab === 'ingredient' ? 'nguyên liệu' : 'nhóm thực phẩm';
      // Gán thông báo lỗi vào state để UI hiển thị
      setErrors(prev => ({
        ...prev,
        list: `Không thể tải danh sách ${context}: ${error.message}`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setSearchQuery('');
    setListData([]);
    setErrors({}); // Reset lỗi khi đổi tab
  };

  const handleFocus = (field: FocusedField) => {
    setFocusedField(field);
    if (field && errors[field as keyof DietRestrictionErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof DietRestrictionErrors];
        return newErrors;
      });
    }
  };

  const handleBlur = () => setFocusedField(null);

  const handleOpenSelection = () => {
    Keyboard.dismiss();
    handleFocus('item');
    setShowSelectionModal(true);
    fetchSelectionData();
  };

  const handleSelectItem = (item: Ingredient | IngredientCategory) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      type: activeTab === 'ingredient' ? 'INGREDIENT' : 'LABEL'
    });
    setShowSelectionModal(false);
    setSearchQuery('');
    handleBlur();
  };

  const handleTypeSelect = (type: RestrictionType) => {
    setRestrictionType(type);
    setShowTypeDropdown(false);
    handleBlur();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (errors.date) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.date;
          return newErrors;
        });
      }
    }
    handleBlur();
  };

  const validateForm = (): boolean => {
    const newErrors: DietRestrictionErrors = {};

    if (!selectedItem) {
      newErrors.item = `Vui lòng chọn ${activeTab === 'ingredient' ? 'nguyên liệu' : 'nhóm thực phẩm'}`;
    }

    if (restrictionType === 'TEMPORARYAVOID') {
      const tomorrow = getTomorrow();
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly < tomorrow) {
        newErrors.date = 'Ngày hết hạn phải từ ngày mai trở đi';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.item) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else if (newErrors.date) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    setShowTypeDropdown(false);

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const expiredAtUtc = restrictionType === 'TEMPORARYAVOID' 
        ? date.toISOString() 
        : undefined;

      if (activeTab === 'ingredient') {
        await createIngredientRestriction({
          ingredientId: selectedItem!.id,
          type: restrictionType as ApiRestrictionType,
          notes: note.trim() || undefined,
          expiredAtUtc: expiredAtUtc
        });
      } else {
        await createIngredientCategoryRestriction({
          ingredientCategoryId: selectedItem!.id,
          type: restrictionType as ApiRestrictionType,
          notes: note.trim() || undefined,
          expiredAtUtc: expiredAtUtc
        });
      }

      Alert.alert(
        'Thành công',
        `Đã thêm hạn chế cho ${selectedItem!.name}`,
        [{ text: 'OK', onPress: () => navigation.canGoBack() && navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu hạn chế');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (rawDate: Date) => {
    return `${rawDate.getDate().toString().padStart(2, '0')} thg ${(rawDate.getMonth() + 1)}, ${rawDate.getFullYear()}`;
  };

  const getRestrictionConfig = (type: RestrictionType) => {
    switch (type) {
      case 'ALLERGY': return { label: 'Dị ứng', icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2' };
      case 'DISLIKE': return { label: 'Không thích', icon: 'thumb-down-outline', color: '#F59E0B', bg: '#FFFBEB' };
      case 'TEMPORARYAVOID': return { label: 'Tạm tránh', icon: 'clock-time-four-outline', color: '#8B5CF6', bg: '#FAF5FF' };
    }
  };

  const filteredData = listData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    scrollViewRef, activeTab, restrictionType, note, date, selectedItem,
    showDatePicker, showTypeDropdown, showSelectionModal, focusedField,
    listData: filteredData, isLoading, searchQuery, isSaving, errors,
    setNote, setShowDatePicker, setShowTypeDropdown, setShowSelectionModal, setSearchQuery,
    handleTabChange, handleFocus, handleBlur, handleOpenSelection, handleSelectItem,
    handleTypeSelect, handleDateChange, handleSave, formatDate, getRestrictionConfig, getTomorrow, fetchSelectionData
  };
};