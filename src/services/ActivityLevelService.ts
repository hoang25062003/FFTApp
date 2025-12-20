import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : 'https://your-api-url.com/api'; // Fallback nếu chưa config env
const REQUEST_TIMEOUT = 300000; // 30 seconds

// ============================================
// TYPES
// ============================================
export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'VeryActive';

export interface ActivityLevelInfo {
    level: ActivityLevel;
    titleVN: string;         // Mới thêm: Cho UI
    factor: number;
    description: string;
    exerciseFrequency: string;
    color: string;           // Mới thêm: Cho UI
    icon: string;            // Mới thêm: Cho UI
}

// ============================================
// DATA MAPPING (API + UI DATA)
// ============================================
export const ACTIVITY_LEVEL_MAP: Record<ActivityLevel, ActivityLevelInfo> = {
    Sedentary: {
        level: 'Sedentary',
        titleVN: 'Thụ Động',
        factor: 1.2,
        description: 'Ít hoặc không vận động',
        exerciseFrequency: 'Làm việc văn phòng, lối sống tĩnh tại. Hầu hết thời gian ngồi hoặc nằm.',
        color: '#64748B',
        icon: '🛋️',
    },
    Light: {
        level: 'Light',
        titleVN: 'Nhẹ Nhàng',
        factor: 1.375,
        description: 'Tập nhẹ 1-3 ngày/tuần',
        exerciseFrequency: 'Đi bộ, yoga nhẹ, làm việc nhà hoặc hoạt động nhẹ nhàng.',
        color: '#10B981',
        icon: '🚶',
    },
    Moderate: {
        level: 'Moderate',
        titleVN: 'Vừa Phải',
        factor: 1.55,
        description: 'Vận động 3-5 ngày/tuần',
        exerciseFrequency: 'Chạy bộ, bơi lội, đạp xe hoặc chơi thể thao cường độ vừa phải.',
        color: '#F59E0B',
        icon: '🏃',
    },
    Active: {
        level: 'Active',
        titleVN: 'Năng Động',
        factor: 1.725,
        description: 'Cường độ cao 6-7 ngày',
        exerciseFrequency: 'Tập gym nặng, thể thao đối kháng hoặc lao động chân tay.',
        color: '#F97316',
        icon: '🔥',
    },
    VeryActive: {
        level: 'VeryActive',
        titleVN: 'Cực Độ',
        factor: 1.9,
        description: 'Vận động viên chuyên nghiệp',
        exerciseFrequency: 'Tập luyện cường độ cực cao 2 lần/ngày hoặc lao động rất nặng.',
        color: '#EF4444',
        icon: '🚀',
    },
};

// ============================================
// HTTP CLIENT
// ============================================
class ActivityLevelHttpClient {
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

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Merge with custom headers
        if (options.headers) {
            const customHeaders = options.headers as Record<string, string>;
            Object.assign(headers, customHeaders);
        }

        // Add auth token if needed
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

            // Handle 204 No Content
            if (response.status === 204) {
                return {} as T;
            }

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
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

// Create HTTP client instance
const activityHttpClient = new ActivityLevelHttpClient(BASE_URL);

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeActivityLevel(value: string | undefined | null): ActivityLevel {
    if (!value) {
        return 'Sedentary';
    }
    const normalized = value.trim().toUpperCase();
    // Map API response string to our Type
    switch (normalized) {
        case 'SEDENTARY': return 'Sedentary';
        case 'LIGHT': return 'Light';
        case 'MODERATE': return 'Moderate';
        case 'ACTIVE': return 'Active';
        case 'VERYACTIVE': return 'VeryActive';
        default: return 'Sedentary';
    }
}

// ============================================
// EXPORTED SERVICE METHODS
// ============================================

/**
 * Get user's current activity level from API
 * GET /api/User/activity-level
 */
export async function getActivityLevel(): Promise<ActivityLevel> {
    try {
        const response = await activityHttpClient.request<{ activityLevel: string }>(
            '/User/activity-level',
            { method: 'GET' },
            true 
        );
        return normalizeActivityLevel(response.activityLevel);
    } catch (error) {
        console.warn('Failed to fetch activity level, defaulting to Sedentary', error);
        return 'Sedentary';
    }
}


export async function changeActivityLevel(activityLevel: ActivityLevel): Promise<void> {
    await activityHttpClient.request<void>(
        '/User/activity-level',
        {
            method: 'PUT',
            body: JSON.stringify({ ActivityLevel: activityLevel.toUpperCase() })
        },
        true // require auth
    );
}

/**
 * Get activity level info object by level key (Local helper)
 */
export function getActivityLevelInfo(level: ActivityLevel): ActivityLevelInfo {
    return ACTIVITY_LEVEL_MAP[level];
}

/**
 * Get all activity levels as an array (For UI Lists)
 */
export function getAllActivityLevels(): ActivityLevelInfo[] {
    return Object.values(ACTIVITY_LEVEL_MAP);
}

// Default export for backward compatibility or cleaner imports
export default {
    getActivityLevel,
    changeActivityLevel,
    getActivityLevelInfo,
    getAllActivityLevels,
    ACTIVITY_LEVEL_MAP,
};