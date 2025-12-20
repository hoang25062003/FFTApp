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
import { ForgotPasswordScreenNavigationProps } from '../../navigation/NavigationTypes';
import { styles } from './ForgotPasswordScreenStyles';
import { useForgotPassword } from '../../hooks/useForgotPassword';

const BRAND_COLOR = '#8BC34A';

type Props = ForgotPasswordScreenNavigationProps;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const {
    email,
    isLoading,
    emailError,
    handleEmailChange,
    handleSendCode,
    handleBackToLogin,
  } = useForgotPassword(navigation);

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
              <Text style={styles.cardTitle}>Quên mật khẩu?</Text>
              <Text style={styles.cardSubtitle}>
                Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                emailError && styles.inputWrapperError
              ]}>
                <Icon name="email-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Send Button */}
            <TouchableOpacity 
              style={[styles.sendButton, isLoading && { opacity: 0.6 }]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.sendButtonText}>Đang gửi...</Text>
                </>
              ) : (
                <>
                  <Icon name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Gửi mã xác minh</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.loginContainer}>
              <TouchableOpacity 
                onPress={handleBackToLogin}
                disabled={isLoading}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={18} color={BRAND_COLOR} />
                <Text style={styles.backText}>Về trang đăng nhập</Text>
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

export default ForgotPasswordScreen;