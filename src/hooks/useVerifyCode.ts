import { useState, useEffect, useRef } from 'react';
import { TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { verifyEmailOtpForReset, resendOtp, ApiException } from '../services/AuthService';
import { AuthRoutes } from '../navigation/RouteNames';
import { AuthStackParamList } from '../navigation/NavigationTypes';

const RESEND_TIMEOUT = 60;

export const useVerifyCode = (
  navigation: NativeStackNavigationProp<AuthStackParamList>,
  email: string
) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    if (otpError) setOtpError('');

    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (isLoading) return;

    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const response = await verifyEmailOtpForReset(
        { email, code: otpCode },
        'reset'
      );
      
      navigation.navigate(AuthRoutes.NewPassword, {
        email,
        code: otpCode,
        token: response.token
      });
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 400) {
          setOtpError('Mã xác thực không đúng');
        } else if (error.status === 404) {
          setOtpError('Không tìm thấy mã xác thực');
        } else if (error.status === 410) {
          setOtpError('Mã xác thực đã hết hạn');
        } else {
          setOtpError(error.message || 'Xác thực thất bại. Vui lòng thử lại');
        }
      } else {
        setOtpError('Lỗi kết nối. Vui lòng kiểm tra internet');
      }
      
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
     
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setOtpError('');

    try {
      await resendOtp({ email, purpose: 'FORGOTPASSWORD' });
      
      Alert.alert(
        'Thành công', 
        'Mã xác thực mới đã được gửi đến email của bạn',
        [{ text: 'OK' }]
      );
      
      setCanResend(false);
      setResendTimer(RESEND_TIMEOUT);
      setOtp(['', '', '', '', '', '']);
      
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 429) {
          Alert.alert('Lỗi', 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau');
        } else {
          Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã. Vui lòng thử lại sau');
        }
      } else {
        Alert.alert('Lỗi', 'Lỗi kết nối. Vui lòng kiểm tra internet');
      }
      
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    navigation.goBack();
  };

  return {
    otp,
    isLoading,
    isResending,
    resendTimer,
    canResend,
    otpError,
    inputRefs,
    handleOtpChange,
    handleKeyPress,
    handleVerify,
    handleResendOtp,
    handleChangeEmail,
  };
};