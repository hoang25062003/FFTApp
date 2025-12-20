// FILE: src/services/LabelService.ts

import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 300000; // 30 seconds

// ============================================
// TYPES
// ============================================
export type Label = {
    id: string;
    name: string;
    colorCode: string;
};

// ============================================
// HTTP CLIENT FOR LABEL
// ============================================
class LabelHttpClient {
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
        
        // Prepare headers
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
const labelHttpClient = new LabelHttpClient(BASE_URL);

// ============================================
// LABEL SERVICE METHODS
// ============================================

/**
 * Get all labels (public endpoint)
 */
export async function getLabels(): Promise<Label[]> {
    const response = await labelHttpClient.request<Label[]>(
        '/Label',
        { method: 'GET' },
        false
    );
    return response;
}

// Export everything
export default {
    getLabels,
};