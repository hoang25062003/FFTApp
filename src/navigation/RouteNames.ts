/**
 * RouteNames.ts
 * * Đây là file định nghĩa tất cả tên tuyến đường (route names) 
 * được sử dụng trong React Navigation.
 * * Việc sử dụng các hằng số giúp ngăn ngừa lỗi chính tả khi điều hướng.
 */

export const AuthRoutes = {
    Login: 'LoginScreen',       // Tên màn hình Đăng nhập
    Register: 'RegisterScreen', // Tên màn hình Đăng ký
    VerifyEmailOtp: 'VerifyEmailOtp' ,
} as const;

export const AppRoutes = {
    // Các tuyến đường chính của ứng dụng sẽ được thêm vào đây sau
    Home: 'HomeScreen',
    Profile: 'ProfileScreen',
    // ...
} as const;

// Gom nhóm tất cả các Routes lại
export const RouteNames = {
    ...AuthRoutes,
    ...AppRoutes,
} as const;

export type RouteNameType = keyof typeof RouteNames;
