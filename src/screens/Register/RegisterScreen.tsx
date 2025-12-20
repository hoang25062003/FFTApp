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
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './RegisterScreenStyles';
import { useRegister } from '../../hooks/useRegister';

const BRAND_COLOR = '#8BC34A';
const ERROR_COLOR = '#EF4444';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const {
    scrollViewRef,
    firstNameRef,
    lastNameRef,
    emailRef,
    passwordRef,
    rePasswordRef,
    formData,
    errors,
    showPassword,
    showRePassword,
    isLoading,
    focusedInput,
    showDatePicker,
    dateObject,
    getDateLimits,
    setShowPassword,
    setShowRePassword,
    setShowDatePicker,
    updateField,
    handleFocus,
    handleBlur,
    onDateChange,
    handleRegister,
  } = useRegister(navigation);

  const { minDate, maxDate } = getDateLimits();

  const RenderError = ({ field }: { field: string }) => (
    errors[field] ? (
      <Text style={{ color: ERROR_COLOR, fontSize: 12, marginTop: 4, marginLeft: 4, lineHeight: 16 }}>
        {errors[field]}
      </Text>
    ) : null
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
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

          <View style={styles.registerCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Đăng Ký</Text>
              <Text style={styles.cardSubtitle}>Tạo tài khoản mới</Text>
            </View>

            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Họ <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'firstName' && styles.inputFocused,
                  errors.firstName && { borderColor: ERROR_COLOR }
                ]}>
                  <Icon 
                    name="account-outline" 
                    size={20} 
                    color={errors.firstName ? ERROR_COLOR : (focusedInput === 'firstName' ? BRAND_COLOR : '#6B7280')} 
                  />
                  <TextInput
                    ref={firstNameRef}
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    placeholder="Họ"
                    onFocus={() => handleFocus('firstName')}
                    onBlur={handleBlur}
                    editable={!isLoading}
                    // Auto-focus logic
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                <RenderError field="firstName" />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Tên <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'lastName' && styles.inputFocused,
                  errors.lastName && { borderColor: ERROR_COLOR }
                ]}>
                  <Icon 
                    name="account-outline" 
                    size={20} 
                    color={errors.lastName ? ERROR_COLOR : (focusedInput === 'lastName' ? BRAND_COLOR : '#6B7280')} 
                  />
                  <TextInput
                    ref={lastNameRef}
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    placeholder="Tên"
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                    editable={!isLoading}
                    // Auto-focus logic
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                <RenderError field="lastName" />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'email' && styles.inputFocused,
                errors.email && { borderColor: ERROR_COLOR }
              ]}>
                <Icon 
                  name="email-outline" 
                  size={20} 
                  color={errors.email ? ERROR_COLOR : (focusedInput === 'email' ? BRAND_COLOR : '#6B7280')} 
                />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  editable={!isLoading}
                  // Auto-focus logic
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              <RenderError field="email" />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu <Text style={styles.required}>*</Text></Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputFocused,
                errors.password && { borderColor: ERROR_COLOR }
              ]}>
                <Icon 
                  name="lock-outline" 
                  size={20} 
                  color={errors.password ? ERROR_COLOR : (focusedInput === 'password' ? BRAND_COLOR : '#6B7280')} 
                />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder="8-100 ký tự"
                  secureTextEntry={!showPassword}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  editable={!isLoading}
                  // Auto-focus logic
                  returnKeyType="next"
                  onSubmitEditing={() => rePasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <RenderError field="password" />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận lại mật khẩu <Text style={styles.required}>*</Text></Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'rePassword' && styles.inputFocused,
                errors.rePassword && { borderColor: ERROR_COLOR }
              ]}>
                <Icon 
                  name="lock-check-outline" 
                  size={20} 
                  color={errors.rePassword ? ERROR_COLOR : (focusedInput === 'rePassword' ? BRAND_COLOR : '#6B7280')} 
                />
                <TextInput
                  ref={rePasswordRef}
                  style={styles.input}
                  value={formData.rePassword}
                  onChangeText={(text) => updateField('rePassword', text)}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={!showRePassword}
                  onFocus={() => handleFocus('rePassword')}
                  onBlur={handleBlur}
                  editable={!isLoading}
                  // Auto-focus logic: Pressing Done hides keyboard or triggers next action
                  returnKeyType="done"
                  onSubmitEditing={() => setShowDatePicker(true)}
                />
                <TouchableOpacity onPress={() => setShowRePassword(!showRePassword)}>
                  <Icon name={showRePassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <RenderError field="rePassword" />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                onPress={() => { setShowDatePicker(true); handleFocus('dateOfBirth'); }}
                disabled={isLoading}
              >
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'dateOfBirth' && styles.inputFocused,
                  errors.dateOfBirth && { borderColor: ERROR_COLOR }
                ]}>
                  <Icon 
                    name="calendar-outline" 
                    size={20} 
                    color={errors.dateOfBirth ? ERROR_COLOR : (focusedInput === 'dateOfBirth' ? BRAND_COLOR : '#6B7280')} 
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.dateOfBirth}
                    placeholder="DD/MM/YYYY"
                    editable={false}
                    pointerEvents="none"
                  />
                </View>
              </TouchableOpacity>
              <RenderError field="dateOfBirth" />
              {showDatePicker && (
                <DateTimePicker
                  value={dateObject}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={maxDate}
                  minimumDate={minDate}
                />
              )}
            </View>

            {/* Gender Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính <Text style={styles.required}>*</Text></Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, formData.gender === 'Female' && styles.genderButtonActive]}
                  onPress={() => updateField('gender', 'Female')}
                  disabled={isLoading}
                >
                  <Icon name="gender-female" size={20} color={formData.gender === 'Female' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.genderButtonText, formData.gender === 'Female' && styles.genderButtonTextActive]}>Nữ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, formData.gender === 'Male' && styles.genderButtonActive]}
                  onPress={() => updateField('gender', 'Male')}
                  disabled={isLoading}
                >
                  <Icon name="gender-male" size={20} color={formData.gender === 'Male' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.genderButtonText, formData.gender === 'Male' && styles.genderButtonTextActive]}>Nam</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.registerButtonText}>Đang đăng ký...</Text>
                </>
              ) : (
                <>
                  <Icon name="account-plus" size={20} color="#FFFFFF" />
                  <Text style={styles.registerButtonText}>Đăng ký</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.infoCard}>
            <Icon name="information" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;