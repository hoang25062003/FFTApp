import { Alert } from 'react-native';

// Giả định kiểu dữ liệu tối thiểu cho Login Payload
export type LoginPayload = {
    email: string;
    password: string;
};

/**
 * Các hàm kiểm tra tính hợp lệ cho từng trường
 */

// Hàm kiểm tra Email cơ bản
export const isValidEmail = (email: string): boolean => {
    // Regex cơ bản, kiểm tra định dạng email: name@domain.tld
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()); // Đã thêm .trim()
};

// Hàm kiểm tra mật khẩu (ví dụ: ít nhất 6 ký tự)
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};


/**
 * Hook chính: Kiểm tra tính hợp lệ cho toàn bộ payload Đăng nhập
 * Trả về một đối tượng chứa hàm `validateLoginForm` và các hàm kiểm tra riêng lẻ.
 */
export const useLoginValidation = () => {
    
    // Hàm tổng hợp để validate toàn bộ dữ liệu Login
    const validateLoginForm = (payload: LoginPayload): boolean => {
        let errors: string[] = [];
        
        const email = payload.email.trim();
        const password = payload.password; // Không trim() password để giữ lại ký tự khoảng trắng nếu muốn
        
        // 1. Kiểm tra Email
        if (!email) {
            errors.push('Địa chỉ Email không được để trống.');
        } else if (!isValidEmail(email)) {
            errors.push('Địa chỉ Email không hợp lệ.');
        }

        // 2. Kiểm tra Mật khẩu
        if (!password) {
            errors.push('Mật khẩu không được để trống.');
        } else if (!isValidPassword(password)) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự.');
        }

        // Xử lý lỗi
        if (errors.length > 0) {
            // Sử dụng Alert của React Native để thông báo lỗi
            Alert.alert('Lỗi Đăng Nhập', errors.join('\n'));
            return false;
        }

        return true;
    };

    return { 
        validateLoginForm,
        isValidEmail, // Export lại để tiện sử dụng nếu cần validate on-the-fly
        isValidPassword, // Export lại để tiện sử dụng nếu cần validate on-the-fly
    };
};