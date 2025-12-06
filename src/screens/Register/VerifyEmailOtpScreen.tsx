// FILE: src/screens/VerifyEmailOtp/VerifyEmailOtpScreen.tsx

import React, { useState } from 'react';
// 👈 THÊM Image
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native'; 

import CustomInput from '../../components/CustomInput'; 
import CustomButton from '../../components/CustomButton'; 
// import HeaderLogo from '../../components/Header'; // 👈 BỎ IMPORT NÀY
import { AuthRoutes, AppRoutes } from '../../navigation/RouteNames'; 
import { VerifyEmailOtpScreenNavigationProps } from '../../navigation/NavigationTypes'; 
// import { Colors } from '../../constants/Colors'; // Bỏ import không dùng
import styles from './VerifyEmailOtpScreenStyles'; 

// Import các hàm API
import { verifyEmailOtp, resendOtp } from '../../services/AuthService'; 

// --- ĐỊNH NGHĨA HÌNH ẢNH (GIẢ ĐỊNH) ---
const logo = require('../../assets/images/logo.png'); 

// --- BỔ SUNG LOCAL STYLE CHO LOGO VÀ CONTAINER ---
// Styles này được dùng tạm thời nếu bạn chưa thêm vào VerifyEmailOtpScreenStyles.ts
const customLocalStyles = StyleSheet.create({
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30, // Khoảng cách giữa logo và tiêu đề
        paddingTop: 50,  // Đẩy logo xuống
    },
    logoImage: {
        width: 120, // Kích thước cố định cho logo
        height: 120,
        resizeMode: 'contain',
    },
});

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
            // 👈 ĐÃ SỬA LỖI CÚ PHÁP
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Lỗi không xác định khi gửi lại mã.';
            Alert.alert('Gửi lại mã thất bại', errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ScrollView style={styles.screenContainer} contentContainerStyle={styles.contentContainer}>
            {/* 👈 THAY THẾ HeaderLogo bằng View chứa Image Logo */}
            <View style={customLocalStyles.logoContainer}>
                <Image
                    source={logo}
                    style={customLocalStyles.logoImage}
                />
            </View>

            <Text style={styles.title}>Xác minh tài khoản của bạn</Text>
            <Text style={styles.subtitle}>
                Vui lòng nhập mã xác thực đã gửi đến email của bạn ({registeredEmail || '...'}).
            </Text>

            <View style={styles.inputContainer}>
                {/* Input Mã xác thực */}
                <CustomInput
                    placeholder="••••••"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6} // Giới hạn 6 ký tự
                    style={styles.otpInputText} 
                />
            </View>

            {/* Nút Xác thực */}
            <CustomButton
                title={isLoading ? 'Đang xác thực...' : 'Xác thực'}
                onPress={handleVerify}
                variant="primary"
                disabled={isLoading || isResending || otpCode.length !== 6}
                style={styles.buttonStyle}
            />

            {/* Nút Gửi lại mã */}
            <CustomButton
                title={isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
                onPress={handleResend}
                variant="link"
                disabled={isLoading || isResending}
                style={styles.resendButton}
            />

            {/* Link Đăng nhập */}
            <View style={styles.linkContainer}>
                <Text style={styles.loginText}>Đã có tài khoản? </Text>
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