// FILE: src/navigation/ProfileStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import CreateHealthMetricScreen from '../screens/HealthMetric/CreateHealthMetricScreen';
import ViewHealthMetricScreen from '../screens/HealthMetric/ViewHealthMetricScreen';
import EditHealthMetricScreen from '../screens/HealthMetric/EditHealthMetricScreen';

// Define types
export type HealthMetricStackParamList = {
    ViewHealthMetricMain: undefined;
    CreateHealthMetric: undefined;
    EditHealthMetric: { metricId: string };
};

const HealthMetricStack = createNativeStackNavigator<HealthMetricStackParamList>();

const HealthMetricStackNavigator: React.FC = () => {
    return (
        <HealthMetricStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >

            <HealthMetricStack.Screen
                name="ViewHealthMetricMain"
                component={ViewHealthMetricScreen}
            />

            <HealthMetricStack.Screen
                name="CreateHealthMetric"
                component={CreateHealthMetricScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}

            />
            <HealthMetricStack.Screen
                name="EditHealthMetric"
                component={EditHealthMetricScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}

            />

        </HealthMetricStack.Navigator>
    );
};

export default HealthMetricStackNavigator;