import { Alert } from 'react-native';
// Đảm bảo RegisterPayload đã được import chính xác từ nơi bạn đã sửa
import { RegisterPayload } from '../services/AuthService'; 

/**
 * Các hàm kiểm tra tính hợp lệ cho từng trường
 */

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Hàm kiểm tra mật khẩu (ví dụ: ít nhất 8 ký tự)
const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};


// Hàm kiểm tra Ngày sinh (ví dụ: định dạng YYYY-MM-DD)
const isValidDateOfBirth = (dob: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) return false;

    const date = new Date(dob);
    // Kiểm tra nếu date là ngày hợp lệ VÀ chuỗi ngày sinh khớp với ngày được tạo
    return !isNaN(date.getTime()) && date.toISOString().startsWith(dob);
};

// Hàm kiểm tra Giới tính (phải là Male hoặc Female)
const isValidGender = (gender: RegisterPayload['gender']): boolean => {
    return (gender === 'Male' || gender === 'Female'); 
};


/**
 * Hook chính: Kiểm tra tính hợp lệ cho toàn bộ payload Đăng ký
 * Trả về true nếu hợp lệ, ngược lại hiển thị Alert và trả về false.
 */
export const useRegisterValidation = () => {
    
    // Hàm tổng hợp để validate toàn bộ dữ liệu
    const validateRegisterForm = (payload: RegisterPayload, rePassword: string): boolean => {
        let errors: string[] = [];

        // 1. Kiểm tra trường bắt buộc
        // ⭐ ĐÃ SỬA: Bỏ kiểm tra phoneNumber. Do gender không là null trong type, ta cũng không cần kiểm tra nó ở đây nữa.
        if (!payload.firstName || !payload.lastName || !payload.email || !payload.password || !payload.rePassword || !payload.dateOfBirth) {
             errors.push('Vui lòng điền đầy đủ tất cả thông tin bắt buộc.');
        }

        // --- Nếu có lỗi cơ bản, ta dừng lại ---
        if (errors.length > 0) {
            Alert.alert('Lỗi Dữ Liệu', errors.join('\n'));
            return false;
        }

        // 2. Kiểm tra Mật khẩu và Xác nhận Mật khẩu
        if (payload.password !== payload.rePassword) {
            errors.push('Mật khẩu và Xác nhận Mật khẩu không khớp.');
        }
        if (!isValidPassword(payload.password)) {
            errors.push('Mật khẩu phải có ít nhất 8 ký tự.');
        }
        
        // 3. Kiểm tra Email
        if (!isValidEmail(payload.email)) { // Không cần kiểm tra tồn tại vì đã kiểm tra ở bước 1
            errors.push('Địa chỉ Email không hợp lệ.');
        }
        
        // 4. Kiểm tra Ngày sinh
        if (!isValidDateOfBirth(payload.dateOfBirth)) { // Không cần kiểm tra tồn tại vì đã kiểm tra ở bước 1
            errors.push('Ngày sinh không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.');
        }

        // 5. Kiểm tra Giới tính
        // Do type đã được siết chặt là Male | Female, ta chỉ cần gọi hàm kiểm tra.
        // Tuy nhiên, nếu bạn tin tưởng đầu vào từ RegisterScreen, bước này có thể không cần thiết.
        if (!isValidGender(payload.gender)) {
            // ⭐ ĐÃ SỬA: Cập nhật thông báo lỗi, bỏ "Other"
            errors.push('Giới tính không hợp lệ. Chỉ chấp nhận "Male" hoặc "Female".');
        }


        // Xử lý lỗi cuối cùng
        if (errors.length > 0) {
            Alert.alert('Lỗi Dữ Liệu', errors.join('\n'));
            return false;
        }

        return true;
    };

    return { validateRegisterForm };
};