// FILE: src/services/IngredientCategoryService.ts

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
export type IngredientCategory = {
    id: string;
    name: string;
};

// ============================================
// HTTP CLIENT FOR INGREDIENT CATEGORY
// ============================================
class IngredientCategoryHttpClient {
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

        console.log(`[INGREDIENT CATEGORY HTTP CLIENT] Sending request to: ${url}`);
        
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
                console.log('[INGREDIENT CATEGORY HTTP CLIENT] Authorization Token included.');
            } else {
                console.warn('[INGREDIENT CATEGORY HTTP CLIENT] Authorization requested but token is missing.');
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

// Create HTTP client instance
const ingredientCategoryHttpClient = new IngredientCategoryHttpClient(BASE_URL);

// ============================================
// INGREDIENT CATEGORY SERVICE METHODS
// ============================================

/**
 * Get all ingredient categories (no pagination)
 * GET /api/IngredientCategory
 * Returns: IngredientCategory[]
 */
export async function getIngredientCategories(): Promise<IngredientCategory[]> {
    return ingredientCategoryHttpClient.request<IngredientCategory[]>(
        `/IngredientCategory`, 
        { method: 'GET' }, 
        true
    );
}

/**
 * Get ingredient category by ID
 * GET /api/IngredientCategory/{id}
 */
export async function getIngredientCategoryById(id: string): Promise<IngredientCategory> {
    return ingredientCategoryHttpClient.request<IngredientCategory>(
        `/IngredientCategory/${id}`,
        { method: 'GET' },
        true
    );
}

/**
 * Search ingredient categories by name (client-side filtering)
 */
export async function searchIngredientCategories(keyword: string): Promise<IngredientCategory[]> {
    const categories = await getIngredientCategories();
    
    if (!keyword || keyword.trim() === '') {
        return categories;
    }

    const lowerKeyword = keyword.toLowerCase().trim();
    return categories.filter(category => 
        category.name.toLowerCase().includes(lowerKeyword)
    );
}

// Export everything
export default {
    getIngredientCategories,
    getIngredientCategoryById,
    searchIngredientCategories,
};