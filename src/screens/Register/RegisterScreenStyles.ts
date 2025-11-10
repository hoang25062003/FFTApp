// FILE: src/screens/Register/RegisterScreenStyles.ts

import { StyleSheet } from 'react-native';
// GIẢ ĐỊNH: Màu sắc
const Colors = {
    background: '#fff',
    textPrimary: '#333',
    textSecondary: '#666',
    primary: '#8BC34A', // Màu xanh olive/lime từ hình ảnh
    border: '#ddd',
    link: '#8BC34A', // Màu link cũng là màu primary
}; 
const FontSize = {
    large: 24,
    medium: 16,
    small: 14,
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        paddingHorizontal: 25,
        paddingTop: 0, // Bỏ padding top vì HeaderLogo đã có
        paddingBottom: 50,
        minHeight: '100%',
    },
    // Tiêu đề lớn (Đăng ký)
    title: {
        fontSize: FontSize.large, 
        color: Colors.textPrimary, 
        fontWeight: 'bold',
        marginBottom: 8, 
        textAlign: 'left', // Theo hình ảnh, tiêu đề căn trái
    },
    // Tiêu đề phụ (Bắt đầu hành trình...)
    subtitle: {
        fontSize: FontSize.medium,
        color: Colors.textSecondary,
        marginBottom: 30, // Khoảng cách lớn hơn sau subtitle
        textAlign: 'left',
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: FontSize.small,
        color: Colors.textSecondary,
        marginTop: 15, // Khoảng cách giữa các nhóm input
        marginBottom: 5,
        fontWeight: '600',
    },
    // Dành cho Họ & Tên
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5, // Dùng margin top/bottom trong label/input
    },
    inputHalf: {
        width: '48%', 
    },

    // --- Date Input (Mô phỏng Date Picker) ---
    dateInput: {
        // Có thể cần style riêng cho CustomInput nếu nó là TouchableOpacity
    },
    inputIcon: {
        color: Colors.textSecondary,
    },

    // --- Gender Radio Buttons ---
    genderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioSelected: {
        borderColor: Colors.primary,
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    radioLabel: {
        fontSize: FontSize.medium,
        color: Colors.textPrimary,
    },

    // --- Buttons & Links ---
    registerButton: {
        marginTop: 30,
        marginBottom: 5,
        backgroundColor: Colors.primary, // Đặt màu primary cho nút
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: FontSize.small,
        color: Colors.textSecondary,
    },
    loginButtonLink: {
        // Đặt màu link theo màu primary
        color: Colors.link,
        paddingHorizontal: 0, // Bỏ padding mặc định của nút link
    }
});

export default styles;