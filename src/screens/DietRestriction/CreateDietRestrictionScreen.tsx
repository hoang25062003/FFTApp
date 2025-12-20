import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';

import { useCreateDietRestriction } from '../../hooks/useCreateDietRestriction';
import { styles, BRAND_COLOR, ERROR_COLOR } from './CreateDietRestrictionScreenStyles';

const CreateRestrictionScreen = () => {
    const navigation = useNavigation();
    const {
        scrollViewRef,
        activeTab,
        restrictionType,
        note,
        date,
        selectedItem,
        showDatePicker,
        showTypeDropdown,
        showSelectionModal,
        focusedField,
        listData,
        isLoading,
        searchQuery,
        isSaving,
        errors,
        setNote,
        setShowDatePicker,
        setShowTypeDropdown,
        setShowSelectionModal,
        setSearchQuery,
        handleTabChange,
        handleFocus,
        handleBlur,
        handleOpenSelection,
        handleSelectItem,
        handleTypeSelect,
        handleDateChange,
        handleSave,
        formatDate,
        getRestrictionConfig,
    } = useCreateDietRestriction(navigation);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const RenderError = ({ field }: { field: keyof typeof errors }) => (
        errors[field] ? (
            <Text style={styles.errorText}>
                {errors[field]}
            </Text>
        ) : null
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <HeaderApp isHome={false} onBackPress={handleBackPress} />

            <View style={styles.innerContainer}>
                <ScrollView
                    ref={scrollViewRef}
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
                                onPress={() => handleTabChange('ingredient')}
                            >
                                <Icon name="food-apple-outline" size={20} color={activeTab === 'ingredient' ? '#FFFFFF' : '#6B7280'} />
                                <Text style={[styles.tabText, activeTab === 'ingredient' && styles.activeTabText]}>Nguyên liệu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'group' && styles.activeTabItem]}
                                onPress={() => handleTabChange('group')}
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
                                <Icon 
                                    name="food" 
                                    size={18} 
                                    color={errors.item ? ERROR_COLOR : (focusedField === 'item' ? BRAND_COLOR : BRAND_COLOR)} 
                                />
                                <Text style={styles.label}>
                                    {activeTab === 'ingredient' ? 'Chọn nguyên liệu' : 'Chọn nhóm thực phẩm'}
                                </Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.inputBox,
                                    focusedField === 'item' && styles.inputBoxFocused,
                                    errors.item && styles.inputBoxError
                                ]}
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
                                <Icon 
                                    name="chevron-down" 
                                    size={20} 
                                    color={errors.item ? ERROR_COLOR : BRAND_COLOR} 
                                />
                            </TouchableOpacity>
                            <RenderError field="item" />
                        </View>

                        <View style={styles.divider} />

                        {/* SECTION 2: LOẠI HẠN CHẾ */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon 
                                    name="tag-outline" 
                                    size={18} 
                                    color={focusedField === 'type' ? BRAND_COLOR : BRAND_COLOR} 
                                />
                                <Text style={styles.label}>Loại hạn chế</Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.inputBox,
                                    focusedField === 'type' && styles.inputBoxFocused
                                ]}
                                onPress={() => {
                                    handleFocus('type');
                                    setShowTypeDropdown(!showTypeDropdown);
                                }}
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
                                    {(['ALLERGY', 'DISLIKE', 'TEMPORARYAVOID'] as const).map((type) => {
                                        const config = getRestrictionConfig(type);
                                        return (
                                            <TouchableOpacity
                                                key={type}
                                                style={styles.dropdownItem}
                                                onPress={() => handleTypeSelect(type)}
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
                                        <Icon 
                                            name="calendar-clock" 
                                            size={18} 
                                            color={errors.date ? ERROR_COLOR : (focusedField === 'date' ? BRAND_COLOR : BRAND_COLOR)} 
                                        />
                                        <Text style={styles.label}>Ngày hết hạn</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={[
                                            styles.inputBox,
                                            focusedField === 'date' && styles.inputBoxFocused,
                                            errors.date && styles.inputBoxError
                                        ]} 
                                        onPress={() => {
                                            handleFocus('date');
                                            setShowDatePicker(true);
                                        }}
                                    >
                                        <Text style={styles.inputText}>{formatDate(date)}</Text>
                                        <Icon 
                                            name="calendar-outline" 
                                            size={20} 
                                            color={errors.date ? ERROR_COLOR : BRAND_COLOR} 
                                        />
                                    </TouchableOpacity>
                                    <RenderError field="date" />
                                    {showDatePicker && Platform.OS === 'android' && (
                                        <DateTimePicker 
                                            value={date} 
                                            mode="date" 
                                            is24Hour={true} 
                                            display="default" 
                                            onChange={handleDateChange}
                                            minimumDate={new Date()}
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
                                <Text style={styles.optional}>(tùy chọn)</Text>
                            </View>
                            <View style={[
                                styles.textAreaContainer,
                                focusedField === 'note' && styles.textAreaContainerFocused
                            ]}>
                                <TextInput
                                    style={styles.textArea}
                                    multiline
                                    placeholder="Ví dụ: Dị ứng nghiêm trọng..."
                                    placeholderTextColor="#9CA3AF"
                                    value={note}
                                    onChangeText={setNote}
                                    onFocus={() => handleFocus('note')}
                                    onBlur={handleBlur}
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
                onRequestClose={() => {
                    setShowSelectionModal(false);
                    handleBlur();
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', padding: 20 }}>
                        
                        {/* Modal Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                {activeTab === 'ingredient' ? 'Tìm kiếm nguyên liệu' : 'Chọn nhóm thực phẩm'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setShowSelectionModal(false);
                                handleBlur();
                            }}>
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
                                data={listData}
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