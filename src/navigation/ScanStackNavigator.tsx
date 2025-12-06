import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScanScreen from '../screens/Scan/ScanScreen';
import ScanResultScreen from '../screens/Scan/ScanResultScreen';
// Giả định kiểu dữ liệu trả về từ ScanService
import { DetectedIngredientResponse } from '../services/ScanService'; 

// ============================================
// TYPES: Định nghĩa các màn hình và tham số
// ============================================
export type ScanStackParamList = {
    ScanMain: undefined; 
    ScanResult: {
        results: DetectedIngredientResponse[]; // Danh sách nguyên liệu
        imageUri: string;
    }; 
};

const ScanStack = createNativeStackNavigator<ScanStackParamList>();

const ScanStackNavigator: React.FC = () => {
    return (
        <ScanStack.Navigator
            screenOptions={{
                headerShown: false, 
            }}
        >
            
            <ScanStack.Screen
                name="ScanMain"
                component={ScanScreen}
            />

            <ScanStack.Screen
                name="ScanResult"
                component={ScanResultScreen}
                options={{
                    presentation: 'card', 
                    animation: 'slide_from_right', 
                    gestureEnabled: true, 
                }}
            />
        </ScanStack.Navigator>
    );
};

export default ScanStackNavigator;