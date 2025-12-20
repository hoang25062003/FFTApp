import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import HeaderApp from '../../components/HeaderApp';
import { styles, BRAND_COLOR } from './CreateGoalScreenStyles';
import { useEditGoal } from '../../hooks/userEditGoal';

const ERROR_COLOR = '#EF4444';

type ParamList = {
    EditHealthGoal: {
        goalId: string;
    };
};

const EditGoalScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ParamList, 'EditHealthGoal'>>();
    const { goalId } = route.params;

    const {
        goalNameRef,
        goalDescriptionRef,
        goalName,
        setGoalName,
        goalDescription,
        setGoalDescription,
        targets,
        isLoadingData,
        availableNutrients,
        showNutrientModal,
        setShowNutrientModal,
        searchQuery,
        setSearchQuery,
        isSaving,
        focusedField,
        errors,
        handleFocus,
        handleBlur,
        canUseEnergyPercent,
        handleAddTarget,
        handleRemoveTarget,
        updateTarget,
        getPriorityConfig,
        handleSave,
    } = useEditGoal(navigation, goalId);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const RenderError = ({ message }: { message?: string }) => (
        message ? (
            <Text style={{ color: ERROR_COLOR, fontSize: 12, marginTop: 4, marginLeft: 4, lineHeight: 16 }}>
                {message}
            </Text>
        ) : null
    );

    if (isLoadingData) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={BRAND_COLOR} />
                <Text style={{ marginTop: 10, color: '#6B7280' }}>Đang tải dữ liệu...</Text>
            </SafeAreaView>
        );
    }

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
                                    <Text style={styles.headerTitle}>Chỉnh Sửa Mục Tiêu</Text>
                                    <Text style={styles.headerSubtitle}>Cập nhật thông tin và chỉ số dinh dưỡng</Text>
                                </View>
                                <View style={styles.headerIconContainer}>
                                    <Icon name="file-document-edit-outline" size={28} color="rgba(255,255,255,0.8)" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Goal Name */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="text-box-outline" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>Tên mục tiêu</Text>
                                <Text style={styles.required}>*</Text>
                            </View>
                            <TextInput
                                ref={goalNameRef}
                                style={[
                                    styles.textInput,
                                    focusedField === 'goalName' && { borderColor: BRAND_COLOR, borderWidth: 2 },
                                    errors.goalName && { borderColor: ERROR_COLOR }
                                ]}
                                placeholder="Ví dụ: Giảm cân, Tăng cơ..."
                                placeholderTextColor="#9CA3AF"
                                value={goalName}
                                onChangeText={setGoalName}
                                onFocus={() => handleFocus('goalName')}
                                onBlur={handleBlur}
                                maxLength={100}
                            />
                            <RenderError message={errors.goalName} />
                        </View>

                        <View style={styles.divider} />

                        {/* Goal Description */}
                        <View style={styles.formSection}>
                            <View style={styles.labelContainer}>
                                <Icon name="note-text-outline" size={18} color={BRAND_COLOR} />
                                <Text style={styles.label}>Mô tả</Text>
                                <Text style={styles.optional}>(tùy chọn)</Text>
                            </View>
                            <View style={[
                                styles.textAreaContainer,
                                focusedField === 'goalDescription' && { borderColor: BRAND_COLOR, borderWidth: 2 }
                            ]}>
                                <TextInput
                                    ref={goalDescriptionRef}
                                    style={styles.textArea}
                                    multiline
                                    placeholder="Mô tả mục tiêu sức khỏe của bạn..."
                                    placeholderTextColor="#9CA3AF"
                                    value={goalDescription}
                                    onChangeText={setGoalDescription}
                                    onFocus={() => handleFocus('goalDescription')}
                                    onBlur={handleBlur}
                                    maxLength={255}
                                />
                            </View>
                            <View style={styles.charCountContainer}>
                                <Icon name="text" size={12} color="#9CA3AF" />
                                <Text style={styles.charCount}>{goalDescription.length}/255 ký tự</Text>
                            </View>
                        </View>
                    </View>

                    {/* Nutrient Targets Section Header */}
                    <View style={styles.targetSectionHeader}>
                        <View style={styles.targetHeaderLeft}>
                            <Icon name="pill" size={20} color={BRAND_COLOR} />
                            <Text style={styles.targetSectionTitle}>Chỉ Số Dinh Dưỡng</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.addTargetButton}
                            onPress={() => setShowNutrientModal(true)}
                        >
                            <Icon name="plus" size={20} color="#FFFFFF" />
                            <Text style={styles.addTargetText}>Thêm</Text>
                        </TouchableOpacity>
                    </View>

                    {targets.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="clipboard-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateText}>Chưa có chỉ số dinh dưỡng nào</Text>
                            <Text style={styles.emptyStateSubtext}>Nhấn "Thêm" để bắt đầu</Text>
                        </View>
                    ) : (
                        targets.map((target, index) => {
                            const pConfig = getPriorityConfig(target.weight);
                            const targetErrors = errors.targets?.[index] || {};
                            
                            return (
                                <View key={index} style={styles.targetCard}>
                                    <View style={styles.targetHeader}>
                                        <View style={styles.targetTitleContainer}>
                                            <View style={styles.targetIconBadge}>
                                                <Icon name="pill" size={16} color={BRAND_COLOR} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.targetName}>{target.name}</Text>
                                                <Text style={styles.targetUnit}>Đơn vị: {target.unit}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveTarget(index)}
                                        >
                                            <Icon name="close-circle" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Target Type Selector */}
                                    {canUseEnergyPercent(target.nutrientId) && (
                                        <>
                                            <View style={styles.divider} />
                                            <View style={styles.targetTypeContainer}>
                                                <View style={styles.labelContainer}>
                                                    <Icon name="swap-horizontal" size={16} color={BRAND_COLOR} />
                                                    <Text style={styles.targetTypeLabel}>Loại Mục Tiêu</Text>
                                                </View>
                                                <View style={styles.targetTypeTabs}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.targetTypeTab,
                                                            target.targetType === 'ABSOLUTE' && styles.activeTargetTypeTab
                                                        ]}
                                                        onPress={() => updateTarget(index, 'targetType', 'ABSOLUTE')}
                                                    >
                                                        <Text style={[
                                                            styles.targetTypeTabText,
                                                            target.targetType === 'ABSOLUTE' && styles.activeTargetTypeTabText
                                                        ]}>
                                                            Tuyệt Đối
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.targetTypeTab,
                                                            target.targetType === 'ENERGYPERCENT' && styles.activeTargetTypeTab
                                                        ]}
                                                        onPress={() => updateTarget(index, 'targetType', 'ENERGYPERCENT')}
                                                    >
                                                        <Text style={[
                                                            styles.targetTypeTabText,
                                                            target.targetType === 'ENERGYPERCENT' && styles.activeTargetTypeTabText
                                                        ]}>
                                                            % Năng Lượng
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </>
                                    )}

                                    <View style={styles.divider} />

                                    {/* Value Inputs */}
                                    {target.targetType === 'ABSOLUTE' ? (
                                        <View style={styles.valueSection}>
                                            <View style={styles.labelContainer}>
                                                <Icon name="chart-line" size={16} color={BRAND_COLOR} />
                                                <Text style={styles.valueSectionLabel}>Khoảng Giá Trị</Text>
                                            </View>
                                            <View style={styles.valueRow}>
                                                <View style={styles.valueInputContainer}>
                                                    <Text style={styles.valueLabel}>Tối Thiểu</Text>
                                                    <View style={[
                                                        styles.valueInputWrapper,
                                                        targetErrors.minValue && { borderColor: ERROR_COLOR, borderWidth: 1.5, borderRadius: 10 }
                                                    ]}>
                                                        <TextInput
                                                            style={[
                                                                styles.valueInput,
                                                                focusedField === `target_${index}_minValue` && { borderColor: BRAND_COLOR, borderWidth: 2 },
                                                                targetErrors.minValue && { borderColor: ERROR_COLOR }
                                                            ]}
                                                            keyboardType="decimal-pad"
                                                            value={target.minValue.toString()}
                                                            onChangeText={(text) => updateTarget(index, 'minValue', text)}
                                                            onFocus={() => handleFocus(`target_${index}_minValue`)}
                                                            onBlur={handleBlur}
                                                            placeholder="0"
                                                            placeholderTextColor="#9CA3AF"
                                                        />
                                                    </View>
                                                    <RenderError message={targetErrors.minValue} />
                                                    {!targetErrors.minValue && <Text style={styles.unitLabel}>{target.unit}</Text>}
                                                </View>
                                                <View style={styles.arrowContainer}>
                                                    <Icon name="arrow-right" size={20} color="#D1D5DB" />
                                                </View>
                                                <View style={styles.valueInputContainer}>
                                                    <Text style={styles.valueLabel}>Tối Đa</Text>
                                                    <View style={[
                                                        styles.valueInputWrapper,
                                                        targetErrors.maxValue && { borderColor: ERROR_COLOR, borderWidth: 1.5, borderRadius: 10 }
                                                    ]}>
                                                        <TextInput
                                                            style={[
                                                                styles.valueInput,
                                                                focusedField === `target_${index}_maxValue` && { borderColor: BRAND_COLOR, borderWidth: 2 },
                                                                targetErrors.maxValue && { borderColor: ERROR_COLOR }
                                                            ]}
                                                            keyboardType="decimal-pad"
                                                            value={target.maxValue.toString()}
                                                            onChangeText={(text) => updateTarget(index, 'maxValue', text)}
                                                            onFocus={() => handleFocus(`target_${index}_maxValue`)}
                                                            onBlur={handleBlur}
                                                            placeholder="100"
                                                            placeholderTextColor="#9CA3AF"
                                                        />
                                                    </View>
                                                    <RenderError message={targetErrors.maxValue} />
                                                    {!targetErrors.maxValue && <Text style={styles.unitLabel}>{target.unit}</Text>}
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.valueSection}>
                                            <View style={styles.labelContainer}>
                                                <Icon name="percent" size={16} color={BRAND_COLOR} />
                                                <Text style={styles.valueSectionLabel}>Khoảng % Năng Lượng</Text>
                                            </View>
                                            <View style={styles.valueRow}>
                                                <View style={styles.valueInputContainer}>
                                                    <Text style={styles.valueLabel}>Tối Thiểu</Text>
                                                    <View style={[
                                                        styles.valueInputWrapper,
                                                        targetErrors.minEnergyPct && { borderColor: ERROR_COLOR, borderWidth: 1.5, borderRadius: 10 }
                                                    ]}>
                                                        <TextInput
                                                            style={[
                                                                styles.valueInput,
                                                                focusedField === `target_${index}_minEnergyPct` && { borderColor: BRAND_COLOR, borderWidth: 2 },
                                                                targetErrors.minEnergyPct && { borderColor: ERROR_COLOR }
                                                            ]}
                                                            keyboardType="decimal-pad"
                                                            value={target.minEnergyPct.toString()}
                                                            onChangeText={(text) => updateTarget(index, 'minEnergyPct', text)}
                                                            onFocus={() => handleFocus(`target_${index}_minEnergyPct`)}
                                                            onBlur={handleBlur}
                                                            placeholder="0"
                                                            placeholderTextColor="#9CA3AF"
                                                        />
                                                    </View>
                                                    <RenderError message={targetErrors.minEnergyPct} />
                                                    {!targetErrors.minEnergyPct && <Text style={styles.unitLabel}>%</Text>}
                                                </View>
                                                <View style={styles.arrowContainer}>
                                                    <Icon name="arrow-right" size={20} color="#D1D5DB" />
                                                </View>
                                                <View style={styles.valueInputContainer}>
                                                    <Text style={styles.valueLabel}>Tối Đa</Text>
                                                    <View style={[
                                                        styles.valueInputWrapper,
                                                        targetErrors.maxEnergyPct && { borderColor: ERROR_COLOR, borderWidth: 1.5, borderRadius: 10 }
                                                    ]}>
                                                        <TextInput
                                                            style={[
                                                                styles.valueInput,
                                                                focusedField === `target_${index}_maxEnergyPct` && { borderColor: BRAND_COLOR, borderWidth: 2 },
                                                                targetErrors.maxEnergyPct && { borderColor: ERROR_COLOR }
                                                            ]}
                                                            keyboardType="decimal-pad"
                                                            value={target.maxEnergyPct.toString()}
                                                            onChangeText={(text) => updateTarget(index, 'maxEnergyPct', text)}
                                                            onFocus={() => handleFocus(`target_${index}_maxEnergyPct`)}
                                                            onBlur={handleBlur}
                                                            placeholder="50"
                                                            placeholderTextColor="#9CA3AF"
                                                        />
                                                    </View>
                                                    <RenderError message={targetErrors.maxEnergyPct} />
                                                    {!targetErrors.maxEnergyPct && <Text style={styles.unitLabel}>%</Text>}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.divider} />

                                    {/* Weight Input */}
                                    <View style={styles.weightContainer}>
                                        <View style={styles.labelContainer}>
                                            <Icon name="star-outline" size={16} color={BRAND_COLOR} />
                                            <Text style={styles.weightLabel}>Mức Ưu Tiên</Text>
                                        </View>
                                        <View style={styles.weightInputRow}>
                                            {[1, 2, 3, 4, 5].map((w) => {
                                                const config = getPriorityConfig(w);
                                                return (
                                                    <TouchableOpacity
                                                        key={w}
                                                        style={[
                                                            styles.weightButton,
                                                            target.weight === w && [styles.activeWeightButton, { backgroundColor: config.bg, borderColor: config.text }]
                                                        ]}
                                                        onPress={() => updateTarget(index, 'weight', w)}
                                                    >
                                                        <Text style={[
                                                            styles.weightButtonText,
                                                            target.weight === w && [styles.activeWeightButtonText, { color: config.text }]
                                                        ]}>
                                                            {w}
                                                        </Text>
                                                        {target.weight === w && (
                                                            <Text style={[styles.weightLabelText, { color: config.text }]}>
                                                                {config.label}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Icon name="information-outline" size={20} color={BRAND_COLOR} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Lưu ý quan trọng</Text>
                            <Text style={styles.infoText}>
                                • Chỉ Protein, Carbohydrate và Fat có thể dùng % Năng lượng{'\n'}
                                • Các chất khác chỉ dùng giá trị tuyệt đối
                            </Text>
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
                                <Text style={styles.saveButtonText}>Đang lưu...</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="content-save-edit-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Nutrient Selection Modal */}
            <Modal
                visible={showNutrientModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowNutrientModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn Chất Dinh Dưỡng</Text>
                            <TouchableOpacity onPress={() => setShowNutrientModal(false)}>
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBar}>
                            <Icon name="magnify" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm chất dinh dưỡng..."
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

                        <FlatList
                            data={availableNutrients}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyModalState}>
                                    <Icon name="database-off" size={40} color="#D1D5DB" />
                                    <Text style={styles.emptyModalText}>Không tìm thấy kết quả</Text>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.nutrientItem}
                                    onPress={() => handleAddTarget(item)}
                                >
                                    <View style={styles.nutrientItemLeft}>
                                        <View style={styles.nutrientIconBadge}>
                                            <Icon 
                                                name="pill" 
                                                size={16} 
                                                color={BRAND_COLOR} 
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.nutrientItemText}>{item.vietnameseName}</Text>
                                            <Text style={styles.nutrientItemUnit}>Đơn vị: {item.unit}</Text>
                                        </View>
                                    </View>
                                    <Icon name="plus-circle-outline" size={24} color={BRAND_COLOR} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default EditGoalScreen;