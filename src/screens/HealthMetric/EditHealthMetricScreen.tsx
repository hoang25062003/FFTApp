import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { 
  CheckCircle2,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  styles, 
  FULL_ITEM_WIDTH, 
  SIDE_OFFSET 
} from './CreateHealthMetricScreenStyles';
import HeaderApp from '../../components/HeaderApp';
import { HealthMetricStackParamList } from '../../navigation/HealthMetricStackNavigator';

// IMPORT SERVICES
import ActivityLevelService, { 
  ActivityLevel, 
  getAllActivityLevels,
} from '../../services/ActivityLevelService';

import HealthMetricService, { 
  HealthMetricUpdateInput 
} from '../../services/HealthMetricService';

type EditHealthMetricRouteProp = RouteProp<HealthMetricStackParamList, 'EditHealthMetric'>;

const DATA_LIST = getAllActivityLevels();

const EditHealthMetricScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditHealthMetricRouteProp>();
  const { metricId } = route.params;

  // Form State
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [note, setNote] = useState('');
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Activity Selector State
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>('Sedentary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLevel, setIsFetchingLevel] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const scrollX = useRef(new Animated.Value(0)).current;
  const activityScrollViewRef = useRef<ScrollView>(null);

  // --- 1. LOAD DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    const loadMetricData = async () => {
      try {
        setIsLoadingData(true);
        
        // Load metric data
        const metric = await HealthMetricService.getMetricById(metricId);
        
        // Điền dữ liệu vào form
        setWeight(metric.weightKg.toString());
        setHeight(metric.heightCm.toString());
        setBodyFat(metric.bodyFatPercent ? metric.bodyFatPercent.toString() : '');
        setMuscleMass(metric.muscleMassKg ? metric.muscleMassKg.toString() : '');
        setNote(metric.notes || '');

        // Load activity level
        const level = await ActivityLevelService.getActivityLevel();
        setSelectedLevel(level);

        const index = DATA_LIST.findIndex(item => item.level === level);
        if (index !== -1 && activityScrollViewRef.current) {
          setTimeout(() => {
            activityScrollViewRef.current?.scrollTo({
              x: index * FULL_ITEM_WIDTH,
              animated: true,
            });
          }, 200);
        }
      } catch (error) {
        console.error('Error loading metric data:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setIsLoadingData(false);
        setIsFetchingLevel(false);
      }
    };

    loadMetricData();
  }, [metricId]);

  const handleFocus = (field: string) => setFocusedInput(field);
  const handleBlur = () => setFocusedInput(null);
  const handleBackPress = () => navigation.goBack();

  // --- 2. UPDATE ACTIVITY LEVEL (Real-time) ---
  const handleSelectActivity = async (level: ActivityLevel, index: number) => {
    if (selectedLevel === level) return;

    setSelectedLevel(level);
    if (activityScrollViewRef.current) {
      activityScrollViewRef.current.scrollTo({
        x: index * FULL_ITEM_WIDTH,
        animated: true,
      });
    }

    try {
      console.log(`Updating activity level to: ${level}`);
      await ActivityLevelService.changeActivityLevel(level);
    } catch (error) {
      console.error('Failed to update activity level:', error);
      Alert.alert('Lỗi kết nối', 'Không thể cập nhật mức độ hoạt động.');
    }
  };

  // --- 3. VALIDATE INPUT ---
  const validateInput = (): { isValid: boolean; message?: string } => {
    if (!weight.trim() || !height.trim()) {
      return { 
        isValid: false, 
        message: 'Vui lòng nhập Cân nặng và Chiều cao.' 
      };
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      return { 
        isValid: false, 
        message: 'Cân nặng không hợp lệ (0-500 kg).' 
      };
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      return { 
        isValid: false, 
        message: 'Chiều cao không hợp lệ (0-300 cm).' 
      };
    }

    if (bodyFat.trim()) {
      const bodyFatNum = parseFloat(bodyFat);
      if (isNaN(bodyFatNum) || bodyFatNum < 0 || bodyFatNum > 100) {
        return { 
          isValid: false, 
          message: 'Tỷ lệ mỡ không hợp lệ (0-100%).' 
        };
      }
    }

    if (muscleMass.trim()) {
      const muscleMassNum = parseFloat(muscleMass);
      if (isNaN(muscleMassNum) || muscleMassNum <= 0 || muscleMassNum > 200) {
        return { 
          isValid: false, 
          message: 'Khối lượng cơ không hợp lệ (0-200 kg).' 
        };
      }
    }

    return { isValid: true };
  };

  // --- 4. SUBMIT UPDATE ---
  const handleSubmit = async () => {
    const validation = validateInput();
    if (!validation.isValid) {
      Alert.alert('Dữ liệu không hợp lệ', validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị payload với chỉ những trường đã thay đổi
      const payload: HealthMetricUpdateInput = {
        weightKg: parseFloat(weight),
        heightCm: parseFloat(height),
        bodyFatPercent: bodyFat.trim() ? parseFloat(bodyFat) : null,
        muscleMassKg: muscleMass.trim() ? parseFloat(muscleMass) : null,
        notes: note.trim() || ''
      };

      console.log('📤 Updating Health Metric:', payload);

      // Gọi API update với merge logic
      const response = await HealthMetricService.updateMetricOnlyChanges(metricId, payload);
      
      console.log('✅ API Response:', response);

      Alert.alert(
        '🎉 Cập nhật thành công!', 
        `Đã cập nhật hồ sơ sức khỏe!\n\n`,
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack()
        }]
      );

    } catch (error: any) {
      console.error('❌ Update Error:', error);
      
      const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật thông tin.';
      
      Alert.alert(
        'Lỗi', 
        errorMessage,
        [{ text: 'Đóng' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLevelInfo = ActivityLevelService.getActivityLevelInfo(selectedLevel);

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoadingData) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <HeaderApp isHome={false} onBackPress={handleBackPress} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#84CC16" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
            <Text style={styles.headerSubtitle}>Cập nhật thông số TDEE & Body</Text>
          </View>
        </View>

        {/* --- SECTION 1: ACTIVITY LEVEL --- */}
        <View style={styles.sectionContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
             <Text style={styles.sectionTitle}>1. Mức độ hoạt động</Text>
             {isFetchingLevel && <ActivityIndicator size="small" color="#000" style={{marginRight: 20}}/>}
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
          
          <View style={styles.feedbackContainer}>
             <Text style={styles.feedbackText}>
               Bạn chọn: <Text style={{fontWeight: 'bold', color: currentLevelInfo.color}}>{currentLevelInfo.titleVN}</Text>
             </Text>
          </View>
        </View>

        {/* --- SECTION 2: BODY METRICS --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>2. Chỉ số cơ thể</Text>
          
          <View style={styles.formCard}>
            {/* Row 1: Cân nặng & Chiều cao */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cân nặng (kg) <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput
                  style={[styles.input, focusedInput === 'weight' && styles.inputFocused]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ví dụ: 65"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('weight')}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Chiều cao (cm) <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput
                  style={[styles.input, focusedInput === 'height' && styles.inputFocused]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Ví dụ: 170"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('height')}
                  onBlur={handleBlur}
                />
              </View>
            </View>

            {/* Row 2: Tỷ lệ mỡ & Cơ bắp */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Tỷ lệ mỡ (%)</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'bodyFat' && styles.inputFocused]}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="Tùy chọn"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('bodyFat')}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cơ bắp (kg)</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'muscleMass' && styles.inputFocused]}
                  value={muscleMass}
                  onChangeText={setMuscleMass}
                  placeholder="Tùy chọn"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('muscleMass')}
                  onBlur={handleBlur}
                />
              </View>
            </View>

            {/* Ghi chú */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú thêm</Text>
              <TextInput
                style={[styles.input, styles.bioInput, focusedInput === 'note' && styles.bioInputFocused]}
                value={note}
                onChangeText={setNote}
                placeholder="Ghi chú về thể trạng..."
                multiline
                textAlignVertical="top"
                onFocus={() => handleFocus('note')}
                onBlur={handleBlur}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
          activeOpacity={0.8} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CheckCircle2 size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Cập Nhật</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditHealthMetricScreen;