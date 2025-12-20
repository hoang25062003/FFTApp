// FILE: src/services/AuthService.ts (Đã cập nhật đầy đủ)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { jwtDecode } from 'jwt-decode';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_DATA_KEY = '@user_data';
const REQUEST_TIMEOUT = 30000;

// ============================================
// TYPES
// ============================================
export type ApiError = {
    message?: string;
    errors?: { [key: string]: string[] };
    status?: number;
    statusCode?: number;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    refreshToken?: string;
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
};

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rePassword: string;
    dateOfBirth: string; // yyyy-MM-dd
    gender: 'Male' | 'Female';
};

export type RegisterResponse = {
    message?: string;
};

export type OtpVerifyPayload = { 
    email: string; 
    code: string;
};

export type ResendOtpPayload = { 
    email: string;
    purpose?: 'VERIFYACCOUNTEMAIL' | 'FORGOTPASSWORD' | 'confirm' | 'reset';
};

export type ForgotPasswordPayload = {
    email: string;
};

export type ResetPasswordWithOtpPayload = {
    email: string;
    token: string;
    newPassword: string;
    rePassword: string;
};

export type ChangePasswordPayload = {
    currentPassword: string;
    newPassword: string;
    rePassword: string;
};

export type RefreshTokenResponse = {
    token: string;
    refreshToken?: string;
};

export enum Role {
    CUSTOMER = 'Customer',
    MODERATOR = 'Moderator',
    ADMIN = 'Admin',
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber?: string;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

// Custom Error Class
export class ApiException extends Error {
    status: number;
    errors?: { [key: string]: string[] };

    constructor(message: string, status: number, errors?: { [key: string]: string[] }) {
        super(message);
        this.name = 'ApiException';
        this.status = status;
        this.errors = errors;
    }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================
export const TokenManager = {
    async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    },

    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    },

    async saveRefreshToken(refreshToken: string): Promise<void> {
        try {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } catch (error) {
            console.error('Error saving refresh token:', error);
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    },

    async saveUserData(userData: Partial<User>): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    },

    async getUserData(): Promise<Partial<User> | null> {
        try {
            const data = await AsyncStorage.getItem(USER_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },
};

// ============================================
// HTTP CLIENT WITH INTERCEPTORS
// ============================================
class HttpClient {
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
        includeAuth: boolean = false,
        isRetry: boolean = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (options.headers) {
            const customHeaders = options.headers as Record<string, string>;
            Object.assign(headers, customHeaders);
        }

        if (includeAuth) {
            const token = await TokenManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const response = await this.fetchWithTimeout(url, {
                ...options,
                headers,
            });

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 401 && !isRetry && includeAuth) {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        return this.request<T>(endpoint, options, includeAuth, true);
                    }
                }

                throw this.handleError(response, responseData);
            }

            return responseData as T;
        } catch (error) {
            if (error instanceof ApiException) {
                throw error;
            }
            
            const message = error instanceof Error 
                ? error.message 
                : 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            throw new ApiException(message, 0);
        }
    }

    private handleError(response: Response, responseData: any): ApiException {
        const errorData = responseData as ApiError;
        let errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;
        
        if (errorData.errors) {
            const details = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            errorMessage = `Dữ liệu không hợp lệ:\n${details}`;
        }

        return new ApiException(errorMessage, response.status, errorData.errors);
    }

    private async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = await TokenManager.getRefreshToken();
            if (!refreshToken) {
                return false;
            }

            const response = await this.fetchWithTimeout(`${this.baseUrl}/Auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                await TokenManager.clearAll();
                return false;
            }

            const data: RefreshTokenResponse = await response.json();
            await TokenManager.saveToken(data.token);
            if (data.refreshToken) {
                await TokenManager.saveRefreshToken(data.refreshToken);
            }

            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            await TokenManager.clearAll();
            return false;
        }
    }
}

// Create HTTP client instance
const httpClient = new HttpClient(BASE_URL);

// ============================================
// HELPER: EXTRACT USER FROM JWT
// ============================================
function extractUserFromToken(token: string, email?: string): User {
    const decodedToken = jwtDecode<Record<string, any>>(token);

    // Helper to extract claims with multiple possible keys
    const extractClaim = (
        token: Record<string, unknown>,
        ...possibleKeys: string[]
    ): string | undefined => {
        for (const key of possibleKeys) {
            const value = token[key];
            if (value !== undefined && value !== null && value !== '') {
                return String(value);
            }
        }
        return undefined;
    };

    const rawRole = extractClaim(
        decodedToken,
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        'role',
        'roles',
        'user_role',
        'authority',
    );

    // Map different role formats to our enum values
    const roleMapping: Record<string, string> = {
        ADMIN: 'Admin',
        Admin: 'Admin',
        admin: 'Admin',
        MODERATOR: 'Moderator',
        Moderator: 'Moderator',
        moderator: 'Moderator',
        CUSTOMER: 'Customer',
        Customer: 'Customer',
        customer: 'Customer',
    };

    const mappedRole = rawRole ? roleMapping[rawRole] || rawRole : 'Customer';

    const user: User = {
        id: extractClaim(
            decodedToken,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
            'sub',
            'id',
            'userId',
            'user_id',
            'nameid',
            'unique_name',
        ) || email || 'unknown',
        email: extractClaim(
            decodedToken,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
            'email',
            'email_address',
            'mail',
        ) || email || '',
        role: mappedRole as Role,
        firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
        lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
        fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
        phoneNumber: extractClaim(decodedToken, 'phoneNumber', 'phone_number', 'phone', 'mobile'),
        isActive: true,
        isEmailVerified: Boolean(
            extractClaim(decodedToken, 'emailVerified', 'email_verified', 'verified')
        ) || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return user;
}

// ============================================
// AUTH SERVICE METHODS
// ============================================

/**
 * Login user
 */
export async function login(data: LoginPayload): Promise<LoginResponse & { user: User }> {
    const response = await httpClient.request<LoginResponse>(
        '/Auth/login',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        false
    );

    // Extract user info from token
    const user = extractUserFromToken(response.token, data.email);

    // Save tokens and user data
    await TokenManager.saveToken(response.token);
    if (response.refreshToken) {
        await TokenManager.saveRefreshToken(response.refreshToken);
    }
    await TokenManager.saveUserData(user);

    return { ...response, user };
}

/**
 * Register new user - Sử dụng query parameters
 */
export async function register(data: RegisterPayload): Promise<RegisterResponse> {
    // Build query string với key names đúng theo API (PascalCase)
    const params = new URLSearchParams({
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
        Password: data.password,
        RePassword: data.rePassword,
        DateOfBirth: data.dateOfBirth, // yyyy-MM-dd format
        Gender: data.gender,
    });

    return httpClient.request<RegisterResponse>(
        `/Auth/register?${params.toString()}`,
        {
            method: 'POST',
        },
        false
    );
}

/**
 * Verify email OTP
 */
export async function verifyEmailOtp(data: OtpVerifyPayload): Promise<{ token: string }> {
    return httpClient.request<{ token: string }>(
        '/Auth/verify-email-otp',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        false
    );
}

/**
 * Verify email OTP for password reset
 */
export async function verifyEmailOtpForReset(
    data: OtpVerifyPayload,
    purpose: string = 'confirm'
): Promise<{ token: string }> {
    return httpClient.request<{ token: string }>(
        `/Auth/verify-otp-for-password-reset?purpose=${purpose}`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        false
    );
}

/**
 * Resend OTP code
 */
export async function resendOtp(data: ResendOtpPayload): Promise<void> {
    const purpose = data.purpose || 'VERIFYACCOUNTEMAIL';
    await httpClient.request<void>(
        `/Auth/resend-otp?purpose=${purpose}`,
        {
            method: 'POST',
            body: JSON.stringify({ email: data.email }),
        },
        false
    );
}

/**
 * Forgot password - send OTP to email
 */
export async function forgotPassword(data: ForgotPasswordPayload): Promise<void> {
    await httpClient.request<void>(
        '/Auth/forgot-password',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        false
    );
}

/**
 * Reset password with OTP
 */
export async function resetPasswordWithOtp(data: ResetPasswordWithOtpPayload): Promise<void> {
    await httpClient.request<void>(
        '/Auth/reset-password',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        false
    );
}

/**
 * Change password (authenticated user)
 */
export async function changePassword(data: ChangePasswordPayload): Promise<void> {
    await httpClient.request<void>(
        '/Auth/change-password',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        true // Requires authentication
    );
}

/**
 * Login with Google ID Token
 */
export async function loginWithGoogleIdToken(idToken: string): Promise<LoginResponse & { user: User }> {
    const response = await httpClient.request<{ token: string }>(
        '/Auth/google/id-token',
        {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        },
        false
    );

    // Extract user info from token
    const user = extractUserFromToken(response.token);

    // Save tokens and user data
    await TokenManager.saveToken(response.token);
    await TokenManager.saveUserData(user);

    return { 
        token: response.token,
        user 
    };
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    try {
        // Optional: Call backend logout endpoint if exists
        await httpClient.request<void>(
            '/Auth/logout',
            { method: 'POST' },
            true
        ).catch(() => {}); // Ignore errors

        // Clear local storage
        await TokenManager.clearAll();
    } catch (error) {
        // Always clear local storage even if API call fails
        await TokenManager.clearAll();
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return token !== null;
}

/**
 * Get current user data
 */
export async function getCurrentUser(): Promise<Partial<User> | null> {
    return TokenManager.getUserData();
}

/**
 * Update user profile (example protected route)
 */
export async function updateProfile(data: Partial<User>): Promise<void> {
    await httpClient.request<void>(
        '/User/profile',
        {
            method: 'PUT',
            body: JSON.stringify(data),
        },
        true // Include auth token
    );
    
    // Update local user data
    const currentUser = await TokenManager.getUserData();
    await TokenManager.saveUserData({ ...currentUser, ...data });
}

// Export everything
export default {
    login,
    register,
    verifyEmailOtp,
    verifyEmailOtpForReset,
    resendOtp,
    forgotPassword,
    resetPasswordWithOtp,
    changePassword,
    loginWithGoogleIdToken,
    logout,
    isAuthenticated,
    getCurrentUser,
    updateProfile,
    TokenManager,
};