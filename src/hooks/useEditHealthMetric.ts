import { useState, useEffect, useRef } from 'react';
import { Alert, TextInput, ScrollView, Animated, Keyboard } from 'react-native';
import ActivityLevelService, { 
    ActivityLevel, 
    getAllActivityLevels,
} from '../services/ActivityLevelService';
import HealthMetricService, { 
    HealthMetricUpdateInput 
} from '../services/HealthMetricService';
import { FULL_ITEM_WIDTH } from '../screens/HealthMetric/CreateHealthMetricScreenStyles';

const DATA_LIST = getAllActivityLevels();

type InputField = 'weight' | 'height' | 'bodyFat' | 'muscleMass' | 'note' | null;

interface ValidationErrors {
    weight?: string;
    height?: string;
    bodyFat?: string;
    muscleMass?: string;
    note?: string; // Sửa lỗi ts(7053)
}

export const useEditHealthMetric = (navigation: any, metricId: string) => {
    // Refs
    const scrollX = useRef(new Animated.Value(0)).current;
    const activityScrollViewRef = useRef<ScrollView>(null);

    // Form State (Lưu dạng string để xử lý nhập liệu dấu chấm)
    const [weight, setWeight] = useState('0');
    const [height, setHeight] = useState('0');
    const [bodyFat, setBodyFat] = useState('0');
    const [muscleMass, setMuscleMass] = useState('0');
    const [note, setNote] = useState('');
    
    // UI State
    const [focusedInput, setFocusedInput] = useState<InputField>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>('Sedentary');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLevel, setIsFetchingLevel] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        loadMetricData();
    }, [metricId]);

    // Hàm xử lý logic nhập liệu số (Giống useCreateGoal)
    const validateNumericInput = (value: string): string => {
        if (value === '') return '0';
        if (value === '.') return '0.'; // Tự động thêm 0 nếu nhập dấu chấm đầu tiên

        let cleaned = value.replace(/[^\d.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        // Xóa số 0 thừa ở đầu (ví dụ "05" -> "5") nhưng giữ lại "0."
        if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
            cleaned = cleaned.replace(/^0+/, '');
            if (cleaned === '' || cleaned.startsWith('.')) cleaned = '0' + cleaned;
        }

        // Nếu nhập "0.00" thì tự xóa 1 số 0 -> "0.0"
        if (cleaned === '0.00') return '0.0';

        return cleaned;
    };

    const loadMetricData = async () => {
        try {
            setIsLoadingData(true);
            const metric = await HealthMetricService.getMetricById(metricId);
            
            // Chuyển đổi dữ liệu số sang string để nhập liệu
            setWeight(metric.weightKg?.toString() || '0');
            setHeight(metric.heightCm?.toString() || '0');
            setBodyFat(metric.bodyFatPercent?.toString() || '0');
            setMuscleMass(metric.muscleMassKg?.toString() || '0');
            setNote(metric.notes || '');

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
            Alert.alert('Lỗi', 'Không thể tải dữ liệu.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } finally {
            setIsLoadingData(false);
            setIsFetchingLevel(false);
        }
    };

    const handleFocus = (field: InputField) => {
        setFocusedInput(field);
        if (field && errors[field as keyof ValidationErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as keyof ValidationErrors];
                return newErrors;
            });
        }
    };

    const handleSelectActivity = async (level: ActivityLevel, index: number) => {
        if (selectedLevel === level) return;
        setSelectedLevel(level);
        if (activityScrollViewRef.current) {
            activityScrollViewRef.current.scrollTo({ x: index * FULL_ITEM_WIDTH, animated: true });
        }
        try {
            await ActivityLevelService.changeActivityLevel(level);
        } catch (error) {
            Alert.alert('Lỗi kết nối', 'Không thể cập nhật mức độ hoạt động.');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        const w = parseFloat(weight);
        if (isNaN(w) || w < 0.1 || w > 300) {
            newErrors.weight = 'Cân nặng không hợp lệ (0.1-300 kg).';
        }

        const h = parseFloat(height);
        if (isNaN(h) || h < 30 || h > 250) {
            newErrors.height = 'Chiều cao không hợp lệ (30-250 cm).';
        }

        const bf = parseFloat(bodyFat);
        if (bodyFat.trim() && (isNaN(bf) || bf < 2 || bf > 70)) {
            newErrors.bodyFat = 'Tỷ lệ mỡ không hợp lệ (2-70%).';
        }

        const mm = parseFloat(muscleMass);
        if (muscleMass.trim() && (isNaN(mm) || mm < 10 || mm > 150)) {
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
            const payload: HealthMetricUpdateInput = {
                weightKg: parseFloat(weight),
                heightCm: parseFloat(height),
                bodyFatPercent: bodyFat.trim() ? parseFloat(bodyFat) : null,
                muscleMassKg: muscleMass.trim() ? parseFloat(muscleMass) : null,
                notes: note.trim() || ''
            };

            await HealthMetricService.updateMetricOnlyChanges(metricId, payload);
            
            Alert.alert('🎉 Thành công', 'Hồ sơ đã được cập nhật!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        scrollX,
        activityScrollViewRef,
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
        focusedInput,
        errors,
        handleFocus,
        handleBlur: () => setFocusedInput(null),
        selectedLevel,
        currentLevelInfo: ActivityLevelService.getActivityLevelInfo(selectedLevel),
        isFetchingLevel,
        handleSelectActivity,
        isSubmitting,
        handleSubmit,
        isLoadingData,
        DATA_LIST,
    };
};