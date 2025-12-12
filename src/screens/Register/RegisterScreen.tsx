import React, { useState, useRef } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { register } from '../../services/AuthService';
import { styles } from './RegisterScreenStyles';
import { AuthRoutes } from '../../navigation/RouteNames';

type InputField = 'firstName' | 'lastName' | 'email' | 'password' | 'rePassword' | 'dateOfBirth' | null;

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const BRAND_COLOR = '#8BC34A';
  const ERROR_COLOR = '#EF4444';

  // Refs để điều khiển focus và cuộn trang
  const scrollViewRef = useRef<ScrollView>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const rePasswordRef = useRef<TextInput>(null);

  // State dữ liệu form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  // State quản lý lỗi và UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<InputField>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  const getDateLimits = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return { minDate, maxDate };
  };

  const handleFocus = (inputName: InputField) => {
    setFocusedInput(inputName);
    if (inputName && errors[inputName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[inputName];
        return newErrors;
      });
    }
  };

  const handleBlur = () => setFocusedInput(null);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['dateOfBirth'];
        return newErrors;
      });
      setDateObject(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
    handleBlur();
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    // 1. Validate Họ và Tên
    if (!firstName.trim()) newErrors.firstName = "Bạn chưa điền Họ.";
    if (!lastName.trim()) newErrors.lastName = "Bạn chưa điền Tên.";
    
    // 2. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập Email";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Địa chỉ email không đúng định dạng.";
    }

    // 3. Validate Mật khẩu (Mạnh: 8-100 ký tự, có Hoa, Thường, Số, Ký tự đặc biệt)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
    if (!password) {
      newErrors.password = "Vui lòng đặt mật khẩu.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Mật khẩu cần từ 8-100 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
    }

    // 4. Validate Xác nhận mật khẩu
    if (!rePassword) {
      newErrors.rePassword = "Hãy xác nhận lại mật khẩu.";
    } else if (rePassword !== password) {
      newErrors.rePassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    // 5. Validate Ngày sinh
    if (!dateOfBirth) newErrors.dateOfBirth = "Hãy chọn ngày sinh của bạn.";

    setErrors(newErrors);

    // Tập trung trỏ đến lỗi đầu tiên (Focus + Scroll)
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.firstName) firstNameRef.current?.focus();
      else if (newErrors.lastName) lastNameRef.current?.focus();
      else if (newErrors.email) emailRef.current?.focus();
      else if (newErrors.password) passwordRef.current?.focus();
      else if (newErrors.rePassword) rePasswordRef.current?.focus();
      else if (newErrors.dateOfBirth) scrollViewRef.current?.scrollToEnd();
      
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const parts = dateOfBirth.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      rePassword,
      dateOfBirth: formattedDate,
      gender,
    };

    setIsLoading(true);
    try {
      await register(payload);
      Alert.alert('Đăng ký thành công', 'Vui lòng kiểm tra email của bạn để lấy mã OTP.');
      navigation.navigate(AuthRoutes.VerifyEmailOtp, { email: email.trim() });
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  };

  const RenderError = ({ field }: { field: string }) => (
    errors[field] ? (
      <Text style={{ color: ERROR_COLOR, fontSize: 12, marginTop: 4, marginLeft: 4, lineHeight: 16 }}>
        {errors[field]}
      </Text>
    ) : null
  );

  const { minDate, maxDate } = getDateLimits();

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
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Họ"
                    onFocus={() => handleFocus('firstName')}
                    onBlur={handleBlur}
                    editable={!isLoading}
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
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Tên"
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                    editable={!isLoading}
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  editable={!isLoading}
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
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8-100 ký tự, đủ loại ký tự"
                  secureTextEntry={!showPassword}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  editable={!isLoading}
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
                  value={rePassword}
                  onChangeText={setRePassword}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={!showRePassword}
                  onFocus={() => handleFocus('rePassword')}
                  onBlur={handleBlur}
                  editable={!isLoading}
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
                    value={dateOfBirth}
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
                  style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive]}
                  onPress={() => setGender('Female')}
                  disabled={isLoading}
                >
                  <Icon name="gender-female" size={20} color={gender === 'Female' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.genderButtonText, gender === 'Female' && styles.genderButtonTextActive]}>Nữ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive]}
                  onPress={() => setGender('Male')}
                  disabled={isLoading}
                >
                  <Icon name="gender-male" size={20} color={gender === 'Male' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.genderButtonText, gender === 'Male' && styles.genderButtonTextActive]}>Nam</Text>
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