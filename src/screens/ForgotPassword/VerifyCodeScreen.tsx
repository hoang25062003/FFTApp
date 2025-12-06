// FILE: src/screens/ForgotPassword/VerifyCodeScreen.tsx

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'; 
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/NavigationTypes';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import { AuthRoutes } from '../../navigation/RouteNames';
import styles from './ForgotPasswordFlowStyles'; 

const logo = require('../../assets/images/logo.png'); 

type VerifyCodeNavigationProps = NativeStackNavigationProp<
    AuthStackParamList,
    typeof AuthRoutes.VerifyCode
>;

type VerifyCodeRouteProps = RouteProp<
    AuthStackParamList,
    typeof AuthRoutes.VerifyCode
>;

const VerifyCodeScreen: React.FC = () => {
    const navigation = useNavigation<VerifyCodeNavigationProps>();
    const route = useRoute<VerifyCodeRouteProps>();
    const emailFromRoute = route.params?.email || 'john.doe@example.com';
    
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleVerifyCode = () => {
        if (code.length < 6) {
            Alert.alert('Lỗi', 'Mã xác minh phải có 6 chữ số.');
            return;
        }
        
        setIsLoading(true);
        console.log(`Xác minh mã: ${code} cho email: ${emailFromRoute}`);
        
        setTimeout(() => {
            setIsLoading(false);
            if (code === '123456') {
                navigation.navigate(AuthRoutes.NewPassword); 
            } else {
                Alert.alert('Lỗi', 'Mã xác minh không hợp lệ.');
            }
        }, 2000); 
    };

    const handleResendCode = () => {
        console.log('Gửi lại mã xác minh...');
        Alert.alert('Thông báo', 'Mã xác minh đã được gửi lại.');
    };

    const handleChangeEmail = () => {
        navigation.navigate(AuthRoutes.ForgotPassword); 
    };

    const handleGoBack = () => navigation.goBack();

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
                <Text style={styles.subHeading}>Xác minh email của bạn</Text>
                <Text style={styles.description}>
                    Chúng tôi đã gửi mã xác minh 6 chữ số đến **{emailFromRoute}**.
                </Text>

                {/* Thanh tiến trình - Bước 2 Active */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleComplete}>✓</Text>
                        <Text style={styles.stepTextComplete}>Email</Text>
                    </View>
                    <View style={styles.progressLineComplete} />

                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleActive}>✓</Text>
                        <Text style={styles.stepTextActive}>Xác minh</Text>
                    </View>
                    <View style={styles.progressLineActive} />
                    
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleInactive}>✓</Text>
                        <Text style={styles.stepTextInactive}>Mật khẩu</Text>
                    </View>
                </View>

                <Text style={styles.inputLabel}>Mã xác minh *</Text>
                <CustomInput
                    placeholder="Nhập mã xác minh 6 chữ số"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!isLoading}
                />

                <CustomButton
                    title={isLoading ? 'Đang xác minh...' : 'Xác minh'}
                    onPress={handleVerifyCode}
                    variant="primary"
                    style={styles.mainButton} 
                    disabled={isLoading}
                />
                
                <View style={styles.actionLinksContainer}>
                    <CustomButton
                        title="Gửi lại mã"
                        onPress={handleResendCode}
                        variant="link"
                        textStyle={styles.linkText}
                        disabled={isLoading}
                    />
                    <CustomButton
                        title="Đổi email"
                        onPress={handleChangeEmail}
                        variant="link"
                        textStyle={styles.linkText}
                        disabled={isLoading}
                    />
                </View>

            </View>
        </ScreenWrapper>
    );
};

export default VerifyCodeScreen;