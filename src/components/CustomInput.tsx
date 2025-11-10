import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
// GIẢ ĐỊNH: Định nghĩa InputProps được đặt trong '../types'
// interface InputProps extends TextInputProps { ... }
// Tuy nhiên, tôi sẽ thêm trực tiếp type cho iconRight ở đây để đảm bảo code hoạt động độc lập.
import { Colors } from '../constants/Colors'; // <-- Đã sửa đường dẫn import
import Icon from 'react-native-vector-icons/Ionicons'; 
import { ReactNode } from 'react'; // Import ReactNode cho prop iconRight

// GIẢ ĐỊNH: Định nghĩa InputProps
interface InputProps extends Omit<React.ComponentProps<typeof TextInput>, 'style'> {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    isPassword?: boolean;
    // Bổ sung prop mới: iconRight
    iconRight?: ReactNode;
    // Bổ sung prop style để hỗ trợ tùy chỉnh container
    style?: any; 
    editable?: boolean; // THÊM PROP NÀY VÀO INPUT PROPS
    maxLength?: number; // Thêm prop này để tránh lỗi trong VerifyScreen
}


const CustomInput: React.FC<InputProps> = ({
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,
    isPassword = false,
    iconRight, // Thêm prop iconRight
    style, // Nhận style tùy chỉnh cho container
    editable = true, // Đặt mặc định là true
    ...rest
}) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    // Xác định icon sẽ hiển thị
    let rightIcon = null;

    if (isPassword) {
        // 1. Icon cho trường Mật khẩu (Eye/Eye-off)
        rightIcon = (
            <TouchableOpacity
                style={styles.rightIconWrapper}
                onPress={() => setIsSecure(!isSecure)}
            >
                <Icon
                    name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                />
            </TouchableOpacity>
        );
    } else if (iconRight) {
        // 2. Icon tùy chỉnh (như Calendar)
        rightIcon = (
            <View style={styles.rightIconWrapper}>
                {iconRight}
            </View>
        );
    }


    return (
        // Áp dụng style truyền vào cho container
        <View style={[styles.container, style]}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={isSecure}
                placeholderTextColor={Colors.textSecondary}
                editable={editable} // SỬ DỤNG PROP EDITABLE
                {...rest}
            />
            {/* Hiển thị icon đã xác định */}
            {rightIcon}
        </View>
    );
};

// GIẢ ĐỊNH: Định nghĩa Colors (ĐÃ XÓA VÌ CÓ FILE CONSTANTS/COLORS.TS)


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 20,
        height: 50,
        backgroundColor: Colors.white,
    },
    input: {
        flex: 1, // Đảm bảo input chiếm hết không gian còn lại
        fontSize: 16,
        color: Colors.textPrimary,
    },
    // Style chung cho biểu tượng bên phải (mắt hoặc lịch)
    rightIconWrapper: {
        paddingLeft: 10,
        justifyContent: 'center',
        height: '100%',
    },
});

export default CustomInput;