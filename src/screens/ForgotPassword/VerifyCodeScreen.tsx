import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import { useVerifyCode } from '../../hooks/useVerifyCode';

const BRAND_COLOR = '#8BC34A';

const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, typeof AuthRoutes.VerifyCode>>();
  
  const email = route.params?.email || '';

  const {
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
  } = useVerifyCode(navigation, email);

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