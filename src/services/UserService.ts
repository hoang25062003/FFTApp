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

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female'; 
    avatarUrl: string | null;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null;
    role?: UserRole; // Role của user
    userName: string;
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
// UTILITIES
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

export function getRoleDisplay(role: UserRole | string | null | undefined): string {
    if (!role) return 'Người dùng';
    const upperCaseRole = role.toUpperCase();
    switch (upperCaseRole) {
        case 'ADMIN': return 'Quản trị viên';
        case 'MODERATOR': return 'Điều hành viên';
        case 'USER': return 'Người dùng';
        default: return 'Người dùng';
    }
}

// ============================================
// ROLE CHECK FUNCTIONS
// ============================================

/**
 * Kiểm tra xem user có phải là Admin không
 */
export function isAdmin(profile: UserProfile | null): boolean {
    if (!profile || !profile.role) return false;
    return profile.role.toUpperCase() === 'ADMIN';
}

/**
 * Kiểm tra xem user có phải là Moderator không
 */
export function isModerator(profile: UserProfile | null): boolean {
    if (!profile || !profile.role) return false;
    return profile.role.toUpperCase() === 'MODERATOR';
}

/**
 * Kiểm tra xem user có quyền quản lý (Admin hoặc Moderator) không
 */
export function isAdminOrModerator(profile: UserProfile | null): boolean {
    return isAdmin(profile) || isModerator(profile);
}

/**
 * Kiểm tra xem user có quyền xóa comment không
 * @param profile - User profile
 * @param isRecipeOwner - Có phải chủ công thức không
 * @param isCommentOwner - Có phải chủ comment không
 */
export function canDeleteComment(
    profile: UserProfile | null,
    isRecipeOwner: boolean = false,
    isCommentOwner: boolean = false
): boolean {
    // User có thể xóa comment của chính mình
    if (isCommentOwner) return true;
    
    // Chủ công thức có thể xóa bất kỳ comment nào trong công thức của mình
    if (isRecipeOwner) return true;
    
    // Admin/Moderator có thể xóa bất kỳ comment nào
    return isAdminOrModerator(profile);
}

/**
 * Kiểm tra xem user có quyền xóa rating không
 * @param profile - User profile
 * @param isRecipeOwner - Có phải chủ công thức không
 * @param isRatingOwner - Có phải chủ rating không
 */
export function canDeleteRating(
    profile: UserProfile | null,
    isRecipeOwner: boolean = false,
    isRatingOwner: boolean = false
): boolean {
    // User có thể xóa rating của chính mình
    if (isRatingOwner) return true;
    
    // Chủ công thức có thể xóa rating trong công thức của mình
    if (isRecipeOwner) return true;
    
    // Admin/Moderator có thể xóa bất kỳ rating nào
    return isAdminOrModerator(profile);
}

/**
 * Kiểm tra xem user có quyền chỉnh sửa recipe không
 */
export function canEditRecipe(
    profile: UserProfile | null,
    isRecipeOwner: boolean = false
): boolean {
    // Chủ công thức có thể chỉnh sửa
    if (isRecipeOwner) return true;
    
    // Admin có thể chỉnh sửa bất kỳ công thức nào
    return isAdmin(profile);
}

/**
 * Kiểm tra xem user có quyền xóa recipe không
 */
export function canDeleteRecipe(
    profile: UserProfile | null,
    isRecipeOwner: boolean = false
): boolean {
    // Chủ công thức có thể xóa
    if (isRecipeOwner) return true;
    
    // Admin có thể xóa bất kỳ công thức nào
    return isAdmin(profile);
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

export async function updateUserProfile(data: FormData | UpdateProfilePayload): Promise<UserProfile> {
    let body: BodyInit;
    
    if (data instanceof FormData) {
        body = data;
    } else {
        if (data.avatar && typeof data.avatar === 'string') {
            const formData = new FormData();
            
            const uri = data.avatar;
            const filename = uri.split('/').pop() || `avatar.${getFileExtension(uri)}`;
            const type = getMimeType(uri);

            formData.append('avatar', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'avatar' && value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            body = formData;
        } else {
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
    getRoleDisplay,
    isAdmin,
    isModerator,
    isAdminOrModerator,
    canDeleteComment,
    canDeleteRating,
    canEditRecipe,
    canDeleteRecipe,
};