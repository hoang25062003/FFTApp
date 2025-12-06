import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    TouchableWithoutFeedback, // Vẫn import nhưng không dùng cho toàn bộ màn hình
    Keyboard,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';

// Import styles từ file riêng
import { styles, BRAND_COLOR } from './CreateDietRestrictionScreenStyles'; 

// Khai báo Types
type TabType = 'ingredient' | 'group';
type RestrictionType = 'ALLERGY' | 'DISLIKE' | 'TEMPORARYAVOID';

const CreateRestrictionScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<TabType>('ingredient');
    const [restrictionType, setRestrictionType] = useState<RestrictionType>('ALLERGY');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDate(currentDate);
        }
    };

    const showDatepickerMode = () => {
        // Ẩn dropdown loại hạn chế trước khi mở date picker
        if (showTypeDropdown) {
            setShowTypeDropdown(false);
        }
        setShowDatePicker(true);
    };

    const formatDate = (rawDate: Date) => {
        // Định dạng ngày tháng theo kiểu Việt Nam: DD thg MM, YYYY
        return `${rawDate.getDate().toString().padStart(2, '0')} thg ${(rawDate.getMonth() + 1)}, ${rawDate.getFullYear()}`;
    };

    const handleSave = () => {
        // Ẩn bàn phím và dropdown khi lưu
        Keyboard.dismiss();
        setShowTypeDropdown(false); 
        console.log({
            activeTab,
            restrictionType,
            expirationDate: restrictionType === 'TEMPORARYAVOID' ? formatDate(date) : null,
            note,
        });
        // Logic lưu hạn chế...
    };

    const getRestrictionConfig = (type: RestrictionType) => {
        switch (type) {
            case 'ALLERGY':
                return { label: 'Dị ứng', icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2', borderColor: '#FECACA' };
            case 'DISLIKE':
                return { label: 'Không thích', icon: 'thumb-down-outline', color: '#F59E0B', bg: '#FFFBEB', borderColor: '#FDE68A' };
            case 'TEMPORARYAVOID':
                return { label: 'Tạm tránh', icon: 'clock-time-four-outline', color: '#8B5CF6', bg: '#FAF5FF', borderColor: '#DDD6FE' };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* 1. Header Navigation chuẩn của App */}
            <HeaderApp
                isHome={false}
                onBackPress={handleBackPress}
            />

            {/* **KHẮC PHỤC LỖI SCROLL Ở ĐÂY:** Bỏ TouchableWithoutFeedback ngoài cùng,
                để ScrollView tự xử lý sự kiện kéo (drag) trên toàn bộ khu vực.
                Dùng View để giữ style container bên trong. */}
            <View style={styles.innerContainer}>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    
                    // *** THAY ĐỔI QUAN TRỌNG ***
                    // 1. Tự động ẩn bàn phím khi người dùng bắt đầu kéo màn hình
                    keyboardDismissMode="on-drag" 
                    // 2. Cho phép các Touchable và Input bên trong ScrollView hoạt động tốt
                    keyboardShouldPersistTaps="handled" 
                    // *** KẾT THÚC THAY ĐỔI ***
                >
                    {/* 2. Header Section Trang trí */}
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
                                onPress={() => {
                                    setActiveTab('ingredient');
                                    Keyboard.dismiss();
                                }}
                            >
                                <Icon
                                    name="food-apple-outline"
                                    size={20}
                                    color={activeTab === 'ingredient' ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[styles.tabText, activeTab === 'ingredient' && styles.activeTabText]}>
                                    Nguyên liệu
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'group' && styles.activeTabItem]}
                                onPress={() => {
                                    setActiveTab('group');
                                    Keyboard.dismiss();
                                }}
                            >
                                <Icon
                                    name="food-variant"
                                    size={20}
                                    color={activeTab === 'group' ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>
                                    Nhóm thực phẩm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="food" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>
                                    {activeTab === 'ingredient' ? 'Chọn nguyên liệu' : 'Chọn nhóm thực phẩm'}
                                </Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.inputBox}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    // Thêm logic chuyển sang màn hình chọn nguyên liệu/nhóm
                                }}
                            >
                                <Text style={styles.placeholderText}>
                                    {activeTab === 'ingredient' ? 'Tìm kiếm nguyên liệu...' : 'Chọn nhóm...'}
                                </Text>
                                <Icon name="chevron-down" size={20} color={BRAND_COLOR} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Restriction Type */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="tag-outline" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>Loại hạn chế</Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.inputBox}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setShowTypeDropdown(!showTypeDropdown);
                                }}
                            >
                                <View style={styles.typeDisplayContainer}>
                                    <View
                                        style={[
                                            styles.typeIconBadge,
                                            { backgroundColor: getRestrictionConfig(restrictionType).bg }
                                        ]}
                                    >
                                        <Icon
                                            name={getRestrictionConfig(restrictionType).icon}
                                            size={16}
                                            color={getRestrictionConfig(restrictionType).color}
                                        />
                                    </View>
                                    <Text style={styles.inputText}>
                                        {getRestrictionConfig(restrictionType).label}
                                    </Text>
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
                                                onPress={() => {
                                                    setRestrictionType(type);
                                                    setShowTypeDropdown(false);
                                                }}
                                            >
                                                <View
                                                    style={[
                                                        styles.typeIconBadge,
                                                        { backgroundColor: config.bg }
                                                    ]}
                                                >
                                                    <Icon name={config.icon} size={16} color={config.color} />
                                                </View>
                                                <Text style={styles.dropdownItemText}>{config.label}</Text>
                                                {restrictionType === type && (
                                                    <Icon name="check" size={20} color={BRAND_COLOR} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* Expiry Date for Temporary Avoid */}
                        {restrictionType === 'TEMPORARYAVOID' && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.formSection}>
                                    <View style={styles.labelContainer}>
                                        <Icon name="calendar-clock" size={18} color={BRAND_COLOR} />
                                        <Text style={styles.label}>Ngày hết hạn</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TouchableOpacity style={styles.inputBox} onPress={showDatepickerMode}>
                                        <Text style={styles.inputText}>{formatDate(date)}</Text>
                                        <Icon name="calendar-outline" size={20} color={BRAND_COLOR} />
                                    </TouchableOpacity>

                                    {/* Date Picker Logic */}
                                    {showDatePicker && (
                                        Platform.OS === 'android' ? (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                is24Hour={true}
                                                display="default"
                                                onChange={onChangeDate}
                                            />
                                        ) : (
                                            <Modal
                                                transparent={true}
                                                animationType="slide"
                                                visible={showDatePicker}
                                                onRequestClose={() => setShowDatePicker(false)}
                                            >
                                                <View style={styles.iosModalOverlay}>
                                                    <View style={styles.iosDatePickerContainer}>
                                                        <View style={styles.iosToolbar}>
                                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                                <Text style={styles.iosCancelText}>Hủy</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                                <Text style={styles.iosConfirmText}>Xong</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <DateTimePicker
                                                            value={date}
                                                            mode="date"
                                                            display="spinner"
                                                            onChange={onChangeDate}
                                                            locale="vi-VN"
                                                            textColor="black"
                                                        />
                                                    </View>
                                                </View>
                                            </Modal>
                                        )
                                    )}
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        {/* Note Section */}
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
                                    placeholder="Ví dụ: Dị ứng nghiêm trọng, cần tránh hoàn toàn..."
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
                            <Text style={styles.infoText}>
                                Thông tin này là cơ sở để hệ thống cảnh báo các món ăn có chứa nguyên liệu không phù hợp (dị ứng, tạm tránh, không thích) trong các đề xuất thực đơn.
                            </Text>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Thêm Hạn Chế</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CreateRestrictionScreen;