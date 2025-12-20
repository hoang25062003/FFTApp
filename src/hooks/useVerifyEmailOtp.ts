import { useState, useEffect, useRef } from 'react';
import { TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { verifyEmailOtp, resendOtp, ApiException } from '../services/AuthService';
import { AuthRoutes } from '../navigation/RouteNames';

const RESEND_TIMEOUT = 60;

export const useVerifyEmailOtp = (email: string) => {
  const navigation = useNavigation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

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
    try {
      await verifyEmailOtp({ email, code: otpCode });
      setIsVerified(true);
    } catch (error) {
      const message = error instanceof ApiException 
        ? error.message 
        : 'Mã xác thực không đúng hoặc đã hết hạn';
      
      setOtpError(message);
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
    try {
      await resendOtp({ email, purpose: 'VERIFYACCOUNTEMAIL' });
      
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
      
      setCanResend(false);
      setResendTimer(RESEND_TIMEOUT);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const message = error instanceof ApiException 
        ? error.message 
        : 'Không thể gửi lại mã. Vui lòng thử lại sau';
      
      Alert.alert('Lỗi', message);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate(AuthRoutes.Login as never);
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    otp,
    isLoading,
    isResending,
    resendTimer,
    canResend,
    otpError,
    isVerified,
    inputRefs,
    handleOtpChange,
    handleKeyPress,
    handleVerify,
    handleResendOtp,
    handleBackToLogin,
    formatTimer,
  };
};