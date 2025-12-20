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
import { NewPasswordScreenNavigationProps } from '../../navigation/NavigationTypes';
import { styles } from './NewPasswordScreenStyles';
import { useNewPassword } from '../../hooks/useNewPassword';

const BRAND_COLOR = '#8BC34A';

type Props = NewPasswordScreenNavigationProps;

const NewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route.params as any;
  const email = params?.email || '';
  const token = params?.token || '';

  const {
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
  } = useNewPassword(navigation, email, token);

  const passwordValidation = getPasswordValidation();

  // Success Screen
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <Icon name="check" size={60} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.successTitle}>Đặt lại mật khẩu thành công!</Text>
          <Text style={styles.successMessage}>
            Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={handleBackToLogin}>
            <Icon name="login" size={20} color="#FFFFFF" />
            <Text style={styles.successButtonText}>Đi đến trang đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
                  <Icon name="lock-reset" size={60} color="#FFFFFF" />
                </View>
                <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
                <Text style={styles.headerSubtitle}>
                  Khôi phục quyền truy cập vào tài khoản của bạn
                </Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tạo mật khẩu mới</Text>
              <Text style={styles.cardSubtitle}>
                Vui lòng nhập mật khẩu mới của bạn bên dưới.
              </Text>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Mật khẩu mới <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                newPasswordError && styles.inputWrapperError
              ]}>
                <Icon name="lock-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Icon 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {newPasswordError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{newPasswordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Xác nhận mật khẩu mới <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                confirmPasswordError && styles.inputWrapperError
              ]}>
                <Icon name="lock-check-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu mới"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Icon 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
              <View style={styles.requirementItem}>
                <Icon 
                  name={passwordValidation.minLength ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={passwordValidation.minLength ? BRAND_COLOR : "#9CA3AF"} 
                />
                <Text style={styles.requirementText}>Ít nhất 8 ký tự</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={passwordValidation.hasLowerCase ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={passwordValidation.hasLowerCase ? BRAND_COLOR : "#9CA3AF"} 
                />
                <Text style={styles.requirementText}>Một chữ thường</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={passwordValidation.hasUpperCase ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={passwordValidation.hasUpperCase ? BRAND_COLOR : "#9CA3AF"} 
                />
                <Text style={styles.requirementText}>Một chữ hoa</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={passwordValidation.hasNumber ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={passwordValidation.hasNumber ? BRAND_COLOR : "#9CA3AF"} 
                />
                <Text style={styles.requirementText}>Một chữ số</Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity 
              style={[styles.resetButton, isLoading && { opacity: 0.6 }]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.resetButtonText}>Đang xử lý...</Text>
                </>
              ) : (
                <>
                  <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            <View style={styles.backContainer}>
              <TouchableOpacity 
                onPress={handleGoBack}
                disabled={isLoading}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={18} color={BRAND_COLOR} />
                <Text style={styles.backText}>Quay lại bước xác minh mã</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="shield-lock" size={20} color="#10B981" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Mật khẩu mạnh</Text>
              <Text style={styles.infoText}>
                Sử dụng mật khẩu mạnh giúp bảo vệ tài khoản của bạn khỏi truy cập trái phép.
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

export default NewPasswordScreen;