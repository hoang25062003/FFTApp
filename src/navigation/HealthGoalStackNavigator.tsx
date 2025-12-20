

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ViewGoalScreen from '../screens/HealthGoal/ViewGoalScreen';
import CreateGoalScreen from '../screens/HealthGoal/CreateGoalScreen';
import EditGoalScreen from '../screens/HealthGoal/EditGoalScreen';
// Define types
export type HealthGoalStackParamList = {
    HealthGoalMain: undefined;   // Màn hình chính (Danh sách)
    HealthGoalCreate: undefined; // Màn hình tạo mới
    EditHealthGoal: { goalId: string };
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

            <HealthGoalStack.Screen
                name="EditHealthGoal"
                component={EditGoalScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
        </HealthGoalStack.Navigator>
    );
};

export default HealthGoalStackNavigator;