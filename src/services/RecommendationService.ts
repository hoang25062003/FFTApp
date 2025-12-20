import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';
import { Author, IngredientName, Label } from './RecipeService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 300000;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================
// TYPES
// ============================================

export interface RecommendedRecipeResponse {
  id: string;
  name: string;
  description: string;
  author: Author;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  labels: Label[];
  ingredients: IngredientName[];
  createdAtUtc: string;
  updatedAtUtc: string;
  score: number;
}

export interface PagedResultRecommendedRecipe {
  items: RecommendedRecipeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

// ============================================
// UTILITIES
// ============================================

const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams;
};

// ============================================
// CACHE
// ============================================

class RecommendationCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = CACHE_TTL) {
    this.ttl = ttl;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const recommendationCache = new RecommendationCache();

// ============================================
// HTTP CLIENT
// ============================================

class RecommendationHttpClient {
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
      const response = await fetch(url, { ...options, signal: controller.signal });
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
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (includeAuth) {
      const token = await TokenManager.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
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

const recommendationHttpClient = new RecommendationHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

/**
 * Get recommended recipes for the current user based on their health goals and metrics
 * Results are ranked by a scoring system that considers:
 * - User's health goals
 * - User's health metrics
 * - Ingredient nutrition values
 * - User behavior (views, clicks, likes, saves)
 *
 * Requires authentication
 */
export async function getRecommendations(
  params: PaginationParams = {}
): Promise<PagedResultRecommendedRecipe> {
  const { pageNumber = 1, pageSize = 10 } = params;

  // Check cache first
  const cacheKey = `recommendations_${pageNumber}_${pageSize}`;
  const cached = recommendationCache.get<PagedResultRecommendedRecipe>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
  });

  const endpoint = `/Recommendation?${queryParams.toString()}`;
  const result = await recommendationHttpClient.request<PagedResultRecommendedRecipe>(
    endpoint,
    { method: 'GET' },
    true
  );

  // Calculate totalPages for pagination
  const totalPages = Math.ceil(result.totalCount / result.pageSize);
  const resultWithPages = {
    ...result,
    totalPages,
  };

  // Cache the result
  recommendationCache.set(cacheKey, resultWithPages);

  return resultWithPages;
}

/**
 * Clear recommendation cache
 * Useful when user's health profile changes
 */
export function clearRecommendationCache(): void {
  recommendationCache.clear();
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getRecommendations,
  clearRecommendationCache,
};