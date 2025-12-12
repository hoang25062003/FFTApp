import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from './VerifyCodeScreenStyle';
import { AuthRoutes } from '../../navigation/RouteNames';
import { AuthStackParamList } from '../../navigation/NavigationTypes';
import { 
  verifyEmailOtpForReset, 
  resendOtp, 
  ApiException 
} from '../../services/AuthService';

const RESEND_TIMEOUT = 60; // 60 seconds

const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, typeof AuthRoutes.VerifyCode>>();
  
  const BRAND_COLOR = '#8BC34A';
  const email = route.params?.email || '';

  // State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  // Timer countdown
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

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
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
      // Call API to verify OTP for password reset
      const response = await verifyEmailOtpForReset(
        { 
          email: email, 
          code: otpCode 
        },
        'reset' // purpose for password reset
      );
      
      // Navigate to NewPassword screen with token
      navigation.navigate(AuthRoutes.NewPassword, {
        email: email,
        code: otpCode,
        token: response.token // Pass token from API response
      });
    } catch (error) {
      if (error instanceof ApiException) {
        // Handle specific API errors
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
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
      
      console.error('Verify OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setOtpError('');

    try {
      // Call API to resend OTP
      await resendOtp({ 
        email: email,
        purpose: 'FORGOTPASSWORD' 
      });
      
      Alert.alert(
        'Thành công', 
        'Mã xác thực mới đã được gửi đến email của bạn',
        [{ text: 'OK' }]
      );
      
      // Reset timer and OTP inputs
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
                <View style={styles.iconContainer}>
                  <Icon name="lock-check-outline" size={60} color="#FFFFFF" />
                </View>
                <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
                <Text style={styles.headerSubtitle}>
                  Khôi phục quyền truy cập vào tài khoản của bạn
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={styles.progressCircleCompleted}>
                <Icon name="check" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.progressStepNumber}>1</Text>
            </View>
            <View style={styles.progressLineActive} />
            <View style={styles.progressStep}>
              <View style={styles.progressCircleActive}>
                <Text style={styles.progressCircleActiveText}>2</Text>
              </View>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressCircle}>
                <Icon name="lock" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.progressStepNumber}>3</Text>
            </View>
          </View>

          {/* OTP Card */}
          <View style={styles.otpCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Xác minh email của bạn</Text>
              <Text style={styles.cardSubtitle}>
                Chúng tôi đã gửi mã xác minh 6 chữ số đến
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* OTP Input Row */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (inputRefs.current) {
                      inputRefs.current[index] = ref;
                    }
                  }}
                  style={[
                    styles.otpInput,
                    digit !== '' && styles.otpInputFilled,
                    otpError !== '' && styles.otpInputError
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>

            {otpError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{otpError}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity 
              style={[styles.verifyButton, isLoading && { opacity: 0.6 }]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.verifyButtonText}>Đang xác minh...</Text>
                </>
              ) : (
                <>
                  <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.verifyButtonText}>Xác minh mã</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResendOtp}
                  disabled={isResending}
                  style={styles.resendButton}
                >
                  {isResending ? (
                    <ActivityIndicator color={BRAND_COLOR} size="small" />
                  ) : (
                    <>
                      <Icon name="email-sync-outline" size={18} color={BRAND_COLOR} />
                      <Text style={styles.resendText}>Gửi lại mã</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.timerContainer}>
                  <Icon name="clock-outline" size={18} color="#6B7280" />
                  <Text style={styles.timerText}>
                    Gửi lại mã trong {resendTimer} giây
                  </Text>
                </View>
              )}
            </View>

            {/* Change Email */}
            <View style={styles.changeEmailContainer}>
              <TouchableOpacity 
                onPress={handleChangeEmail}
                disabled={isLoading}
                style={styles.changeEmailButton}
              >
                <Icon name="arrow-left" size={18} color={BRAND_COLOR} />
                <Text style={styles.changeEmailText}>Đổi email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="information" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Kiểm tra email của bạn</Text>
              <Text style={styles.infoText}>
                Nếu không thấy email, vui lòng kiểm tra trong thư mục spam hoặc rác.
              </Text>
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

export default VerifyCodeScreen;