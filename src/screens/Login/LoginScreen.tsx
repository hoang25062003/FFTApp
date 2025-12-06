// FILE: src/screens/Login/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, Image, Alert, ScrollViewProps } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { GlobalStyles } from '../../constants/Styles';
import { LoginScreenNavigationProps } from '../../navigation/NavigationTypes'; 
import { AuthRoutes } from '../../navigation/RouteNames'; 
import { useLoginValidation, LoginPayload } from '../../hooks/useLoginValidation'; 
import styles from './LoginScreenStyles'; 
import { login } from '../../services/AuthService'; 
import ScreenWrapper from '../../components/ScreenWrapper'; 

const logo = require('../../assets/images/logo.png'); 

const scrollViewProps: ScrollViewProps = {
  keyboardShouldPersistTaps: 'handled',
};

const LoginScreen: React.FC<LoginScreenNavigationProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [validationError, setValidationError] = useState(''); 

  const { validateLoginForm } = useLoginValidation();

  const handleLogin = async () => {
    if (isLoading) return;

    const payload: LoginPayload = { email, password };

    const isValid = validateLoginForm(payload); 
    if (!isValid) {
      console.log('Xác thực thất bại.');
      return; 
    }

    setValidationError(''); 
    setIsLoading(true);

    try {
      const response = await login(payload); 

      console.log('Đăng nhập thành công, Token:', response.token);
      
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      
      Alert.alert('Thành công', 'Đăng nhập thành công!');

      // Reset navigation stack và chuyển sang MainAppTabs

navigation.dispatch(
    CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainAppTabs' as never }], // ✅ Thêm 'as never' để bypass type check
    })
);
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Đã xảy ra lỗi không xác định.';
      console.error('Lỗi đăng nhập:', message);
      Alert.alert('Đăng nhập thất bại', message);
      
    } finally {
      setIsLoading(false); 
    }
  };

  const handleGoogleLogin = () => {
    console.log('Đăng nhập bằng Google');
  };

  const handleForgotPassword = () => {
    navigation.navigate(AuthRoutes.ForgotPassword);
  };

  const handleRegister = () => {
    navigation.navigate(AuthRoutes.Register);
  };

  return (
    <ScreenWrapper scrollable={false} scrollViewProps={scrollViewProps}> 
      

      <View style={GlobalStyles.headerContainer}>
        <Image source={logo} style={GlobalStyles.logo} />
        <Text style={GlobalStyles.welcomeText}>Chào mừng trở lại!</Text>
        <Text style={GlobalStyles.subtitleText}>
          Đăng nhập để tiếp tục sử dụng dịch vụ
        </Text>
      </View>


      <Text style={styles.inputLabel}>Email</Text>
      <CustomInput
        placeholder="Nhập địa chỉ email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!isLoading}
      />

      <Text style={styles.inputLabel}>Mật khẩu</Text>
      <CustomInput
        placeholder="Nhập mật khẩu của bạn"
        value={password}
        onChangeText={setPassword}
        isPassword={true}
        secureTextEntry={true} 
        editable={!isLoading}
      />
      
      {validationError ? (
        <Text style={styles.errorText}>{validationError}</Text>
      ) : null}

      {/* 3. Options */}
      <View style={styles.optionsContainer}>
        <View style={styles.checkboxContainer}>
          <Text
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkboxText}
          >
            {rememberMe ? '☑ Ghi nhớ tôi' : '☐ Ghi nhớ tôi'}
          </Text>
        </View>
        <CustomButton
          title="Quên mật khẩu?"
          onPress={handleForgotPassword}
          variant="link"
          disabled={isLoading}
        />
      </View>

      {/* 4. Login Button */}
      <CustomButton
        title={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        onPress={handleLogin}
        variant="primary"
        style={styles.loginButton}
        disabled={isLoading}
      />

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      <CustomButton
        title="Đăng nhập bằng Google"
        onPress={handleGoogleLogin}
        variant="google"
        disabled={isLoading}
      />

      {/* 7. Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Bạn chưa có tài khoản?</Text>
        <CustomButton
          title="Đăng ký"
          onPress={handleRegister}
          variant="secondary"
          textStyle={{ fontWeight: 'bold' }}
          disabled={isLoading}
        />
      </View>


    </ScreenWrapper>
  );
};

export default LoginScreen;