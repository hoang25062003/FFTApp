import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// ============================================
// TYPES
// ============================================

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female'; 
    avatarUrl: string | null; // <--- ✅ MỚI: Thêm avatarUrl
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null; 
};

export type UpdateProfilePayload = {
    firstName?: string;
    lastName?: string;
    gender?: 'Male' | 'Female'; 
    address?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null; 
    avatar?: string; 
};

// ============================================
// UTILITIES (Lấy từ ScanService)
// ============================================

const getFileExtension = (uri: string): string => {
    const match = uri.match(/\.([^./?#]+)(?:[?#]|$)/i);
    return match ? match[1] : 'jpg';
};

const getMimeType = (uri: string): string => {
    const ext = getFileExtension(uri).toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        heif: 'image/heif',
    };
    return mimeTypes[ext] || 'image/jpeg';
};

export function getGenderDisplay(gender: string | null | undefined): string {
    if (!gender) return 'Chưa xác định';
    const upperCaseGender = gender.toUpperCase(); 
    switch (upperCaseGender) {
        case 'MALE': return 'Nam';
        case 'FEMALE': return 'Nữ';
        default: return 'Không xác định'; 
    }
}

// ============================================
// HTTP CLIENT
// ============================================
class UserHttpClient {
    private baseUrl: string;
    private timeout: number;

    constructor(baseUrl: string, timeout: number = REQUEST_TIMEOUT) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiException('Request timeout', 408);
            }
            throw error;
        }
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        includeAuth: boolean = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {};

        // Kiểm tra nếu là FormData thì KHÔNG set Content-Type là application/json
        const isFormData = options.body instanceof FormData;

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (options.headers) {
            Object.assign(headers, options.headers as Record<string, string>);
        }

        if (includeAuth) {
            const token = await TokenManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                throw new ApiException('Authorization token is missing. Please log in.', 401);
            }
        }

        try {
            const response = await this.fetchWithTimeout(url, { ...options, headers });
            
            if (response.status === 204) return {} as T;

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw this.handleError(response, responseData);
            }

            return responseData as T;
        } catch (error) {
            if (error instanceof ApiException) throw error;
            const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng.';
            throw new ApiException(message, 0);
        }
    }

    private handleError(response: Response, responseData: any): ApiException {
        const errorData = responseData as any;
        let errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;

        if (errorData.errors) {
            const details = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n');
            errorMessage = `Dữ liệu không hợp lệ:\n${details}`;
        }

        return new ApiException(errorMessage, response.status, errorData.errors);
    }
}

const userHttpClient = new UserHttpClient(BASE_URL);

// ============================================
// SERVICE METHODS
// ============================================

export async function getUserProfile(): Promise<UserProfile> {
    return userHttpClient.request<UserProfile>(
        '/user/profile', 
        { method: 'GET' }, 
        true
    );
}

/**
 * Cập nhật thông tin profile.
 * Hỗ trợ tự động chuyển sang FormData nếu payload có chứa trường 'avatar' (local URI).
 */
export async function updateUserProfile(data: FormData | UpdateProfilePayload): Promise<UserProfile> {
    let body: BodyInit;
    
    // 1. Nếu người dùng đã tự truyền FormData -> Dùng luôn
    if (data instanceof FormData) {
        body = data;
    } 
    // 2. Nếu là Object thuần
    else {
        // Kiểm tra xem có cần upload ảnh không (có trường avatar và nó là chuỗi không rỗng)
        if (data.avatar && typeof data.avatar === 'string') {
            // ==> LOGIC GIỐNG SCAN SERVICE: Tạo FormData
            const formData = new FormData();
            
            // Append ảnh
            const uri = data.avatar;
            const filename = uri.split('/').pop() || `avatar.${getFileExtension(uri)}`;
            const type = getMimeType(uri);

            formData.append('avatar', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            // Append các trường text khác
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'avatar' && value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            body = formData;
        } else {
            // ==> Nếu không có ảnh, gửi JSON như bình thường
            body = JSON.stringify(data);
        }
    }

    return userHttpClient.request<UserProfile>(
        '/user/profile', 
        { 
            method: 'PUT',
            body: body,
        }, 
        true
    );
}

export default {
    getUserProfile,
    updateUserProfile,
    getGenderDisplay, 
};