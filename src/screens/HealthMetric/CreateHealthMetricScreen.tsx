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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { 
  styles, 
  FULL_ITEM_WIDTH, 
  SIDE_OFFSET 
} from './CreateHealthMetricScreenStyles';
import HeaderApp from '../../components/HeaderApp';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORT SERVICES
import ActivityLevelService, { 
  ActivityLevel, 
  getAllActivityLevels,
} from '../../services/ActivityLevelService';

import HealthMetricService, { HealthMetricInput } from '../../services/HealthMetricService';

const DATA_LIST = getAllActivityLevels();

const CreateHealthMetricScreen = () => {
  const navigation = useNavigation(); 

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

  const scrollX = useRef(new Animated.Value(0)).current;
  const activityScrollViewRef = useRef<ScrollView>(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const fetchCurrentLevel = async () => {
      try {
        setIsFetchingLevel(true);
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
        console.log('Error fetching initial activity level:', error);
      } finally {
        setIsFetchingLevel(false);
      }
    };

    fetchCurrentLevel();
  }, []);

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

  // --- 4. SUBMIT HEALTH METRIC ---
  const handleSubmit = async () => {
    const validation = validateInput();
    if (!validation.isValid) {
      Alert.alert('Dữ liệu không hợp lệ', validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: HealthMetricInput = {
        weightKg: parseFloat(weight),
        heightCm: parseFloat(height),
        bodyFatPercent: bodyFat.trim() ? parseFloat(bodyFat) : null,
        muscleMassKg: muscleMass.trim() ? parseFloat(muscleMass) : null,
        notes: note.trim() || ''
      };

      console.log('📤 Submitting Health Metric:', payload);
      const response = await HealthMetricService.createHealthMetric(payload);
      
      console.log('✅ API Response:', response);

      if (response && response.id) {
        console.log('✅ Created successfully with ID:', response.id);
        
        Alert.alert(
          '🎉 Thành công!', 
          `Đã lưu hồ sơ sức khỏe!\n\n` +
          `BMI: ${response.bmi.toFixed(1)}\n` +
          `BMR: ${Math.round(response.bmr)} kcal\n` +
          `TDEE: ${Math.round(response.tdee)} kcal`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setWeight('');
              setHeight('');
              setBodyFat('');
              setMuscleMass('');
              setNote('');
              navigation.goBack();
            }
          }]
        );
      } else {
        console.warn('⚠️ API returned empty response, fetching latest metric...');
        
        const latestMetric = await HealthMetricService.getLatestHealthMetric();
        
        if (latestMetric) {
          console.log('✅ Fetched latest metric:', latestMetric);
          
          Alert.alert(
            '🎉 Thành công!', 
            `Đã lưu hồ sơ sức khỏe!\n\n` +
            `BMI: ${latestMetric.bmi.toFixed(1)}\n` +
            `BMR: ${Math.round(latestMetric.bmr)} kcal\n` +
            `TDEE: ${Math.round(latestMetric.tdee)} kcal`,
            [{ 
              text: 'OK', 
              onPress: () => {
                setWeight('');
                setHeight('');
                setBodyFat('');
                setMuscleMass('');
                setNote('');
                navigation.goBack();
              }
            }]
          );
        } else {
          console.warn('⚠️ Cannot fetch latest metric');
          Alert.alert(
            'Thành công', 
            'Đã lưu hồ sơ sức khỏe!',
            [{ 
              text: 'OK', 
              onPress: () => {
                setWeight('');
                setHeight('');
                setBodyFat('');
                setMuscleMass('');
                setNote('');
                navigation.goBack();
              }
            }]
          );
        }
      }

    } catch (error: any) {
      console.error('❌ Submit Error:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi lưu thông tin.';
      Alert.alert('Lỗi', errorMessage, [{ text: 'Đóng' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLevelInfo = ActivityLevelService.getActivityLevelInfo(selectedLevel);

  return (
    <View style={styles.container} >
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
                <Text style={styles.headerSubtitle}>Thiết lập thông số</Text>
                <Text style={styles.headerTitle}>Hồ Sơ Sức Khỏe</Text>
              </View>
              <View style={styles.headerIconContainer}>
                <Icon name="heart-pulse" size={32} color="#FFFFFF" />
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
                  style={[styles.input, focusedInput === 'weight' && styles.inputFocused]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ví dụ: 65"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('weight')}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="human-male-height" size={14} color="#6B7280" /> Chiều cao (cm)
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[styles.input, focusedInput === 'height' && styles.inputFocused]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Ví dụ: 170"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('height')}
                  onBlur={handleBlur}
                />
              </View>
            </View>

            {/* Row 2: Tỷ lệ mỡ & Cơ bắp */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="percent" size={14} color="#6B7280" /> Tỷ lệ mỡ (%)
                </Text>
                <TextInput
                  style={[styles.input, focusedInput === 'bodyFat' && styles.inputFocused]}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="Tùy chọn"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('bodyFat')}
                  onBlur={handleBlur}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Icon name="arm-flex" size={14} color="#6B7280" /> Cơ bắp (kg)
                </Text>
                <TextInput
                  style={[styles.input, focusedInput === 'muscleMass' && styles.inputFocused]}
                  value={muscleMass}
                  onChangeText={setMuscleMass}
                  placeholder="Tùy chọn"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onFocus={() => handleFocus('muscleMass')}
                  onBlur={handleBlur}
                />
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
                placeholder="Ghi chú về thể trạng, mục tiêu..."
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
              <Icon name="content-save" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Lưu Hồ Sơ</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateHealthMetricScreen;