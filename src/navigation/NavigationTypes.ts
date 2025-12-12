import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthRoutes } from './RouteNames'; 

// --- AUTH STACK PARAM LIST ---
export type AuthStackParamList = {
    [AuthRoutes.Login]: undefined; 
    [AuthRoutes.Register]: undefined; 
    [AuthRoutes.VerifyEmailOtp]: { email: string };
    [AuthRoutes.ForgotPassword]: undefined;
    [AuthRoutes.VerifyCode]: { email: string };
    [AuthRoutes.NewPassword]: { email: string; code: string ;token: string;};
};

// --- ROOT STACK PARAM LIST ---
export type RootStackParamList = {
    AuthFlow: undefined; 
    MainAppTabs: undefined;
    CreateRecipe: undefined;
    DietRestrictionFlow: undefined;
    ViewRecipeScreen: { recipeId: string };
    ProfileScreen: { username: string };
    ListFollowScreen: { initialTab?: 'Followers' | 'Following' };
    IngredientsScreen: undefined;
    NotificationScreen: undefined;
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

export type ScanStackParamList = {
    ScanMain: undefined;
    ScanResult: undefined;
};

export type HealthMetricStackParamList = {
    ViewHealthMetricMain: undefined;
    CreateHealthMetric: undefined;
    EditHealthMetric: { metricId: string };
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