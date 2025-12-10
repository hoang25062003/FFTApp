import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// @ts-ignore
import Slider from '@react-native-community/slider';

// Import styles từ CreateDietRestrictionScreen

export const BRAND_COLOR = '#8BC34A';
// Types
type SortOption = 'newest' | 'popular' | 'rating' | 'time';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface FilterDialogProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    onReset: () => void;
}

export interface FilterState {
    sortBy: SortOption;
    difficulty: DifficultyLevel[];
    servings: number;
    cookingTime: number; // phút
    tags: string[];
    ingredients: string[];
}

const FilterDialog: React.FC<FilterDialogProps> = ({
    visible,
    onClose,
    onApply,
    onReset
}) => {
    // State
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [difficulty, setDifficulty] = useState<DifficultyLevel[]>([]);
    const [servings, setServings] = useState(6);
    const [cookingTime, setCookingTime] = useState(50);
    const [tagSearch, setTagSearch] = useState('');
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    // Sort options
    const sortOptions: { value: SortOption; label: string; icon: string }[] = [
        { value: 'newest', label: 'Mới nhất', icon: 'clock-outline' },
        { value: 'popular', label: 'Phổ biến', icon: 'fire' },
        { value: 'rating', label: 'Đánh giá cao', icon: 'star' },
        { value: 'time', label: 'Thời gian nấu', icon: 'timer-outline' }
    ];

    // Difficulty config
    const difficultyConfig = {
        easy: { label: 'Dễ', color: '#10B981', bg: '#D1FAE5' },
        medium: { label: 'Trung bình', color: '#F59E0B', bg: '#FEF3C7' },
        hard: { label: 'Khó', color: '#EF4444', bg: '#FEE2E2' }
    };

    const toggleDifficulty = (level: DifficultyLevel) => {
        setDifficulty(prev =>
            prev.includes(level)
                ? prev.filter(d => d !== level)
                : [...prev, level]
        );
    };

    const handleReset = () => {
        setSortBy('newest');
        setDifficulty([]);
        setServings(6);
        setCookingTime(50);
        setTagSearch('');
        setIngredientSearch('');
        setSelectedTags([]);
        setSelectedIngredients([]);
        onReset();
    };

    const handleApply = () => {
        onApply({
            sortBy,
            difficulty,
            servings,
            cookingTime,
            tags: selectedTags,
            ingredients: selectedIngredients
        });
        onClose();
    };

    // Tính số bộ lọc đang active
    const activeFiltersCount = difficulty.length + selectedTags.length + selectedIngredients.length + (sortBy !== 'newest' ? 1 : 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View >
                    {/* Header */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerBackground}>
                            <View style={styles.decorativeCircle1} />
                            <View style={styles.decorativeCircle2} />
                            <View style={styles.headerContent}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
                                    <Text style={styles.headerSubtitle}>
                                        {activeFiltersCount > 0 
                                            ? `${activeFiltersCount} bộ lọc đang áp dụng`
                                            : 'Chọn tiêu chí lọc món ăn'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.headerIconContainer}
                                    onPress={onClose}
                                >
                                    <Icon name="close" size={24} color="rgba(255,255,255,0.9)" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Reset Button */}
                    <View style={styles.resetButtonContainer}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Icon name="refresh" size={18} color={BRAND_COLOR} />
                            <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Sắp xếp theo */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="sort" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Sắp xếp theo</Text>
                                </View>
                                <View style={styles.optionsGrid}>
                                    {sortOptions.map(option => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.sortOption,
                                                sortBy === option.value && styles.sortOptionActive
                                            ]}
                                            onPress={() => setSortBy(option.value)}
                                        >
                                            <Icon
                                                name={option.icon}
                                                size={20}
                                                color={sortBy === option.value ? BRAND_COLOR : '#6B7280'}
                                            />
                                            <Text
                                                style={[
                                                    styles.sortOptionText,
                                                    sortBy === option.value && styles.sortOptionTextActive
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                            {sortBy === option.value && (
                                                <Icon name="check-circle" size={16} color={BRAND_COLOR} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Độ khó */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="fire" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Độ khó</Text>
                                </View>
                                <View style={styles.difficultyContainer}>
                                    {(Object.keys(difficultyConfig) as DifficultyLevel[]).map(level => {
                                        const config = difficultyConfig[level];
                                        const isSelected = difficulty.includes(level);
                                        return (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.difficultyChip,
                                                    isSelected && { backgroundColor: config.bg, borderColor: config.color }
                                                ]}
                                                onPress={() => toggleDifficulty(level)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.difficultyChipText,
                                                        isSelected && { color: config.color, fontWeight: '700' }
                                                    ]}
                                                >
                                                    {config.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Khẩu phần */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="account-group" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Khẩu phần</Text>
                                </View>
                                <View style={styles.sliderContainer}>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={1}
                                        maximumValue={8}
                                        step={1}
                                        value={servings}
                                        onValueChange={setServings}
                                        minimumTrackTintColor={BRAND_COLOR}
                                        maximumTrackTintColor="#E5E7EB"
                                        thumbTintColor={BRAND_COLOR}
                                    />
                                    <View style={styles.sliderLabels}>
                                        <Text style={styles.sliderLabelText}>1 phần</Text>
                                        <View style={styles.sliderValueBadge}>
                                            <Text style={styles.sliderValueText}>{servings} phần</Text>
                                        </View>
                                        <Text style={styles.sliderLabelText}>8 phần</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Thời gian nấu */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="clock-outline" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Thời gian nấu tối đa</Text>
                                </View>
                                <View style={styles.sliderContainer}>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={5}
                                        maximumValue={240}
                                        step={5}
                                        value={cookingTime}
                                        onValueChange={setCookingTime}
                                        minimumTrackTintColor={BRAND_COLOR}
                                        maximumTrackTintColor="#E5E7EB"
                                        thumbTintColor={BRAND_COLOR}
                                    />
                                    <View style={styles.sliderLabels}>
                                        <Text style={styles.sliderLabelText}>5 phút</Text>
                                        <View style={styles.sliderValueBadge}>
                                            <Text style={styles.sliderValueText}>
                                                {cookingTime >= 60
                                                    ? `${Math.floor(cookingTime / 60)} giờ ${cookingTime % 60 > 0 ? `${cookingTime % 60} phút` : ''}`
                                                    : `${cookingTime} phút`}
                                            </Text>
                                        </View>
                                        <Text style={styles.sliderLabelText}>4 giờ</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Nhãn dán */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="tag-outline" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Nhãn dán</Text>
                                </View>
                                <View style={styles.searchBox}>
                                    <Icon name="magnify" size={20} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Tìm nhãn..."
                                        placeholderTextColor="#9CA3AF"
                                        value={tagSearch}
                                        onChangeText={setTagSearch}
                                    />
                                    {tagSearch.length > 0 && (
                                        <TouchableOpacity onPress={() => setTagSearch('')}>
                                            <Icon name="close-circle" size={18} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Nguyên liệu */}
                        <View style={styles.formCard}>
                            <View style={styles.formSection}>
                                <View style={styles.labelContainer}>
                                    <Icon name="food-apple-outline" size={18} color={BRAND_COLOR} />
                                    <Text style={styles.label}>Nguyên liệu</Text>
                                </View>
                                <View style={styles.searchBox}>
                                    <Icon name="magnify" size={20} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Tìm nguyên liệu..."
                                        placeholderTextColor="#9CA3AF"
                                        value={ingredientSearch}
                                        onChangeText={setIngredientSearch}
                                    />
                                    {ingredientSearch.length > 0 && (
                                        <TouchableOpacity onPress={() => setIngredientSearch('')}>
                                            <Icon name="close-circle" size={18} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = {
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end' as const,
    },
    modalContainer: {
        backgroundColor: '#F8F9FA',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        overflow: 'hidden' as const,
    },
    headerSection: {
        marginBottom: 0,
    },
    headerBackground: {
        height: 100,
        backgroundColor: BRAND_COLOR,
        position: 'relative' as const,
        overflow: 'hidden' as const,
        justifyContent: 'center' as const,
        paddingBottom: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    decorativeCircle1: {
        position: 'absolute' as const,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -40,
        right: -30,
    },
    decorativeCircle2: {
        position: 'absolute' as const,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: -20,
    },
    headerContent: {
        paddingHorizontal: 20,
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800' as const,
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '500' as const,
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    resetButtonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'flex-end' as const,
    },
    resetButton: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: BRAND_COLOR,
    },
    resetButtonText: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: BRAND_COLOR,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    formSection: {
        gap: 12,
    },
    labelContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '700' as const,
        color: '#1F2937',
    },
    optionsGrid: {
        gap: 8,
    },
    sortOption: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        gap: 10,
    },
    sortOptionActive: {
        borderColor: BRAND_COLOR,
        backgroundColor: '#F0F9FF',
    },
    sortOptionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500' as const,
        color: '#6B7280',
    },
    sortOptionTextActive: {
        color: '#1F2937',
        fontWeight: '700' as const,
    },
    difficultyContainer: {
        flexDirection: 'row' as const,
        gap: 8,
    },
    difficultyChip: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center' as const,
    },
    difficultyChipText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#6B7280',
    },
    sliderContainer: {
        gap: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
    },
    sliderLabelText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500' as const,
    },
    sliderValueBadge: {
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    sliderValueText: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: '#FFFFFF',
    },
    searchBox: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937',
    },
    buttonContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    applyButton: {
        flexDirection: 'row' as const,
        backgroundColor: BRAND_COLOR,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: BRAND_COLOR,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700' as const,
    },
};

export default FilterDialog;