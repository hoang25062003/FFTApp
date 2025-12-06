

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ViewGoalScreen from '../screens/HealthGoal/ViewGoalScreen';
import CreateGoalScreen from '../screens/HealthGoal/CreateGoalScreen';

// Define types
export type HealthGoalStackParamList = {
    HealthGoalMain: undefined;   // Màn hình chính (Danh sách)
    HealthGoalCreate: undefined; // Màn hình tạo mới
};

const HealthGoalStack = createNativeStackNavigator<HealthGoalStackParamList>();

const HealthGoalStackNavigator: React.FC = () => {
    return (
        <HealthGoalStack.Navigator
            screenOptions={{
                headerShown: false, 
            }}
        >
           
            <HealthGoalStack.Screen
                name="HealthGoalMain"
                component={ViewGoalScreen}
            />

            <HealthGoalStack.Screen
                name="HealthGoalCreate"
                component={CreateGoalScreen}
                options={{
                    presentation: 'card', // Full screen card
                    animation: 'slide_from_right', // Slide từ phải sang
                    gestureEnabled: true, // Cho phép swipe back
                }}
            />
        </HealthGoalStack.Navigator>
    );
};

export default HealthGoalStackNavigator;