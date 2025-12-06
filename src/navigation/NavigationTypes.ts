// FILE: src/navigation/NavigationTypes.ts

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthRoutes } from './RouteNames'; 

// --- AUTH STACK PARAM LIST ---
export type AuthStackParamList = {
    [AuthRoutes.Login]: undefined; 
    [AuthRoutes.Register]: undefined; 
    [AuthRoutes.VerifyEmailOtp]: { email: string };
    [AuthRoutes.ForgotPassword]: undefined;
    [AuthRoutes.VerifyCode]: { email: string };
    [AuthRoutes.NewPassword]: undefined;
};

// --- ROOT STACK PARAM LIST ---
export type RootStackParamList = {
    AuthFlow: undefined; 
    MainAppTabs: undefined;
    CreateRecipe: undefined; // ✅ THÊM DÒNG NÀY
    ViewDietRestriction: undefined;
};

// --- PROFILE STACK PARAM LIST ---
export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
};

// --- HEALTH GOAL STACK PARAM LIST ---
export type HealthGoalStackParamList = {
    HealthGoalMain: undefined;
    HealthGoalCreate: undefined;
};
export type ScanlStackParamList = {
    ScanMain: undefined;   // Màn hình chính (Danh sách)
    ScanResult: undefined; // Màn hình tạo mới
};
export type HealthMetricStackParamList = {
    ViewHealthMetricMain: undefined;
    CreateHealthMetric: undefined;
    EditHealthMetric: undefined;
};
export type DietRestrictionStackParamList = {
    ViewDietRestrictionMain: undefined;
    CreateDietRestriction: undefined;
};
// --- AUTH SCREEN TYPES ---
export type LoginScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.Login>;
export type RegisterScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.Register>;
export type VerifyEmailOtpScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.VerifyEmailOtp>;
export type ForgotPasswordScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.ForgotPassword>;
export type VerifyCodeScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.VerifyCode>;
export type NewPasswordScreenNavigationProps = NativeStackScreenProps<AuthStackParamList, typeof AuthRoutes.NewPassword>;

// --- TAB PARAM LIST ---
export type TabParamList = {
    Home: undefined;
    Goal: undefined;
    Scan: undefined;
    Health: undefined;
    Profile: undefined;
};