// FILE: src/navigation/ProfileStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import ViewDietRestrictionScreen from '../screens/DietRestriction/ViewDietRestrictionScreen';
import CreateDietRestrictionScreen from '../screens/DietRestriction/CreateDietRestrictionScreen';


// Define types
export type DietRestrictionStackParamList = {
    ViewDietRestrictionMain: undefined;
    CreateDietRestriction: undefined;
};

const DietRestrictionStack = createNativeStackNavigator<DietRestrictionStackParamList>();

const DietRestrictionStackNavigator: React.FC = () => {
    return (
        <DietRestrictionStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >

            <DietRestrictionStack.Screen
                name="ViewDietRestrictionMain"
                component={ViewDietRestrictionScreen}
            />

            <DietRestrictionStack.Screen
                name="CreateDietRestriction"
                component={CreateDietRestrictionScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}

            />
            

        </DietRestrictionStack.Navigator>
    );
};

export default DietRestrictionStackNavigator;