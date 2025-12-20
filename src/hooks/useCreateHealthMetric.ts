import { useState, useEffect, useRef } from 'react';
import { Alert, TextInput, ScrollView, Animated, Keyboard } from 'react-native';
import ActivityLevelService, { 
    ActivityLevel, 
    getAllActivityLevels,
} from '../services/ActivityLevelService';
import HealthMetricService, { HealthMetricInput } from '../services/HealthMetricService';
import { FULL_ITEM_WIDTH } from '../screens/HealthMetric/CreateHealthMetricScreenStyles';

const DATA_LIST = getAllActivityLevels();

type InputField = 'weight' | 'height' | 'bodyFat' | 'muscleMass' | 'note' | null;

interface ValidationErrors {
    weight?: string;
    height?: string;
    bodyFat?: string;
    muscleMass?: string;
    note?: string; // Bổ sung để tránh lỗi ts(7053)
}

export const useCreateHealthMetric = (navigation: any) => {
    // Refs
    const scrollX = useRef(new Animated.Value(0)).current;
    const activityScrollViewRef = useRef<ScrollView>(null);

    // Form State - Khởi tạo giá trị '0' (dạng string) để xử lý decimal tốt hơn
    const [weight, setWeight] = useState('0');
    const [height, setHeight] = useState('0');
    const [bodyFat, setBodyFat] = useState('0');
    const [muscleMass, setMuscleMass] = useState('0');
    const [note, setNote] = useState('');
    
    // Focus and Validation
    const [focusedInput, setFocusedInput] = useState<InputField>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Activity Selector State
    const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>('Sedentary');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLevel, setIsFetchingLevel] = useState(true);

    useEffect(() => {
        fetchCurrentLevel();
    }, []);

    // Hàm xử lý logic nhập liệu số đặc biệt
    const validateNumericInput = (value: string): string => {
        if (value === '') return '0';
        
        // 1. Nếu nhập dấu chấm đầu tiên, chuyển thành '0.'
        if (value === '.') return '0.';

        // 2. Chỉ cho phép số và tối đa 1 dấu chấm
        let cleaned = value.replace(/[^\d.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        // 3. Xóa số 0 thừa ở đầu (ví dụ "05" -> "5") nhưng giữ lại "0."
        if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
            cleaned = cleaned.replace(/^0+/, '');
            if (cleaned === '' || cleaned.startsWith('.')) cleaned = '0' + cleaned;
        }

        // 4. Nếu nhập "0.00" thì tự xóa 1 số 0 -> "0.0"
        if (cleaned === '0.00') return '0.0';

        return cleaned;
    };

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

    const handleFocus = (field: InputField) => {
        setFocusedInput(field);
        
        // Clear error when field is focused - Fix ts(7053)
        if (field && errors[field as keyof ValidationErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as keyof ValidationErrors];
                return newErrors;
            });
        }
    };

    const handleBlur = () => setFocusedInput(null);

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
            await ActivityLevelService.changeActivityLevel(level);
        } catch (error) {
            Alert.alert('Lỗi kết nối', 'Không thể cập nhật mức độ hoạt động.');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Validate weight: 0.1 - 300
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum < 0.1 || weightNum > 300) {
            newErrors.weight = 'Cân nặng không hợp lệ (0.1-300 kg).';
        } 

        // Validate height: 30 - 250
        const heightNum = parseFloat(height);
        if (isNaN(heightNum) || heightNum < 30 || heightNum > 250) {
            newErrors.height = 'Chiều cao không hợp lệ (30-250 cm).';
        }

        // Validate body fat: 2% - 70%
        const bodyFatNum = parseFloat(bodyFat);
        if (bodyFat.trim() && (isNaN(bodyFatNum) || bodyFatNum < 2 || bodyFatNum > 70)) {
            newErrors.bodyFat = 'Tỷ lệ mỡ không hợp lệ (2-70%).';
        }

        // Validate muscle mass: 10kg - 150kg
        const muscleMassNum = parseFloat(muscleMass);
        if (muscleMass.trim() && (isNaN(muscleMassNum) || muscleMassNum < 10 || muscleMassNum > 150)) {
            newErrors.muscleMass = 'Khối lượng cơ không hợp lệ (10-150 kg).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload: HealthMetricInput = {
                weightKg: parseFloat(weight),
                heightCm: parseFloat(height),
                bodyFatPercent: bodyFat.trim() ? parseFloat(bodyFat) : null,
                muscleMassKg: muscleMass.trim() ? parseFloat(muscleMass) : null,
                notes: note.trim() || ''
            };

            const response = await HealthMetricService.createHealthMetric(payload);
            const displayMetric = response?.id ? response : await HealthMetricService.getLatestHealthMetric();

            if (displayMetric) {
                Alert.alert(
                    '🎉 Thành công!', 
                    `Đã lưu hồ sơ sức khỏe!\n\n` +
                    `BMI: ${displayMetric.bmi.toFixed(1)}\n` +
                    `BMR: ${Math.round(displayMetric.bmr)} kcal\n` +
                    `TDEE: ${Math.round(displayMetric.tdee)} kcal`,
                    [{ 
                        text: 'OK', 
                        onPress: () => {
                            resetForm();
                            navigation.goBack();
                        } 
                    }]
                );
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi lưu thông tin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setWeight('0');
        setHeight('0');
        setBodyFat('0');
        setMuscleMass('0');
        setNote('');
    };

    return {
        // Refs
        scrollX,
        activityScrollViewRef,
        
        // Form State & Setters with Validation
        weight,
        setWeight: (val: string) => setWeight(validateNumericInput(val)),
        height,
        setHeight: (val: string) => setHeight(validateNumericInput(val)),
        bodyFat,
        setBodyFat: (val: string) => setBodyFat(validateNumericInput(val)),
        muscleMass,
        setMuscleMass: (val: string) => setMuscleMass(validateNumericInput(val)),
        note,
        setNote,
        
        // UI & Errors
        focusedInput,
        errors,
        handleFocus,
        handleBlur,
        
        // Activity Level
        selectedLevel,
        currentLevelInfo: ActivityLevelService.getActivityLevelInfo(selectedLevel),
        isFetchingLevel,
        handleSelectActivity,
        
        // Submit
        isSubmitting,
        handleSubmit,
        DATA_LIST,
    };
};