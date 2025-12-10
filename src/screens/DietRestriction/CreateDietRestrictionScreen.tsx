import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Keyboard,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';

// Import Services
import IngredientService, { Ingredient } from '../../services/IngredientService';
import IngredientCategoryService, { IngredientCategory } from '../../services/IngredientCategoryService';
import DietRestrictionService, { 
    createIngredientRestriction, 
    createIngredientCategoryRestriction,
    RestrictionType as ApiRestrictionType
} from '../../services/DietRestrictionService';

// Import styles
import { styles, BRAND_COLOR } from './CreateDietRestrictionScreenStyles';

// Khai báo Types
type TabType = 'ingredient' | 'group';
type RestrictionType = 'ALLERGY' | 'DISLIKE' | 'TEMPORARYAVOID';

// Type chung cho item được chọn
type SelectionItem = {
    id: string;
    name: string;
    type: 'INGREDIENT' | 'LABEL';
};

const CreateRestrictionScreen = () => {
    const navigation = useNavigation();
    
    // Form State
    const [activeTab, setActiveTab] = useState<TabType>('ingredient');
    const [restrictionType, setRestrictionType] = useState<RestrictionType>('ALLERGY');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    
    // Selection State
    const [selectedItem, setSelectedItem] = useState<SelectionItem | null>(null);

    // Modal & Data State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    
    // State cho Modal chọn Nguyên liệu/Nhóm
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [listData, setListData] = useState<(Ingredient | IngredientCategory)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // State cho loading khi submit
    const [isSaving, setIsSaving] = useState(false);

    // Reset selected item khi đổi tab
    useEffect(() => {
        setSelectedItem(null);
        setSearchQuery('');
        setListData([]);
    }, [activeTab]);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    // GỌI API LẤY DANH SÁCH
    const fetchSelectionData = async () => {
        setIsLoading(true);
        setListData([]);
        try {
            if (activeTab === 'ingredient') {
                // ✅ Ingredient có phân trang, trả về { items, pageNumber, ... }
                const data = await IngredientService.getIngredients();
                setListData(data.items || []); 
            } else {
                // ✅ IngredientCategory KHÔNG có phân trang, trả về mảng trực tiếp
                const data = await IngredientCategoryService.getIngredientCategories();
                setListData(data || []);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách dữ liệu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSelection = () => {
        Keyboard.dismiss();
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
    };

    // Lọc dữ liệu client-side
    const filteredData = listData.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ✅ LOGIC SAVE - TÍCH HỢP API
    const handleSave = async () => {
        Keyboard.dismiss();
        setShowTypeDropdown(false);

        // Validate
        if (!selectedItem) {
            Alert.alert(
                'Thiếu thông tin', 
                `Vui lòng chọn ${activeTab === 'ingredient' ? 'nguyên liệu' : 'nhóm thực phẩm'}.`
            );
            return;
        }

        setIsSaving(true);

        try {
            // Chuẩn bị expiredAtUtc (chỉ có khi là TEMPORARYAVOID)
            const expiredAtUtc = restrictionType === 'TEMPORARYAVOID' 
                ? date.toISOString() 
                : undefined;

            if (activeTab === 'ingredient') {
                // ✅ GỌI API TẠO RESTRICTION CHO NGUYÊN LIỆU
                await createIngredientRestriction({
                    ingredientId: selectedItem.id,
                    type: restrictionType as ApiRestrictionType,
                    notes: note.trim() || undefined,
                    expiredAtUtc: expiredAtUtc
                });
            } else {
                // ✅ GỌI API TẠO RESTRICTION CHO NHÓM THỰC PHẨM (LABEL/CATEGORY)
                await createIngredientCategoryRestriction({
                    ingredientCategoryId: selectedItem.id,
                    type: restrictionType as ApiRestrictionType,
                    notes: note.trim() || undefined,
                    expiredAtUtc: expiredAtUtc
                });
            }

            // Thành công
            Alert.alert(
                'Thành công', 
                `Đã thêm hạn chế cho ${selectedItem.name}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form hoặc quay lại màn hình trước
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            }
                        }
                    }
                ]
            );

        } catch (error: any) {
            console.error('Lỗi khi tạo restriction:', error);
            Alert.alert(
                'Lỗi', 
                error?.message || 'Không thể thêm hạn chế. Vui lòng thử lại.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Date Picker handlers
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) setDate(currentDate);
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

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <HeaderApp isHome={false} onBackPress={handleBackPress} />

            <View style={styles.innerContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerBackground}>
                            <View style={styles.decorativeCircle1} />
                            <View style={styles.decorativeCircle2} />
                            <View style={styles.headerContent}>
                                <View>
                                    <Text style={styles.headerTitle}>Thêm Hạn Chế Mới</Text>
                                    <Text style={styles.headerSubtitle}>Quản lý thực phẩm bạn cần tránh</Text>
                                </View>
                                <View style={styles.headerIconContainer}>
                                    <Icon name="playlist-plus" size={28} color="rgba(255,255,255,0.8)" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tabs Card */}
                    <View style={styles.tabCard}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'ingredient' && styles.activeTabItem]}
                                onPress={() => setActiveTab('ingredient')}
                            >
                                <Icon name="food-apple-outline" size={20} color={activeTab === 'ingredient' ? '#FFFFFF' : '#6B7280'} />
                                <Text style={[styles.tabText, activeTab === 'ingredient' && styles.activeTabText]}>Nguyên liệu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'group' && styles.activeTabItem]}
                                onPress={() => setActiveTab('group')}
                            >
                                <Icon name="food-variant" size={20} color={activeTab === 'group' ? '#FFFFFF' : '#6B7280'} />
                                <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>Nhóm thực phẩm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* SECTION 1: CHỌN NGUYÊN LIỆU / NHÓM */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="food" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>
                                    {activeTab === 'ingredient' ? 'Chọn nguyên liệu' : 'Chọn nhóm thực phẩm'}
                                </Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.inputBox, !selectedItem && { borderColor: '#E5E7EB' }]}
                                onPress={handleOpenSelection}
                            >
                                {selectedItem ? (
                                    <Text style={[styles.inputText, { color: '#111827', fontWeight: '500' }]}>
                                        {selectedItem.name}
                                    </Text>
                                ) : (
                                    <Text style={styles.placeholderText}>
                                        {activeTab === 'ingredient' ? 'Nhấn để tìm nguyên liệu...' : 'Nhấn để chọn nhóm...'}
                                    </Text>
                                )}
                                <Icon name="chevron-down" size={20} color={BRAND_COLOR} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* SECTION 2: LOẠI HẠN CHẾ */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="tag-outline" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>Loại hạn chế</Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.inputBox}
                                onPress={() => { Keyboard.dismiss(); setShowTypeDropdown(!showTypeDropdown); }}
                            >
                                <View style={styles.typeDisplayContainer}>
                                    <View style={[styles.typeIconBadge, { backgroundColor: getRestrictionConfig(restrictionType).bg }]}>
                                        <Icon name={getRestrictionConfig(restrictionType).icon} size={16} color={getRestrictionConfig(restrictionType).color} />
                                    </View>
                                    <Text style={styles.inputText}>{getRestrictionConfig(restrictionType).label}</Text>
                                </View>
                                <Icon name="chevron-down" size={20} color={BRAND_COLOR} />
                            </TouchableOpacity>

                            {showTypeDropdown && (
                                <View style={styles.dropdownList}>
                                    {(['ALLERGY', 'DISLIKE', 'TEMPORARYAVOID'] as RestrictionType[]).map((type) => {
                                        const config = getRestrictionConfig(type);
                                        return (
                                            <TouchableOpacity
                                                key={type}
                                                style={styles.dropdownItem}
                                                onPress={() => { setRestrictionType(type); setShowTypeDropdown(false); }}
                                            >
                                                <View style={[styles.typeIconBadge, { backgroundColor: config.bg }]}>
                                                    <Icon name={config.icon} size={16} color={config.color} />
                                                </View>
                                                <Text style={styles.dropdownItemText}>{config.label}</Text>
                                                {restrictionType === type && <Icon name="check" size={20} color={BRAND_COLOR} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* SECTION 3: DATE PICKER */}
                        {restrictionType === 'TEMPORARYAVOID' && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.formSection}>
                                    <View style={styles.labelContainer}>
                                        <Icon name="calendar-clock" size={18} color={BRAND_COLOR} />
                                        <Text style={styles.label}>Ngày hết hạn</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
                                        <Text style={styles.inputText}>{formatDate(date)}</Text>
                                        <Icon name="calendar-outline" size={20} color={BRAND_COLOR} />
                                    </TouchableOpacity>
                                    {showDatePicker && Platform.OS === 'android' && (
                                        <DateTimePicker 
                                            value={date} 
                                            mode="date" 
                                            is24Hour={true} 
                                            display="default" 
                                            onChange={onChangeDate} 
                                        />
                                    )}
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        {/* SECTION 4: NOTE */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="note-text-outline" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>Ghi chú</Text>
                                <Text style={styles.optional}>(tuỳ chọn)</Text>
                            </View>
                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    multiline
                                    placeholder="Ví dụ: Dị ứng nghiêm trọng..."
                                    placeholderTextColor="#9CA3AF"
                                    value={note}
                                    onChangeText={setNote}
                                    maxLength={255}
                                />
                            </View>
                            <View style={styles.charCountContainer}>
                                <Icon name="text" size={12} color="#9CA3AF" />
                                <Text style={styles.charCount}>{note.length}/255 ký tự</Text>
                            </View>
                        </View>
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Icon name="information-outline" size={20} color={BRAND_COLOR} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Lưu ý quan trọng</Text>
                            <Text style={styles.infoText}>Thông tin này giúp hệ thống cảnh báo món ăn không phù hợp.</Text>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={[styles.saveButton, isSaving && { opacity: 0.6 }]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Đang xử lý...</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Thêm Hạn Chế</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>

            {/* MODAL CHỌN ITEM */}
            <Modal
                visible={showSelectionModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSelectionModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', padding: 20 }}>
                        
                        {/* Modal Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                {activeTab === 'ingredient' ? 'Tìm kiếm nguyên liệu' : 'Chọn nhóm thực phẩm'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowSelectionModal(false)}>
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={{ 
                            flexDirection: 'row', alignItems: 'center', 
                            backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 15 
                        }}>
                            <Icon name="magnify" size={20} color="#9CA3AF" />
                            <TextInput
                                style={{ flex: 1, marginLeft: 8, color: '#1F2937' }}
                                placeholder="Nhập tên để tìm..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Icon name="close-circle" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* List Data */}
                        {isLoading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={BRAND_COLOR} />
                                <Text style={{ marginTop: 10, color: '#6B7280' }}>Đang tải dữ liệu...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                                        <Icon name="database-off" size={40} color="#D1D5DB" />
                                        <Text style={{ marginTop: 10, color: '#9CA3AF' }}>Không tìm thấy kết quả nào</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{ 
                                            paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
                                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                                        }}
                                        onPress={() => handleSelectItem(item)}
                                    >
                                        <Text style={{ fontSize: 16, color: '#374151' }}>{item.name}</Text>
                                        {selectedItem?.id === item.id && (
                                            <Icon name="check" size={20} color={BRAND_COLOR} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default CreateRestrictionScreen;