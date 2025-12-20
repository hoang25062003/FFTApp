import { useState } from 'react';
import { resetPasswordWithOtp, ApiException } from '../services/AuthService';
import { AuthRoutes } from '../navigation/RouteNames';

interface PasswordValidation {
  minLength: boolean;
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
}

export const useNewPassword = (
  navigation: any,
  email: string,
  token: string
) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const getPasswordValidation = (): PasswordValidation => ({
    minLength: newPassword.length >= 8,
    hasLowerCase: /(?=.*[a-z])/.test(newPassword),
    hasUpperCase: /(?=.*[A-Z])/.test(newPassword),
    hasNumber: /(?=.*\d)/.test(newPassword),
  });

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ số';
    }
    return '';
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (newPasswordError) setNewPasswordError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    setNewPasswordError('');
    setConfirmPasswordError('');

    const newPasswordValidation = validatePassword(newPassword);
    if (newPasswordValidation) {
      setNewPasswordError(newPasswordValidation);
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      return;
    }

    if (!email || !token) {
      setNewPasswordError('Thiếu thông tin xác thực. Vui lòng thử lại từ đầu');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithOtp({
        email,
        token,
        newPassword,
        rePassword: confirmPassword,
      });
      
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 400) {
          setNewPasswordError('Token không hợp lệ hoặc đã hết hạn');
        } else if (error.status === 404) {
          setNewPasswordError('Không tìm thấy yêu cầu đặt lại mật khẩu');
        } else if (error.status === 401) {
          setNewPasswordError('Token xác thực không hợp lệ');
        } else {
          setNewPasswordError(error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau');
        }
      } else {
        setNewPasswordError('Lỗi kết nối. Vui lòng kiểm tra internet');
      }
      
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate(AuthRoutes.Login);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    newPassword,
    confirmPassword,
    showNewPassword,
    showConfirmPassword,
    isLoading,
    newPasswordError,
    confirmPasswordError,
    isSuccess,
    setShowNewPassword,
    setShowConfirmPassword,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleResetPassword,
    handleBackToLogin,
    handleGoBack,
    getPasswordValidation,
  };
};