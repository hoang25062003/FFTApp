// import React, { useState } from 'react';
// import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';

// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';
// import HeaderLogo from '../../components/Header'; // <-- Đã được xác nhận là Header
// import styles from '../Register/VerifyScreenStyles'; // <-- VẪN DÙNG STYLES CŨ
// import { AuthRoutes } from '../../navigation/RouteNames'; 
// import { VerifyScreenNavigationProps } from '../../navigation/NavigationTypes'; 

// // Giả định bạn có hàm verifyOtp và resendOtp trong AuthService
// import { verifyOtp, resendOtp } from '../../services/AuthService'; 

// // --- START COMPONENT ---
// const VerifyScreen: React.FC<VerifyScreenNavigationProps> = ({ navigation, route }) => {
//     // Lấy email từ tham số truyền vào khi chuyển từ màn hình Register
//     const { email } = route.params || {}; 

//     const [otp, setOtp] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [resendCooldown, setResendCooldown] = useState(0); // Thời gian chờ gửi lại (giây)

//     // Hàm xử lý Quay lại (Quay lại màn hình đăng ký)
//     const handleGoBack = () => {
//         navigation.goBack(); 
//     };

//     // Hàm xử lý Đăng nhập (Chuyển thẳng về màn hình Đăng nhập)
//     const handleLogin = () => {
//         navigation.navigate(AuthRoutes.Login);
//     };

//     // Hàm xử lý XÁC THỰC MÃ OTP
//     const handleVerify = async () => {
//         if (!email) {
//             Alert.alert('Lỗi', 'Không tìm thấy Email để xác thực. Vui lòng thử lại.');
//             return;
//         }
//         if (otp.length !== 6) { // Giả định OTP có 6 chữ số
//             Alert.alert('Lỗi', 'Mã xác thực phải có 6 chữ số.');
//             return;
//         }

//         setLoading(true);

//         try {
//             // GỌI API XÁC THỰC
//             await verifyOtp(email, otp); 

//             // Xử lý thành công
//             Alert.alert('Thành công', 'Tài khoản của bạn đã được xác minh. Vui lòng Đăng nhập.');
//             navigation.navigate(AuthRoutes.Login);

//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
//             Alert.alert('Xác thực thất bại', errorMessage);
            
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Hàm xử lý GỬI LẠI MÃ
//     const handleResend = async () => {
//         if (!email) {
//             Alert.alert('Lỗi', 'Không tìm thấy Email.');
//             return;
//         }
//         if (resendCooldown > 0) {
//             return; // Ngăn chặn nhấp khi đang cooldown
//         }

//         setLoading(true);
//         setResendCooldown(60); // Đặt thời gian chờ 60 giây

//         try {
//             // GỌI API GỬI LẠI MÃ
//             await resendOtp(email); 

//             Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn.');

//             // Bắt đầu đếm ngược
//             const timer = setInterval(() => {
//                 setResendCooldown(prev => {
//                     if (prev === 1) {
//                         clearInterval(timer);
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
            
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Lỗi gửi lại mã.';
//             Alert.alert('Gửi lại mã thất bại', errorMessage);
//             setResendCooldown(0); // Reset cooldown nếu thất bại
//         } finally {
//             setLoading(false);
//         }
//     };


//     return (
//         <ScrollView 
//             style={styles.screenContainer} 
//             contentContainerStyle={styles.contentContainer}
//             keyboardShouldPersistTaps="handled"
//         >
//             {/* HeaderLogo chỉ nhận onPress, không nhận title/subtitle */}
//             <HeaderLogo 
//                 onPress={handleGoBack} 
//             />

//             <View style={styles.formContainer}>
//                 {/* THAY THẾ bằng Text bình thường trong View để hiển thị tiêu đề */}
//                 <Text style={styles.headerTitle}>Xác minh tài khoản của bạn</Text>
//                 <Text style={styles.headerSubtitle}>{`Mã đã được gửi đến: ${email ? email : 'email của bạn'}`}</Text>
                
//                 {/* TIÊU ĐỀ */}
//                 <Text style={styles.title}>Mã xác thực</Text>

//                 {/* INPUT MÃ OTP */}
//                 <CustomInput 
//                     placeholder="••••••"
//                     value={otp}
//                     onChangeText={setOtp}
//                     keyboardType="number-pad"
//                     maxLength={6} // Giới hạn 6 ký tự
//                     secureTextEntry={true} 
//                     isPassword={true} // Tự động hiển thị/ẩn icon mắt nếu CustomInput hỗ trợ
//                     editable={!loading} 
//                 />

//                 {/* NÚT XÁC THỰC */}
//                 <CustomButton
//                     title={loading ? <ActivityIndicator color="#fff" /> : "Xác thực"}
//                     onPress={handleVerify}
//                     variant="primary"
//                     disabled={loading || otp.length < 6}
//                     style={styles.verifyButton}
//                 />
                
//                 {/* NÚT GỬI LẠI MÃ */}
//                 <CustomButton
//                     title={resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : "Gửi lại mã"}
//                     onPress={handleResend}
//                     variant="link"
//                     disabled={loading || resendCooldown > 0} // Vô hiệu hóa khi đang chờ
//                     style={styles.resendButton}
//                     textStyle={styles.resendText}
//                 />

//                 {/* LINK ĐĂNG NHẬP */}
//                 <View style={styles.loginLinkContainer}>
//                     <Text style={styles.loginText}>Đã có tài khoản? </Text>
//                     <CustomButton
//                         title="Đăng nhập"
//                         onPress={handleLogin}
//                         variant="link"
//                     />
//                 </View>
//             </View>
//         </ScrollView>
//     );
// };

// export default VerifyScreen;