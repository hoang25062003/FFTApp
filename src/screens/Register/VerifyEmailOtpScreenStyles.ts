import { StyleSheet } from 'react-native';

// Giả định Colors
const Colors = {
    white: '#FFFFFF',
    textPrimary: '#333333',
    textSecondary: '#666666',
    primary: '#8BC34A', // Màu xanh olive/lime
    textLink: '#007AFF', // Màu link, có thể dùng primary nếu muốn
};

const styles = StyleSheet.create({
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
    // Style cho CustomInput bên trong (nếu CustomInput không hỗ trợ style prop)
    otpInputText: {
        textAlign: 'center', // Căn giữa cho mã OTP
        letterSpacing: 10, // Giả định có khoảng cách giữa các số
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

export default styles;