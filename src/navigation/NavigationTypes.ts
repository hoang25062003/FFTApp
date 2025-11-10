import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthRoutes } from './RouteNames'; // Lấy tên các routes từ file đã tạo
import {  AppRoutes } from './RouteNames';
/**
 * 1. Định nghĩa ParamList cho Auth Stack
 * Đây là bản đồ ánh xạ tên Route (Key) với các tham số (Value) nó nhận.
 * Nếu Route không nhận tham số, giá trị là 'undefined'.
 */
export type AuthStackParamList = {
    // AuthRoutes.Login sẽ là 'LoginScreen'
    [AuthRoutes.Login]: undefined; 
    
    // AuthRoutes.Register sẽ là 'RegisterScreen'
    [AuthRoutes.Register]: undefined; 
    VerifyEmailOtp: { email: string };
    [AppRoutes.Home]: undefined; 
    [AppRoutes.Profile]: undefined;
    // Ví dụ: Nếu bạn có màn hình quên mật khẩu nhận tham số:
    // ForgotPasswordScreen: { email?: string };
};


/**
 * 2. Tạo Type cho Props của từng màn hình
 * Type này giúp định nghĩa chính xác các props (navigation và route) 
 * mà mỗi component màn hình trong Auth Stack sẽ nhận.
 * * @template T - Tên Route (Ví dụ: 'LoginScreen' hoặc 'RegisterScreen')
 */
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;
  
  
/**
 * 3. Type cụ thể cho màn hình Đăng ký
 * Type này sẽ được sử dụng trực tiếp trong RegisterScreen.tsx
 */
export type RegisterScreenNavigationProps = AuthScreenProps<typeof AuthRoutes.Register>;

/**
 * 4. Type cụ thể cho màn hình Đăng nhập
 */
export type LoginScreenNavigationProps = AuthScreenProps<typeof AuthRoutes.Login>;
export type VerifyEmailOtpScreenNavigationProps = AuthScreenProps<'VerifyEmailOtp'>;
export type HomeScreenNavigationProps = AuthScreenProps<typeof AppRoutes.Home>;