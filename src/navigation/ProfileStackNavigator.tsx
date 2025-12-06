// FILE: src/navigation/ProfileStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

import ViewRecipeScreen from '../screens/Recipe/ViewRecipeScreen';

// Define types
export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;

    ViewRecipe: { recipeId: string }; 
};

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >

            <ProfileStack.Screen
                name="ProfileMain"
                component={ProfileScreen}
            />

            <ProfileStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />


            <ProfileStack.Screen
                name="ViewRecipe"
                component={ViewRecipeScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
        </ProfileStack.Navigator>
    );
};

export default ProfileStackNavigator;