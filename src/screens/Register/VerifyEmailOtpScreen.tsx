// FILE: src/screens/VerifyEmailOtp/VerifyEmailOtpScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

import CustomInput from '../../components/CustomInput'; // Giả định
import CustomButton from '../../components/CustomButton'; // Giả định
import HeaderLogo from '../../components/Header'; // Giả định
import { AuthRoutes, AppRoutes } from '../../navigation/RouteNames'; // Giả định các route
import { VerifyEmailOtpScreenNavigationProps } from '../../navigation/NavigationTypes'; // Giả định type
import { Colors } from '../../constants/Colors'; // Giả định Colors

// Import các hàm API
import { verifyEmailOtp, resendOtp } from '../../services/AuthService'; 

// --- GIAO DIỆN MÀN HÌNH ---
// Note: Bạn cần tạo file VerifyEmailOtpScreenStyles.ts sau. 
// Tôi sẽ sử dụng Styles trực tiếp ở đây để tiện
const localStyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 25,
        alignItems: 'center',
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 10,
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 5,
    },
    buttonStyle: {
        width: '100%',
        marginTop: 15,
        marginBottom: 10,
    },
    linkContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    resendButton: {
        // Style cho nút Gửi lại mã
        paddingVertical: 5,
        alignSelf: 'center',
        marginBottom: 50,
    },
    resendText: {
        color: Colors.textLink,
        fontSize: 14,
        fontWeight: 'bold',
    }
});
// ----------------------------

export const VerifyEmailOtpScreen: React.FC<VerifyEmailOtpScreenNavigationProps> = ({ route, navigation }) => {
    // Lấy email từ màn hình đăng ký truyền qua
    const { email: registeredEmail } = route.params; 

    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Xử lý nút XÁC THỰC
    const handleVerify = async () => {
        if (otpCode.length !== 6) { // Giả định OTP có 6 chữ số
            Alert.alert('Lỗi', 'Mã xác thực phải có 6 chữ số.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { 
                email: registeredEmail, 
                code: otpCode 
            };
            
            // Call API xác thực
            await verifyEmailOtp(payload); 

            Alert.alert('Thành công 🎉', 'Tài khoản của bạn đã được xác minh thành công. Vui lòng đăng nhập.');
            
            // Chuyển về màn hình đăng nhập
            navigation.navigate(AuthRoutes.Login); 

        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Lỗi không xác định khi xác thực mã OTP.';
            Alert.alert('Xác thực thất bại', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý nút GỬI LẠI MÃ
    const handleResend = async () => {
        setIsResending(true);
        try {
            const payload = { 
                email: registeredEmail 
            };
            
            // Call API gửi lại mã
            await resendOtp(payload); 

            Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn.');

        } catch (error) {
            const errorMessage = error = error instanceof Error 
                ? error.message 
                : 'Lỗi không xác định khi gửi lại mã.';
            Alert.alert('Gửi lại mã thất bại', errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ScrollView style={localStyles.screenContainer} contentContainerStyle={localStyles.contentContainer}>
            {/* HeaderLogo */}
            <HeaderLogo onPress={() => navigation.goBack()} />

            <Text style={localStyles.title}>Xác minh tài khoản của bạn</Text>
            <Text style={localStyles.subtitle}>
                Vui lòng nhập mã xác thực đã gửi đến email của bạn ({registeredEmail || '...'}).
            </Text>

            <View style={localStyles.inputContainer}>
                {/* Input Mã xác thực */}
                <CustomInput
                    placeholder="••••••"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6} // Giới hạn 6 ký tự
                    style={{ textAlign: 'center' }} // Căn giữa cho mã OTP
                />
            </View>

            {/* Nút Xác thực */}
            <CustomButton
                title={isLoading ? 'Đang xác thực...' : 'Xác thực'}
                onPress={handleVerify}
                variant="primary"
                disabled={isLoading || isResending || otpCode.length !== 6}
                style={localStyles.buttonStyle}
            />

            {/* Nút Gửi lại mã */}
            <CustomButton
                title={isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
                onPress={handleResend}
                variant="link"
                disabled={isLoading || isResending}
                style={localStyles.resendButton}
            />

            {/* Link Đăng nhập */}
            <View style={localStyles.linkContainer}>
                <Text style={localStyles.loginText}>Đã có tài khoản? </Text>
                <CustomButton
                    title="Đăng nhập"
                    onPress={() => navigation.navigate(AuthRoutes.Login)}
                    variant="link"
                />
            </View>
        </ScrollView>
    );
};

export default VerifyEmailOtpScreen;