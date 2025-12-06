// FILE: src/screens/ForgotPassword/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'; 
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/NavigationTypes';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import { AuthRoutes } from '../../navigation/RouteNames';
import styles from './ForgotPasswordFlowStyles'; 

const logo = require('../../assets/images/logo.png'); 

type ForgotPasswordNavigationProps = NativeStackNavigationProp<
    AuthStackParamList,
    typeof AuthRoutes.ForgotPassword
>;

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ForgotPasswordNavigationProps>(); 
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleSendCode = () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email.');
            return;
        }
        
        setIsLoading(true);
        console.log(`Gửi mã xác minh đến: ${email}`);
        
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate(AuthRoutes.VerifyCode, { email: email }); 
        }, 2000); 
    };

    const handleGoBack = () => navigation.goBack();
    const handleGoToLogin = () => navigation.navigate(AuthRoutes.Login); 

    return (
        <ScreenWrapper scrollable={true}> 
            <View style={styles.container}>
                
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Mật khẩu mới</Text>

                <View style={styles.logoContainer}>
                    <Image source={logo} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.mainHeading}>Đặt lại mật khẩu</Text>
                <Text style={styles.subHeading}>Quên mật khẩu?</Text>
                <Text style={styles.description}>
                    Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
                </Text>

                {/* Thanh tiến trình - Bước 1 Active */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleActive}>✓</Text>
                        <Text style={styles.stepTextActive}>Email</Text>
                    </View>
                    <View style={styles.progressLineActive} />

                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleInactive}>✓</Text>
                        <Text style={styles.stepTextInactive}>Xác minh</Text>
                    </View>
                    <View style={styles.progressLineInactive} />
                    
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleInactive}>✓</Text>
                        <Text style={styles.stepTextInactive}>Mật khẩu</Text>
                    </View>
                </View>

                <Text style={styles.inputLabel}>Email</Text>
                <CustomInput
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!isLoading}
                />

                <CustomButton
                    title={isLoading ? 'Đang gửi...' : 'Gửi mã xác minh'}
                    onPress={handleSendCode}
                    variant="primary"
                    style={styles.mainButton} 
                    disabled={isLoading}
                />

                <TouchableOpacity onPress={handleGoToLogin} style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>Về trang đăng nhập</Text>
                </TouchableOpacity>

            </View>
        </ScreenWrapper>
    );
};

export default ForgotPasswordScreen;