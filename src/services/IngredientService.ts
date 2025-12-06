// FILE: src/services/IngredientService.ts

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
export type Ingredient = {
    id: string;
    name: string;
    imageId: string;
};

// ✅ THÊM TYPE CHO CẤU TRÚC PHẢN HỒI CỦA API
export interface PaginatedIngredients {
    items: Ingredient[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// ============================================
// HTTP CLIENT FOR INGREDIENT 
// ============================================
class IngredientHttpClient {
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
        const url = `${this.baseUrl}${endpoint}`; // URL ĐÃ BAO GỒM QUERY STRING

        // ========================================
        // ✅ THÊM CONSOLE LOG VÀO ĐÂY ĐỂ KIỂM TRA
        // ========================================
        console.log(`[HTTP CLIENT] Sending GET request to: ${url}`);
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (options.headers) {
            Object.assign(headers, options.headers as Record<string, string>);
        }

        if (includeAuth) {
            const token = await TokenManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('[HTTP CLIENT] Authorization Token included.');
            } else {
                console.warn('[HTTP CLIENT] Authorization requested but token is missing.');
            }
        }

        try {
            const response = await this.fetchWithTimeout(url, { ...options, headers });
            
            // ... (Phần xử lý response giữ nguyên)
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

// Create HTTP client instance
const ingredientHttpClient = new IngredientHttpClient(BASE_URL);

// ============================================
// INGREDIENT SERVICE METHODS
// ============================================

/**
 * Get all ingredients
 */
export async function getIngredients(): Promise<PaginatedIngredients> { // <--- ĐÃ SỬA KIỂU TRẢ VỀ
    const pageNumber = 1;
    const pageSize = 50; 

    const queryString = `?PaginationParams.PageNumber=${pageNumber}&PaginationParams.PageSize=${pageSize}`;
    
    return ingredientHttpClient.request<PaginatedIngredients>( // <--- ĐÃ SỬA KIỂU TRUYỀN
        `/Ingredient${queryString}`, 
        { method: 'GET' }, 
        true
    );
}

// Export everything
export default {
    getIngredients,
};