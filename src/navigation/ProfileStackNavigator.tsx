import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

// Define types - ❌ XÓA ViewRecipe
export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
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
        </ProfileStack.Navigator>
    );
};

export default ProfileStackNavigator;