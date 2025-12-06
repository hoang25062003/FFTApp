export type GenderType = 'Male' | 'Female' | 'Other'; // ĐÃ THÊM 'Other'
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rePassword: string;
    phoneNumber: string;
    
    // CÁC TRƯỜNG MỚI THEO YÊU CẦU BACKEND (image_dd205e.png)
    dateOfBirth: string; // Định dạng ISO 8601 (YYYY-MM-DD)
    gender: GenderType; 
}

// Response body từ API Đăng ký (Có thể chứa Token, User Info, v.v.)
// Tùy thuộc vào thiết kế của Backend, đây chỉ là một mẫu.
export interface RegisterResponse {
    message: string;
    userId: string;
    email: string;
    token?: string; // Tùy chọn, nếu API trả về token ngay sau đăng ký
}

// Định nghĩa chung cho phản hồi lỗi từ API (4xx, 5xx)
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: { 
        [key: string]: string[] 
    }; // Lỗi validation chi tiết
}