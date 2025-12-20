import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  styles, 
  FULL_ITEM_WIDTH, 
  SIDE_OFFSET 
} from './CreateHealthMetricScreenStyles';
import HeaderApp from '../../components/HeaderApp';
import { HealthMetricStackParamList } from '../../navigation/HealthMetricStackNavigator';
import { useEditHealthMetric } from '../../hooks/useEditHealthMetric';

const ERROR_COLOR = '#EF4444';

type EditHealthMetricRouteProp = RouteProp<HealthMetricStackParamList, 'EditHealthMetric'>;

const EditHealthMetricScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditHealthMetricRouteProp>();
  const { metricId } = route.params;

  const {
    scrollX,
    activityScrollViewRef,
    weight,
    setWeight,
    height,
    setHeight,
    bodyFat,
    setBodyFat,
    muscleMass,
    setMuscleMass,
    note,
    setNote,
    focusedInput,
    errors,
    handleFocus,
    handleBlur,
    selectedLevel,
    currentLevelInfo,
    isFetchingLevel,
    handleSelectActivity,
    isSubmitting,
    handleSubmit,
    isLoadingData,
    DATA_LIST,
  } = useEditHealthMetric(navigation, metricId);

  const handleBackPress = () => navigation.goBack();

  const RenderError = ({ message }: { message?: string }) => (
    message ? (
      <Text style={{ color: ERROR_COLOR, fontSize: 12, marginTop: 4, marginLeft: 4, lineHeight: 16 }}>
        {message}
      </Text>
    ) : null
  );

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoadingData) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <HeaderApp isHome={false} onBackPress={handleBackPress} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8BC34A" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerSubtitle}>Cập nhật thông số</Text>
                <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
              </View>
              <View style={styles.headerIconContainer}>
                <Icon name="file-document-edit-outline" size={32} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* --- SECTION 1: ACTIVITY LEVEL --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon name="run" size={22} color="#8BC34A" />
            <Text style={styles.sectionTitle}>Mức độ hoạt động</Text>
            {isFetchingLevel && (
              <ActivityIndicator size="small" color="#8BC34A" style={{ marginLeft: 8 }} />
            )}
          </View>
          
          <Animated.ScrollView
            ref={activityScrollViewRef}
            horizontal
            pagingEnabled={false}
            decelerationRate="fast"
            snapToInterval={FULL_ITEM_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SIDE_OFFSET - 20, paddingVertical: 10 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          >
            {DATA_LIST.map((item, index) => {
              const isSelected = selectedLevel === item.level;
              return (
                <View key={item.level} style={styles.cardContainer}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelectActivity(item.level, index)}
                    style={[
                      styles.card,
                      { 
                        borderTopColor: item.color,
                        transform: [{ scale: isSelected ? 1.05 : 1 }],
                        borderColor: isSelected ? item.color : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                        borderTopWidth: isSelected ? 2 : 5,
                      },
                      isSelected && styles.cardSelectedShadow
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardIconContainer, { backgroundColor: `${item.color}15` }]}>
                        <Text style={styles.cardIcon}>{item.icon}</Text>
                      </View>
                      <View style={[styles.factorBadge, { backgroundColor: item.color }]}>
                        <Text style={styles.factorLabel}>Hệ số</Text>
                        <Text style={styles.factorValue}>x{item.factor}</Text>
                      </View>
                    </View>
                    <View style={styles.titleWrapper}>
                      <Text style={[styles.levelTitleEn, { color: item.color }]}>{item.level}</Text>
                      <Text style={styles.levelTitleVn}>{item.titleVN}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={{flex: 1}}>
                      <Text style={styles.shortDesc}>{item.description}</Text>
                      <Text style={styles.longDesc}>{item.exerciseFrequency}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Animated.ScrollView>
          
          <View style={styles.selectedBadge}>
            <Icon name="check-circle" size={16} color={currentLevelInfo.color} />
            <Text style={styles.selectedText}>
              Đã chọn: <Text style={[styles.selectedTextBold, { color: currentLevelInfo.color }]}>
                {currentLevelInfo.titleVN}
              </Text>
            </Text>
          </View>
        </View>

        {/* --- SECTION 2: BODY METRICS --- */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="human" size={22} color="#8BC34A" />
            <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
          </View>
          
          <View style={styles.formCard}>
            {/* Row 1: Cân nặng & Chiều cao */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="weight-kilogram" size={14} color="#6B7280" /> Cân nặng (kg)
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    focusedInput === 'weight' && styles.inputFocused,
                    errors.weight && { borderColor: ERROR_COLOR }
                  ]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ví dụ: 65"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  onFocus={() => handleFocus('weight')}
                  onBlur={handleBlur}
                />
                <RenderError message={errors.weight} />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="human-male-height" size={14} color="#6B7280" /> Chiều cao (cm)
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    focusedInput === 'height' && styles.inputFocused,
                    errors.height && { borderColor: ERROR_COLOR }
                  ]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Ví dụ: 170"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  onFocus={() => handleFocus('height')}
                  onBlur={handleBlur}
                />
                <RenderError message={errors.height} />
              </View>
            </View>

            {/* Row 2: Tỷ lệ mỡ & Cơ bắp */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="percent" size={14} color="#6B7280" /> Tỷ lệ mỡ (%)
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    focusedInput === 'bodyFat' && styles.inputFocused,
                    errors.bodyFat && { borderColor: ERROR_COLOR }
                  ]}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="Tùy chọn"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  onFocus={() => handleFocus('bodyFat')}
                  onBlur={handleBlur}
                />
                <RenderError message={errors.bodyFat} />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="arm-flex" size={14} color="#6B7280" /> Cơ bắp (kg)
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    focusedInput === 'muscleMass' && styles.inputFocused,
                    errors.muscleMass && { borderColor: ERROR_COLOR }
                  ]}
                  value={muscleMass}
                  onChangeText={setMuscleMass}
                  placeholder="Tùy chọn"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  onFocus={() => handleFocus('muscleMass')}
                  onBlur={handleBlur}
                />
                <RenderError message={errors.muscleMass} />
              </View>
            </View>

            {/* Ghi chú */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Icon name="note-text-outline" size={14} color="#6B7280" /> Ghi chú thêm
              </Text>
              <TextInput
                style={[styles.input, styles.bioInput, focusedInput === 'note' && styles.inputFocused]}
                value={note}
                onChangeText={setNote}
                placeholder="Ghi chú về thể trạng..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                onFocus={() => handleFocus('note')}
                onBlur={handleBlur}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          activeOpacity={0.8} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="content-save-edit-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Cập Nhật</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditHealthMetricScreen;