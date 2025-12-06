// FILE: src/navigation/AuthNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { AuthStackParamList } from './NavigationTypes';
import { AuthRoutes } from './RouteNames';

// Import các màn hình Auth
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import VerifyEmailOtpScreen from '../screens/Register/VerifyEmailOtpScreen';

// ✅ THÊM IMPORT 3 MÀN HÌNH FORGOT PASSWORD
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/ForgotPassword/VerifyCodeScreen';
import NewPasswordScreen from '../screens/ForgotPassword/NewPasswordScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator component
 * Stack Navigator chứa tất cả màn hình xác thực:
 * - Login, Register, VerifyEmailOtp
 * - ForgotPassword, VerifyCode, NewPassword
 */
const AuthNavigator = () => {
    return (
        <AuthStack.Navigator
            initialRouteName={AuthRoutes.Login} 
            screenOptions={{
                headerShown: false, 
            }}
        >
            <AuthStack.Screen
                name={AuthRoutes.Login} 
                component={LoginScreen}
            />
            <AuthStack.Screen
                name={AuthRoutes.Register}
                component={RegisterScreen}
            />
            <AuthStack.Screen
                name={AuthRoutes.VerifyEmailOtp} 
                component={VerifyEmailOtpScreen}
            />

            <AuthStack.Screen
                name={AuthRoutes.ForgotPassword}
                component={ForgotPasswordScreen}
            />
            <AuthStack.Screen
                name={AuthRoutes.VerifyCode}
                component={VerifyCodeScreen}
            />
            <AuthStack.Screen
                name={AuthRoutes.NewPassword}
                component={NewPasswordScreen}
            />
        </AuthStack.Navigator>
    );
};

export default AuthNavigator;