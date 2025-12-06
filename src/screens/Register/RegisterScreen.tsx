// FILE: RegisterScreen.tsx (Đã cập nhật)

import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, Platform, ScrollViewProps } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Calendar } from 'lucide-react-native'; 

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import HeaderLogo from '../../components/Header';
import styles from './RegisterScreenStyles'; 
import { RegisterScreenNavigationProps } from '../../navigation/NavigationTypes'; 
import { AuthRoutes } from '../../navigation/RouteNames'; 
import { useRegisterValidation } from '../../hooks/useValidation'; 
import { register } from '../../services/AuthService'; 
// IMPORT ScreenWrapper
import ScreenWrapper from '../../components/ScreenWrapper'; 

// Khai báo props cho ScrollView nếu cần tùy chỉnh
const scrollViewProps: ScrollViewProps = {
    keyboardShouldPersistTaps: 'handled',
    // Thêm các props khác nếu cần
};


export const RegisterScreen: React.FC<RegisterScreenNavigationProps> = ({ navigation }) => {

    // State dữ liệu form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setrePassword] = useState('');
    // ⭐ ĐÃ BỎ: phoneNumber
    const [dateOfBirth, setDateOfBirth] = useState('');
    // ⭐ ĐÃ SỬA: Bỏ 'Other' khỏi kiểu dữ liệu và giá trị mặc định
    const [gender, setGender] = useState<'Male' | 'Female'>('Male'); 
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { validateRegisterForm } = useRegisterValidation(); 

    // 🧠 Khi nhấn "Đăng ký"
    const handleRegister = async () => { 
        const payload = {
            firstName,
            lastName,
            email,
            password,
            rePassword,
            // ⭐ ĐÃ BỎ: phoneNumber
            dateOfBirth,
            gender,
        };

        const isValid = validateRegisterForm(payload, rePassword);
        if (!isValid) return; 

        setIsLoading(true);

        // 2. THAY THẾ MÔ PHỎNG BẰNG API CALL THẬT
        try {
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
        // Ngăn người dùng mở date picker khi đang loading
        if (isLoading) return; 
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
        // THAY THẾ ScrollView BẰNG ScreenWrapper
        <ScreenWrapper scrollable={true} style={styles.screenContainer} scrollViewProps={scrollViewProps}>
            
            {/* Header (cần kiểm tra xem HeaderLogo đã được bọc SafeAreaView chưa, nếu chưa thì ScreenWrapper sẽ xử lý) */}
            <HeaderLogo onPress={() => navigation.goBack()} />

            <View style={styles.formContainer}>
                
                {/* Họ và Tên */}
                <View style={styles.nameRow}>
                    <View style={styles.inputHalf}>
                        <Text style={styles.label}>Họ</Text>
                        <CustomInput placeholder="Nguyễn" value={lastName} onChangeText={setLastName} editable={!isLoading} />
                    </View>
                    <View style={styles.inputHalf}>
                        <Text style={styles.label}>Tên</Text>
                        <CustomInput placeholder="Văn A" value={firstName} onChangeText={setFirstName} editable={!isLoading} />
                    </View>
                </View>

                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <CustomInput 
                    placeholder="email@example.com" 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    editable={!isLoading}
                />

                {/* Mật khẩu */}
                <Text style={styles.label}>Mật khẩu</Text>
                <CustomInput 
                    placeholder="••••••••" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    isPassword 
                    editable={!isLoading}
                />

                {/* Xác nhận mật khẩu */}
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <CustomInput 
                    placeholder="••••••••" 
                    value={rePassword} 
                    onChangeText={setrePassword} 
                    secureTextEntry 
                    isPassword 
                    editable={!isLoading}
                />

                {/* Ngày sinh */}
                <Text style={styles.label}>Ngày sinh</Text>
                <TouchableOpacity onPress={handleOpenDatePicker} disabled={isLoading}> 
                    <CustomInput
                        placeholder="YYYY-MM-DD"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        iconRight={<Calendar size={20} color="#888" />}
                        editable={false} // Không cho phép nhập trực tiếp
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

                {/* Giới tính (ĐÃ BỎ 'Khác') */}
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderRow}>
                    {/* Nam */}
                    <TouchableOpacity onPress={() => setGender('Male')} style={styles.radioButtonContainer} disabled={isLoading}>
                        <View style={[styles.radioCircle, gender === 'Male' && styles.radioSelected]} />
                        <Text style={styles.radioLabel}>Nam</Text>
                    </TouchableOpacity>
                    {/* Nữ */}
                    <TouchableOpacity onPress={() => setGender('Female')} style={styles.radioButtonContainer} disabled={isLoading}>
                        <View style={[styles.radioCircle, gender === 'Female' && styles.radioSelected]} />
                        <Text style={styles.radioLabel}>Nữ</Text>
                    </TouchableOpacity>
                    
                </View>
                <CustomButton
                    title={isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    onPress={handleRegister}
                    variant="primary"
                    style={styles.registerButton}
                    disabled={isLoading}
                />
                <View style={styles.loginLinkContainer}>
                    <Text style={styles.loginText}>Đã có tài khoản? </Text>
                    <CustomButton
                        title="Đăng nhập"
                        onPress={() => navigation.navigate(AuthRoutes.Login)}
                        variant="link"
                        disabled={isLoading}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default RegisterScreen;