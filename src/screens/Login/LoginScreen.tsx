import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
 
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, loginWithGoogleIdToken, ApiException } from '../../services/AuthService';
import { styles } from './LoginScreenStyles';

// 1. Thêm import AuthRoutes (như File 2)
// Nếu bạn chưa có file này, hãy tạo file RouteNames.ts trong folder navigation hoặc định nghĩa tạm thời.
import { AuthRoutes } from '../../navigation/RouteNames'; 

// --- FALLBACK: Nếu bạn chưa có file AuthRoutes, hãy bỏ comment dòng dưới đây để code chạy được ngay ---
/*
const AuthRoutes = {
  Register: 'Register',
  ForgotPassword: 'ForgotPassword',
  MainAppTabs: 'MainAppTabs',
};
*/

type InputField = 'email' | 'password' | null;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const BRAND_COLOR = '#8BC34A';

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<InputField>(null);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handlers
  const handleFocus = (inputName: InputField) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (isLoading) return;

    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email không được để trống');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Mật khẩu không được để trống');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      
      await AsyncStorage.setItem('userToken', response.token);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainAppTabs' }], // Hoặc AuthRoutes.MainAppTabs nếu có
        })
      );

    } catch (error) {
      const message = error instanceof ApiException 
        ? error.message 
        : 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.';
      
      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Google đang được phát triển');
  };

  // --- CẬP NHẬT TỪ FILE 2: Sử dụng AuthRoutes để điều hướng ---
  const handleForgotPassword = () => {
    // Sử dụng constant AuthRoutes thay vì string cứng
    navigation.navigate(AuthRoutes.ForgotPassword as never);
  };

  // --- CẬP NHẬT TỪ FILE 2: Sử dụng AuthRoutes để điều hướng ---
  const handleRegister = () => {
    // Sử dụng constant AuthRoutes thay vì string cứng
    navigation.navigate(AuthRoutes.Register as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerBackground}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.headerContent}>
                <Icon name="food-apple" size={60} color="#FFFFFF" />
                <Text style={styles.appName}>Fit Food Tracker</Text>
                <Text style={styles.appTagline}>Theo dõi dinh dưỡng thông minh</Text>
              </View>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Đăng Nhập</Text>
              <Text style={styles.cardSubtitle}>Chào mừng bạn trở lại!</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputWrapper, 
                focusedInput === 'email' && styles.inputFocused,
                !!emailError && styles.inputError
              ]}>
                <Icon 
                  name="email-outline" 
                  size={20} 
                  color={focusedInput === 'email' ? BRAND_COLOR : '#6B7280'} 
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  editable={!isLoading}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[
                styles.inputWrapper, 
                focusedInput === 'password' && styles.inputFocused,
                !!passwordError && styles.inputError
              ]}>
                <Icon 
                  name="lock-outline" 
                  size={20} 
                  color={focusedInput === 'password' ? BRAND_COLOR : '#6B7280'} 
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loginButtonText}> Đang đăng nhập...</Text>
                </>
              ) : (
                <>
                  <Icon name="login" size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Icon name="shield-check" size={16} color="#9CA3AF" />
            <Text style={styles.footerText}>Thông tin của bạn được bảo mật</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;