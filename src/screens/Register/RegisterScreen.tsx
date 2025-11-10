import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Calendar } from 'lucide-react-native'; 

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import HeaderLogo from '../../components/Header';
import styles from './RegisterScreenStyles'; 
import { RegisterScreenNavigationProps } from '../../navigation/NavigationTypes'; 
// IMPORT ROUTE MỚI
import { AuthRoutes } from '../../navigation/RouteNames'; 
import { useRegisterValidation } from '../../hooks/useValidation'; 

// 1. IMPORT HÀM API REGISTER
import { register } from '../../services/AuthService'; 
// GIẢ ĐỊNH: Đã tạo route VerifyEmailOtp (AuthRoutes.VerifyEmailOtp)

export const RegisterScreen: React.FC<RegisterScreenNavigationProps> = ({ navigation }) => {

  // State dữ liệu form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { validateRegisterForm } = useRegisterValidation(); 

  // 🧠 Khi nhấn "Đăng ký"
  const handleRegister = async () => { // <--- THÊM 'async'
    const payload = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
    };

    const isValid = validateRegisterForm(payload, confirmPassword);
    if (!isValid) return; 

    setIsLoading(true);

    // 2. THAY THẾ MÔ PHỎNG BẰNG API CALL THẬT
    try {
        // Gọi API đăng ký
        await register(payload);
        
        // 3. XỬ LÝ THÀNH CÔNG VÀ CHUYỂN HƯỚNG SANG MÀN HÌNH XÁC NHẬN OTP
        Alert.alert(
            'Đăng ký thành công', 
            'Vui lòng kiểm tra email của bạn để lấy mã xác nhận OTP và hoàn tất quá trình đăng ký.'
        );
        
        // Chuyển hướng đến màn hình xác nhận OTP, truyền Email để màn hình đó sử dụng
        navigation.navigate(AuthRoutes.VerifyEmailOtp, { email: email });

    } catch (error) {
        // 4. XỬ LÝ LỖI
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Đã xảy ra lỗi không xác định khi đăng ký.';
        Alert.alert('Đăng ký thất bại', errorMessage);
        
    } finally {
        setIsLoading(false);
    }
  };

  // 🗓 Khi nhấn icon lịch
  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  // Khi người dùng chọn ngày
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
      setDateOfBirth(formatted);
    }
  };

  return (
    <ScrollView style={styles.screenContainer} contentContainerStyle={styles.contentContainer}>
      <HeaderLogo onPress={() => navigation.goBack()} />

      <View style={styles.formContainer}>
        

        {/* Họ và Tên */}
        <View style={styles.nameRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Họ</Text>
            <CustomInput placeholder="Nguyễn" value={lastName} onChangeText={setLastName} />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Tên</Text>
            <CustomInput placeholder="Văn A" value={firstName} onChangeText={setFirstName} />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <CustomInput 
          placeholder="email@example.com" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
        />

        {/* Mật khẩu */}
        <Text style={styles.label}>Mật khẩu</Text>
        <CustomInput 
          placeholder="••••••••" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          isPassword 
        />

        {/* Xác nhận mật khẩu */}
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <CustomInput 
          placeholder="••••••••" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry 
          isPassword 
        />

        {/* Ngày sinh */}
        <Text style={styles.label}>Ngày sinh</Text>
        <TouchableOpacity onPress={handleOpenDatePicker}>
          <CustomInput
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            iconRight={<Calendar size={20} color="#888" />}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {/* Giới tính */}
        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity onPress={() => setGender('Male')} style={styles.radioButtonContainer}>
            <View style={[styles.radioCircle, gender === 'Male' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Nam</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender('Female')} style={styles.radioButtonContainer}>
            <View style={[styles.radioCircle, gender === 'Female' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Nữ</Text>
          </TouchableOpacity>
        </View>

        {/* Số điện thoại */}
        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput
          placeholder="(+84) 123 456 789"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* Nút đăng ký */}
        <CustomButton
          title={isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          onPress={handleRegister}
          variant="primary"
          style={styles.registerButton}
        />

        {/* Link đăng nhập */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <CustomButton
            title="Đăng nhập"
            onPress={() => navigation.navigate(AuthRoutes.Login)}
            variant="link"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
