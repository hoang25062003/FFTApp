import { Alert } from 'react-native';
import { RegisterPayload, GenderType } from '../services/types/index';

/**
 * Các hàm kiểm tra tính hợp lệ cho từng trường
 */

// Hàm kiểm tra Email cơ bản
const isValidEmail = (email: string): boolean => {
    // Regex cơ bản, có thể phức tạp hơn tùy yêu cầu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Hàm kiểm tra mật khẩu (ví dụ: ít nhất 8 ký tự)
const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

// Hàm kiểm tra Số điện thoại (ví dụ: chỉ chứa số và tối thiểu 9 số)
const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{9,}$/;
    return phoneRegex.test(phone.replace(/\s/g, '')); // Loại bỏ khoảng trắng
};

// Hàm kiểm tra Ngày sinh (ví dụ: định dạng YYYY-MM-DD)
const isValidDateOfBirth = (dob: string): boolean => {
    // Regex kiểm tra định dạng YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) return false;

    // Kiểm tra tính hợp lệ của ngày tháng (ví dụ: không phải 2024-99-99)
    const date = new Date(dob);
    // Kiểm tra nếu date là ngày hợp lệ VÀ chuỗi ngày sinh khớp với ngày được tạo
    return !isNaN(date.getTime()) && date.toISOString().startsWith(dob);
};

// Hàm kiểm tra Giới tính (phải là Male hoặc Female)
const isValidGender = (gender: string): boolean => {
    return (gender === 'Male' || gender === 'Female');
};


/**
 * Hook chính: Kiểm tra tính hợp lệ cho toàn bộ payload Đăng ký
 * Trả về true nếu hợp lệ, ngược lại hiển thị Alert và trả về false.
 */
export const useRegisterValidation = () => {
    
    // Hàm tổng hợp để validate toàn bộ dữ liệu
    const validateRegisterForm = (payload: RegisterPayload, confirmPassword: string): boolean => {
        let errors: string[] = [];

        // 1. Kiểm tra trường bắt buộc
        if (!payload.firstName || !payload.lastName || !payload.email || !payload.password || !confirmPassword || !payload.phoneNumber || !payload.dateOfBirth || !payload.gender) {
            errors.push('Vui lòng điền đầy đủ tất cả thông tin bắt buộc.');
        }

        // 2. Kiểm tra Mật khẩu và Xác nhận Mật khẩu
        if (payload.password !== confirmPassword) {
            errors.push('Mật khẩu và Xác nhận Mật khẩu không khớp.');
        }
        if (!isValidPassword(payload.password)) {
            errors.push('Mật khẩu phải có ít nhất 8 ký tự.');
        }

        // 3. Kiểm tra Email
        if (payload.email && !isValidEmail(payload.email)) {
            errors.push('Địa chỉ Email không hợp lệ.');
        }
        
        // 4. Kiểm tra Số điện thoại
        if (payload.phoneNumber && !isValidPhoneNumber(payload.phoneNumber)) {
            errors.push('Số điện thoại không hợp lệ (ít nhất 9 chữ số).');
        }

        // 5. Kiểm tra Ngày sinh
        if (payload.dateOfBirth && !isValidDateOfBirth(payload.dateOfBirth)) {
            errors.push('Ngày sinh không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.');
        }

        // 6. Kiểm tra Giới tính
        if (payload.gender && !isValidGender(payload.gender as GenderType)) {
            errors.push('Giới tính không hợp lệ. Chỉ chấp nhận "Male" hoặc "Female".');
        }

        // Xử lý lỗi
        if (errors.length > 0) {
            Alert.alert('Lỗi Dữ Liệu', errors.join('\n'));
            return false;
        }

        return true;
    };

    return { validateRegisterForm };
};