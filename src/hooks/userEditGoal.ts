import { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { healthGoalService } from '../services/HealthGoalService';
import { getNutrients, NutrientInfo } from '../services/NutrientService';

const ENERGY_PERCENT_ALLOWED_IDS = [
    '4e7a667e-4012-d80e-9276-1cd44d4e7fbd', // Protein
    'feca7dbc-1254-74f3-c7e0-ff7b786515d0', // Carbohydrate
    '73cd094d-61aa-61ce-d021-9ffa9b9ebbad'  // Fat
];

const ERROR_COLOR = '#EF4444';

export interface NutrientTarget {
    nutrientId: string;
    name: string;
    unit: string;
    targetType: 'ABSOLUTE' | 'ENERGYPERCENT';
    minValue: number;
    maxValue: number;
    minEnergyPct: number;
    maxEnergyPct: number;
    weight: number;
}

interface ValidationErrors {
    goalName?: string;
    targets?: { [key: number]: { [key: string]: string } };
}

export const useEditGoal = (navigation: any, goalId: string) => {
    // Refs
    const goalNameRef = useRef<TextInput>(null);
    const goalDescriptionRef = useRef<TextInput>(null);

    // Form State
    const [goalName, setGoalName] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [targets, setTargets] = useState<NutrientTarget[]>([]);
    
    // Nutrients Data
    const [nutrients, setNutrients] = useState<NutrientInfo[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Modal State
    const [showNutrientModal, setShowNutrientModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Focus and Validation
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        loadInitialData();
    }, [goalId]);

    const loadInitialData = async () => {
        try {
            setIsLoadingData(true);
            
            const [nutrientList, goalDetails] = await Promise.all([
                getNutrients(),
                healthGoalService.getCustomById(goalId)
            ]);

            setNutrients(nutrientList);
            setGoalName(goalDetails.name);
            setGoalDescription(goalDetails.description || '');

            const mappedTargets: NutrientTarget[] = goalDetails.targets.map(apiTarget => {
                const nutrientInfo = nutrientList.find(n => n.id === apiTarget.nutrientId);
                
                return {
                    nutrientId: apiTarget.nutrientId,
                    name: nutrientInfo ? nutrientInfo.vietnameseName : apiTarget.name,
                    unit: nutrientInfo ? nutrientInfo.unit : apiTarget.unit || '',
                    targetType: (apiTarget.targetType as 'ABSOLUTE' | 'ENERGYPERCENT') || 'ABSOLUTE',
                    minValue: apiTarget.minValue,
                    maxValue: apiTarget.maxValue,
                    minEnergyPct: apiTarget.minEnergyPct,
                    maxEnergyPct: apiTarget.maxEnergyPct,
                    weight: apiTarget.weight
                };
            });

            setTargets(mappedTargets);

        } catch (error: any) {
            // console.error('Error loading goal details:', error);
            Alert.alert(
                'Lỗi', 
                'Không thể tải thông tin mục tiêu. Vui lòng thử lại.',
                [{ text: 'Quay lại', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoadingData(false);
        }
    };

    const canUseEnergyPercent = (nutrientId: string): boolean => {
        return ENERGY_PERCENT_ALLOWED_IDS.includes(nutrientId);
    };

    const handleAddTarget = (nutrient: NutrientInfo) => {
        const allowEnergyPercent = canUseEnergyPercent(nutrient.id);
        
        const newTarget: NutrientTarget = {
            nutrientId: nutrient.id,
            name: nutrient.vietnameseName,
            unit: nutrient.unit,
            targetType: allowEnergyPercent ? 'ENERGYPERCENT' : 'ABSOLUTE',
            minValue: 0,
            maxValue: 100,
            minEnergyPct: allowEnergyPercent ? 0 : 0,
            maxEnergyPct: allowEnergyPercent ? 50 : 0,
            weight: 3
        };
        
        setTargets([...targets, newTarget]);
        setShowNutrientModal(false);
        setSearchQuery('');
    };

    const handleRemoveTarget = (index: number) => {
        const newTargets = targets.filter((_, i) => i !== index);
        setTargets(newTargets);
        
        // Clear errors for removed target
        if (errors.targets && errors.targets[index]) {
            const newErrors = { ...errors };
            delete newErrors.targets![index];
            setErrors(newErrors);
        }
    };

    const validateDecimalInput = (value: string): string => {
        if (value === '') return '';
        let cleaned = value.replace(/[^\d.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        return cleaned;
    };

    const updateTarget = (index: number, field: keyof NutrientTarget, value: any) => {
        const newTargets = [...targets];
        
        if (field === 'minValue' || field === 'maxValue' || field === 'minEnergyPct' || field === 'maxEnergyPct') {
            // Allow user to type freely, validate the input
            const stringValue = typeof value === 'string' ? value : value.toString();
            const validated = validateDecimalInput(stringValue);
            
            // Store as string during typing to preserve decimal point (e.g., "12.")
            // Only convert to number when actually needed for validation
            newTargets[index] = { ...newTargets[index], [field]: validated };
        } else {
            newTargets[index] = { ...newTargets[index], [field]: value };
        }
        
        setTargets(newTargets);
        
        // Clear error for this field when user types
        if (errors.targets && errors.targets[index] && errors.targets[index][field]) {
            const newErrors = { ...errors };
            delete newErrors.targets![index][field];
            setErrors(newErrors);
        }
    };

    const availableNutrients = nutrients.filter(
        n => !targets.some(t => t.nutrientId === n.id) &&
             n.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPriorityConfig = (weight: number) => {
        switch (weight) {
            case 1: return { bg: '#DBEAFE', text: '#1E40AF', label: 'Cốt lõi' };
            case 2: return { bg: '#F3E8FF', text: '#6B21A8', label: 'Trọng yếu' };
            case 3: return { bg: '#F1F5F9', text: '#475569', label: 'Cơ bản' };
            case 4: return { bg: '#FEF3C7', text: '#92400E', label: 'Chừng mực' };
            case 5: return { bg: '#DCFCE7', text: '#15803D', label: 'Linh hoạt' };
            default: return { bg: '#F3F4F6', text: '#6B7280', label: 'Khác' };
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Validate goal name
        if (!goalName.trim()) {
            newErrors.goalName = 'Vui lòng nhập tên mục tiêu.';
        }

        // Validate targets
        if (targets.length === 0) {
            Alert.alert('Thiếu thông tin', 'Vui lòng thêm ít nhất một chỉ số dinh dưỡng.');
            return false;
        }

        newErrors.targets = {};
        let hasError = false;

        targets.forEach((target, index) => {
            newErrors.targets![index] = {};

            if (target.targetType === 'ABSOLUTE') {
                const minVal = parseFloat(target.minValue.toString()) || 0;
                const maxVal = parseFloat(target.maxValue.toString()) || 0;
                
                if (maxVal <= 0) {
                    newErrors.targets![index].maxValue = 'Giá trị tối đa phải lớn hơn 0.';
                    hasError = true;
                }
                if (minVal >= maxVal) {
                    newErrors.targets![index].minValue = 'Giá trị tối thiểu phải nhỏ hơn giá trị tối đa.';
                    hasError = true;
                }
            } else {
                const minPct = parseFloat(target.minEnergyPct.toString()) || 0;
                const maxPct = parseFloat(target.maxEnergyPct.toString()) || 0;
                
                if (maxPct <= 0 || maxPct > 100) {
                    newErrors.targets![index].maxEnergyPct = 'Phần trăm phải từ 0-100%.';
                    hasError = true;
                }
                if (minPct >= maxPct) {
                    newErrors.targets![index].minEnergyPct = 'Phần trăm tối thiểu phải nhỏ hơn phần trăm tối đa.';
                    hasError = true;
                }
            }

            // Remove empty error objects
            if (Object.keys(newErrors.targets![index]).length === 0) {
                delete newErrors.targets![index];
            }
        });

        if (Object.keys(newErrors.targets).length === 0) {
            delete newErrors.targets;
        }

        setErrors(newErrors);

        return !hasError && !newErrors.goalName;
    };

    const handleSave = async () => {
        Keyboard.dismiss();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            const requestData = {
                name: goalName.trim(),
                description: goalDescription.trim() || undefined,
                targets: targets.map(t => ({
                    nutrientId: t.nutrientId,
                    targetType: t.targetType,
                    minValue: t.targetType === 'ABSOLUTE' ? (parseFloat(t.minValue.toString()) || 0) : 0,
                    maxValue: t.targetType === 'ABSOLUTE' ? (parseFloat(t.maxValue.toString()) || 0) : 0,
                    minEnergyPct: t.targetType === 'ENERGYPERCENT' ? (parseFloat(t.minEnergyPct.toString()) || 0) : 0,
                    maxEnergyPct: t.targetType === 'ENERGYPERCENT' ? (parseFloat(t.maxEnergyPct.toString()) || 0) : 0,
                    weight: t.weight
                }))
            };

            await healthGoalService.updateCustom(goalId, requestData);
            
            Alert.alert(
                'Thành công',
                'Đã cập nhật mục tiêu thành công.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );

        } catch (error: any) {
            // console.error('Error updating goal:', error);
            Alert.alert('Lỗi', error?.message || 'Không thể cập nhật mục tiêu. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFocus = (field: string) => {
        setFocusedField(field);
        
        // Clear error when field is focused
        if (field === 'goalName' && errors.goalName) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.goalName;
                return newErrors;
            });
        }
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    return {
        goalNameRef,
        goalDescriptionRef,
        goalName,
        setGoalName,
        goalDescription,
        setGoalDescription,
        targets,
        nutrients,
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
    };
};