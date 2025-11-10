// FILE: src/services/AuthService.ts

import { Alert } from 'react-native'; // CÓ THỂ BỎ NẾU KHÔNG DÙNG DEBUG/DEV
import { API_BASE_URL } from '@env';

// --- KIỂU DỮ LIỆU GIẢ ĐỊNH (Cần định nghĩa chính xác trong file types/index.ts) ---
export type ApiError = {
    message?: string;
    errors?: { [key: string]: string[] };
    status?: number;
};

// Dùng cho Login Payload
export type LoginPayload = {
    email: string;
    password: string;
};

// Response của Login (API trả về token)
export type LoginResponse = {
    token: string;
    // Thêm các trường khác như userId, userRole, v.v.
};

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string; // yyyy-MM-dd
    gender: 'Male' | 'Female';
};

// Response của Register (API của bạn không trả về token mà cần xác thực OTP)
export type RegisterResponse = {}; 

// Payload cho Xác thực và Gửi lại OTP
export type OtpVerifyPayload = { email: string, code: string };
export type ResendOtpPayload = { email: string };
// --- KẾT THÚC KIỂU DỮ LIỆU GIẢ ĐỊNH ---

// Sử dụng BASE_URL từ môi trường (API_BASE_URL được giả định đã được cấu hình)
const BASE_URL = `${API_BASE_URL}/api`;

// Hàm xử lý lỗi chung cho các hàm verify và resend
async function handleError(response: Response, responseData: any) {
    const errorData = responseData as ApiError;
    let errorMessage = errorData.message || `Lỗi không xác định: ${response.status}.`;
    
    // Xử lý lỗi Validation chi tiết hơn
    if (errorData.errors) {
        const detail = Object.values(errorData.errors).flat().join('\n- ');
        errorMessage = `Dữ liệu không hợp lệ:\n- ${detail}`;
    }
    
    // Ném lỗi để được bắt ở khối catch của hàm gọi
    throw new Error(errorMessage); 
}

// ----------------------------------------------------
// --- HÀM MỚI: ĐĂNG NHẬP ---
// ----------------------------------------------------

/**
 * Hàm gọi API Đăng nhập người dùng (POST /Auth/login)
 * @param data - Dữ liệu đăng nhập (Email và Password)
 */
export async function login(data: LoginPayload): Promise<LoginResponse> {
    const url = `${BASE_URL}/Auth/login`; // Endpoint: /api/Auth/login
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            await handleError(response, responseData);
        }

        // Kiểm tra và trả về dữ liệu LoginResponse (chứa token)
        const loginData = responseData as LoginResponse;
        if (!loginData.token) {
             throw new Error("Phản hồi thành công từ máy chủ không chứa token.");
        }
        
        return loginData;

    } catch (error) {
        const message = error instanceof Error 
            ? error.message 
            : 'Lỗi kết nối mạng: Không thể kết nối đến máy chủ API.';
        throw new Error(message);
    }
}

// ----------------------------------------------------
// --- CÁC HÀM CŨ: ĐĂNG KÝ VÀ OTP ---
// ----------------------------------------------------

/**
 * Hàm gọi API Đăng ký người dùng (POST /Auth/register)
 * @param data - Dữ liệu đăng ký
 */
export async function register(data: RegisterPayload): Promise<RegisterResponse> {
    const url = `${BASE_URL}/Auth/register`; 
    
    const { 
        firstName, lastName, email, password, phoneNumber, dateOfBirth, gender
    } = data;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName, lastName, email, password, phoneNumber, dateOfBirth, gender, 
            }),
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            await handleError(response, responseData);
        }

        return responseData as RegisterResponse;

    } catch (error) {
        const message = error instanceof Error 
            ? error.message 
            : 'Lỗi kết nối mạng: Không thể kết nối đến máy chủ API.';
        throw new Error(message);
    }
}

/**
 * Hàm gọi API Xác thực mã OTP (POST /Auth/verify-email-otp)
 * @param data - Dữ liệu xác thực (Email và Code)
 */
export async function verifyEmailOtp(data: OtpVerifyPayload): Promise<void> {
    const url = `${BASE_URL}/Auth/verify-email-otp`; // Endpoint: /api/Auth/verify-email-otp

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const responseData = await response.json().catch(() => ({}));
            await handleError(response, responseData);
        }
        
        // Thành công: Backend đã xác nhận email

    } catch (error) {
        const message = error instanceof Error 
            ? error.message 
            : 'Lỗi mạng khi xác thực mã OTP. Vui lòng thử lại.';
        throw new Error(message);
    }
}

/**
 * Hàm gọi API Gửi lại mã OTP (POST /Auth/resend-otp)
 * @param data - Chỉ cần Email
 */
export async function resendOtp(data: ResendOtpPayload): Promise<void> {
    const url = `${BASE_URL}/Auth/resend-otp`; // Endpoint: /api/Auth/resend-otp

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const responseData = await response.json().catch(() => ({}));
            await handleError(response, responseData);
        }
        
        // Thành công: Backend đã gửi lại mã

    } catch (error) {
        const message = error instanceof Error 
            ? error.message 
            : 'Lỗi mạng khi gửi lại mã. Vui lòng thử lại.';
        throw new Error(message);
    }
}