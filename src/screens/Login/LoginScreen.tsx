import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native'; // Import Alert
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { GlobalStyles } from '../../constants/Styles';
import { LoginScreenNavigationProps } from '../../navigation/NavigationTypes'; 
import { AppRoutes, AuthRoutes } from '../../navigation/RouteNames'; 
// Đảm bảo bạn đã import đúng từ các đường dẫn sau:
import { useLoginValidation, LoginPayload } from '../../hooks/useLoginValidation'; 
import styles from './LoginScreenStyles'; 
import { login } from '../../services/AuthService'; // Import hàm API login

// Import logo
const logo = require('../../assets/images/logo.png'); 

const LoginScreen: React.FC<LoginScreenNavigationProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  
  // validationError được giữ lại nhưng không sử dụng trực tiếp nếu hook dùng Alert
  const [validationError, setValidationError] = useState(''); 

  // KHỞI TẠO HOOK
  const { validateLoginForm } = useLoginValidation();

  const handleLogin = async () => {
    if (isLoading) return; // Ngăn chặn double submit

    const payload: LoginPayload = { email, password };

    // 1. Xác thực đầu vào
    const isValid = validateLoginForm(payload); 
    if (!isValid) {
      console.log('Xác thực thất bại.');
      return; // Hook đã hiển thị Alert lỗi
    }

    setValidationError(''); 
    setIsLoading(true); // Bắt đầu tải

    try {
      // 2. GỌI API ĐĂNG NHẬP
      const response = await login(payload); 

      // 3. Xử lý thành công
      console.log('Đăng nhập thành công, Token:', response.token);
      
      // TODO: Lưu token vào AsyncStorage hoặc Context/Redux
      
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      // TODO: Điều hướng đến màn hình chính
      // navigation.navigate(MainRoutes.Home); 
      navigation.reset({
      index: 0,
      routes: [{ name: AppRoutes.Home }],
    });
    } catch (error) {
      // 4. Xử lý lỗi API (lỗi đã được ném ra từ AuthService.ts)
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
      console.error('Lỗi đăng nhập:', message);
      Alert.alert('Đăng nhập thất bại', message);
      
    } finally {
      setIsLoading(false); // Kết thúc tải
    }
  };

  const handleGoogleLogin = () => {
    console.log('Đăng nhập bằng Google');
    // Thực hiện logic đăng nhập Google 
  };

  const handleForgotPassword = () => {
    console.log('Điều hướng đến Quên mật khẩu');
    // navigation.navigate('ForgotPasswordScreen'); 
  };

  const handleRegister = () => {
    console.log('Chuyển đến màn hình Đăng ký');
    navigation.navigate(AuthRoutes.Register);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={GlobalStyles.container}>
      <View style={GlobalStyles.headerContainer}>
        <Image source={logo} style={GlobalStyles.logo} />
        <Text style={GlobalStyles.welcomeText}>Chào mừng trở lại!</Text>
        <Text style={GlobalStyles.subtitleText}>
          Đăng nhập để tiếp tục sử dụng dịch vụ của chúng tôi
        </Text>
      </View>

      <Text style={styles.inputLabel}>Email</Text>
      <CustomInput
        placeholder="Nhập địa chỉ email của bạn"
        value={email}
        onChangeText={setEmail} // Giữ cho hàm đơn giản, xóa setValidationError là không cần thiết vì ta dùng Alert
        keyboardType="email-address"
        editable={!isLoading}
      />

      <Text style={styles.inputLabel}>Mật khẩu</Text>
      <CustomInput
        placeholder="Nhập mật khẩu của bạn"
        value={password}
        onChangeText={setPassword} // Giữ cho hàm đơn giản
        isPassword={true}
        secureTextEntry={true} 
        editable={!isLoading}
      />
      
      {/* Hiển thị lỗi (Chỉ dùng nếu bạn tùy chỉnh hook validation) */}
      {validationError ? (
        <Text style={styles.errorText}>{validationError}</Text>
      ) : null}

      <View style={styles.optionsContainer}>
        <View style={styles.checkboxContainer}>
          <Text
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkboxText}
          >
            {rememberMe ? '☑ Ghi nhớ tôi' : '☐ Ghi nhớ tôi'}
          </Text>
        </View>
        <CustomButton
          title="Quên mật khẩu?"
          onPress={handleForgotPassword}
          variant="link"
          disabled={isLoading}
        />
      </View>

      <CustomButton
        title={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'} // Thay đổi tiêu đề khi loading
        onPress={handleLogin}
        variant="primary"
        style={styles.loginButton}
        disabled={isLoading} // Vô hiệu hóa khi đang tải
      />

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      <CustomButton
        title="Đăng nhập bằng Google"
        onPress={handleGoogleLogin}
        variant="google"
        disabled={isLoading}
      />

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Bạn chưa có tài khoản?</Text>
        <CustomButton
          title="Đăng ký"
          onPress={handleRegister}
          variant="secondary"
          textStyle={{ fontWeight: 'bold' }}
          disabled={isLoading}
        />
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>làm bởi nhóm SEP490</Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;