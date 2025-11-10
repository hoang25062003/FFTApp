import { StyleSheet } from 'react-native';
// Giả định bạn có file Colors và FontSize trong ../../constants
import { Colors, FontSize } from '../../constants/Colors'; 

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: Colors.background, // Dùng màu nền chung
    },
    contentContainer: {
        paddingHorizontal: 25,
        paddingTop: 50,
        paddingBottom: 50,
        alignItems: 'center', // Căn giữa nội dung
    },
    // Styles mới cho tiêu đề đã chuyển từ HeaderLogo sang View
    headerTitle: {
        fontSize: 28, // Kích thước lớn hơn
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 10,
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: FontSize.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30, // Khoảng cách với input
        paddingHorizontal: 20,
    },
    // --- END Styles mới ---
    formContainer: {
        width: '100%',
        marginTop: 0, // Đã có margin ở subtitle
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.large, 
        color: Colors.textPrimary, 
        fontWeight: 'bold',
        marginBottom: 5, 
        alignSelf: 'flex-start', // Căn lề trái cho tiêu đề input
    },
    verifyButton: {
        marginTop: 20,
        width: '100%',
    },
    resendButton: {
        marginTop: 10,
        paddingVertical: 10,
    },
    resendText: {
        fontSize: FontSize.small,
        color: Colors.textLink,
        fontWeight: '600',
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // Khoảng cách lớn hơn so với nút gửi lại
    },
    loginText: {
        fontSize: FontSize.small,
        color: Colors.textSecondary,
    }
});

export default styles;