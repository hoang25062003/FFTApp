import React from 'react';
// 1. Import hàm tạo Stack Navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

// 2. Import Type và Route Names đã định nghĩa
import { AuthStackParamList } from './NavigationTypes';
import { AppRoutes, AuthRoutes } from './RouteNames';

// 3. Import các màn hình
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import HomeScreen from '../screens/HomePage/HomeSreen';

// 4. Khởi tạo Stack Navigator với AuthStackParamList đã được định nghĩa
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator component
 * Đây là bộ điều hướng (Stack Navigator) chứa các màn hình
 * liên quan đến xác thực (Đăng nhập, Đăng ký).
 */
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName={AuthRoutes.Login} // Đặt màn hình Đăng nhập làm màn hình đầu tiên
      screenOptions={{
        headerShown: false, // Ẩn header mặc định cho các màn hình xác thực
      }}
    >
      <AuthStack.Screen
        name={AuthRoutes.Login} // Tên route: 'LoginScreen'
        component={LoginScreen}
      />
      <AuthStack.Screen
        name={AuthRoutes.Register} // Tên route: 'RegisterScreen'
        component={RegisterScreen}
      />
      <AuthStack.Screen
        name={AppRoutes.Home} 
        component={HomeScreen} 
      />
      {/* Các màn hình xác thực khác (như ForgotPassword) sẽ được thêm vào đây */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
