export const AuthRoutes = {
    Login: 'LoginScreen',
    Register: 'RegisterScreen',
    VerifyEmailOtp: 'VerifyEmailOtp',

    ForgotPassword: 'ForgotPasswordScreen',
    VerifyCode: 'VerifyCodeScreen',
    NewPassword: 'NewPasswordScreen',
} as const;

export const AppRoutes = {
    Home: 'HomeScreen',
    Profile: 'ProfileScreen',
    Goal:'ViewGoalScreen',
    Scan:'ScanScreen',
    Health:'ViewHealthMetricScreen',
    MainAppTabs: 'MainAppTabs'
    
} as const;

export const RouteNames = {
    ...AuthRoutes,
    ...AppRoutes,
} as const;

export type RouteNameType = keyof typeof RouteNames;