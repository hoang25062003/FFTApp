import { useState } from 'react';
import { Alert } from 'react-native';
import { forgotPassword, ApiException } from '../services/AuthService';
import { AuthRoutes } from '../navigation/RouteNames';

export const useForgotPassword = (navigation: any) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handleSendCode = async () => {
    if (isLoading) return;

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    setEmailError('');

    try {
      await forgotPassword({ email: email.trim() });
      
      navigation.navigate(AuthRoutes.VerifyCode, { email: email.trim() });
      
      Alert.alert(
        'Thành công',
        'Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 404) {
          setEmailError('Email không tồn tại trong hệ thống');
        } else if (error.status === 429) {
          setEmailError('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau');
        } else {
          setEmailError(error.message);
        }
      } else {
        setEmailError('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại');
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate(AuthRoutes.Login);
  };

  return {
    email,
    isLoading,
    emailError,
    handleEmailChange,
    handleSendCode,
    handleBackToLogin,
  };
};