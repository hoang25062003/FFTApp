// FILE: src/screens/ForgotPassword/NewPasswordScreen.tsx

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

type NewPasswordNavigationProps = NativeStackNavigationProp<
    AuthStackParamList,
    typeof AuthRoutes.NewPassword
>;

const NewPasswordScreen: React.FC = () => {
    const navigation = useNavigation<NewPasswordNavigationProps>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleResetPassword = () => {
        if (password.length < 8) {
            Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 8 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu và Xác nhận mật khẩu không khớp.');
            return;
        }
        
        setIsLoading(true);
        console.log('Đặt lại mật khẩu mới...');
        
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Thành công', 'Mật khẩu của bạn đã được đặt lại thành công!');
            navigation.navigate(AuthRoutes.Login); 
        }, 2000); 
    };

    const handleGoBackToVerify = () => {
        navigation.goBack(); 
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
                <Text style={styles.description}>
                    Vui lòng nhập mật khẩu mới của bạn bên dưới.
                </Text>

                {/* Thanh tiến trình - Bước 3 Active */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleComplete}>✓</Text>
                        <Text style={styles.stepTextComplete}>Email</Text>
                    </View>
                    <View style={styles.progressLineComplete} />

                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleComplete}>✓</Text>
                        <Text style={styles.stepTextComplete}>Xác minh</Text>
                    </View>
                    <View style={styles.progressLineComplete} />
                    
                    <View style={styles.progressStep}>
                        <Text style={styles.stepCircleActive}>✓</Text>
                        <Text style={styles.stepTextActive}>Mật khẩu</Text>
                    </View>
                </View>

                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <CustomInput
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChangeText={setPassword}
                    isPassword={true}
                    secureTextEntry={true}
                    editable={!isLoading}
                />
                <Text style={styles.passwordHint}>
                    Ít nhất 8 ký tự, bao gồm chữ cái và số.
                </Text>

                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <CustomInput
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isPassword={true}
                    secureTextEntry={true}
                    editable={!isLoading}
                />

                <CustomButton
                    title={isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                    onPress={handleResetPassword}
                    variant="primary"
                    style={styles.mainButton}
                    disabled={isLoading}
                />

                <TouchableOpacity onPress={handleGoBackToVerify} style={styles.backLinkContainer}>
                    <Text style={styles.backLinkText}>Quay lại bước xác minh</Text>
                </TouchableOpacity>

            </View>
        </ScreenWrapper>
    );
};

export default NewPasswordScreen;