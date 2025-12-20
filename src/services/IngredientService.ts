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

// Type chung cho Category
export interface Category {
  id: string;
  name: string;
}

// Type cho Dinh dưỡng (Nutrient)
export interface Nutrient {
  name: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  medianValue?: number;
}

// 1. Type cho item trong DANH SÁCH (List Item)
export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; 
  categoryNames: Category[]; 
  isNew: boolean;
  lastUpdatedUtc: string;
}

// 2. Type cho CHI TIẾT (Details)
export interface IngredientDetail {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  lastUpdatedUtc: string;
  isNew: boolean;
  categories: Category[];    
  nutrients: Nutrient[];     
}

// 3. Cấu trúc phản hồi phân trang
export interface PaginatedIngredients {
  items: Ingredient[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// 4. Type cho kết quả từ USDA (MỚI)
export interface UsdaIngredient {
  id: string;
  name: string;
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
        const url = `${this.baseUrl}${endpoint}`; 
        
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
            } else {
                console.warn('[HTTP CLIENT] Auth requested but no token found.');
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
            const message = error instanceof Error ? error.message : 'Network error.';
            throw new ApiException(message, 0);
        }
    }

    private handleError(response: Response, responseData: any): ApiException {
        const errorData = responseData as any;
        let errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;

        if (errorData.errors) {
            const details = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n');
            errorMessage = `Invalid data:\n${details}`;
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
 * Lấy danh sách nguyên liệu có phân trang và tìm kiếm nội bộ
 */
export async function getIngredients(
    pageNumber: number = 1,
    pageSize: number = 20,
    search?: string
): Promise<PaginatedIngredients> {
    const queryParams = new URLSearchParams();
    queryParams.append('PaginationParams.PageNumber', pageNumber.toString());
    queryParams.append('PaginationParams.PageSize', pageSize.toString());
    
    if (search) {
        queryParams.append('Keyword', search);
    }

    return ingredientHttpClient.request<PaginatedIngredients>(
        `/Ingredient?${queryParams.toString()}`, 
        { method: 'GET' }, 
        true
    );
}

/**
 * Lấy chi tiết một nguyên liệu theo ID
 */
export async function getIngredientById(id: string): Promise<IngredientDetail> {
    if (!id) throw new Error("Ingredient ID is required");

    return ingredientHttpClient.request<IngredientDetail>(
        `/Ingredient/${id}`,
        { method: 'GET' },
        true
    );
}

/**
 * Lấy dữ liệu nguyên liệu từ nguồn USDA (MỚI CẬP NHẬT)
 * @param keyword Từ khóa tìm kiếm (VD: "Khoai")
 */
export async function getUsdaIngredients(keyword: string): Promise<UsdaIngredient[]> {
    if (!keyword || keyword.trim() === '') return [];

    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);

    return ingredientHttpClient.request<UsdaIngredient[]>(
        `/Ingredient/usda?${queryParams.toString()}`,
        { method: 'GET' },
        true
    );
}

// Export object mặc định để dễ import
export default {
    getIngredients,
    getIngredientById,
    getUsdaIngredients,
};