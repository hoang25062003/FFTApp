import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 300000;

// ============================================
// TYPES
// ============================================

export interface UserInteractionResponse {
  id: string;
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  email?: string;
  userName?: string;
}

export interface CreateRatingRequest {
  score: number;
  feedback: string;
}

export interface RatingResponse {
  id: string;
  userId?: string;
  recipeId?: string;
  score: number;
  feedback?: string;
  userInteractionResponse?: UserInteractionResponse;
  createdAtUtc: string;
  isOwner?: boolean;
}

export interface AverageRatingResponse {
  ratingCount: number;
  avgRating: number;
}

export interface PaginatedRatingResponse {
  items: RatingResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

// ============================================
// UTILITIES
// ============================================

const validateRating = (score: number): void => {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Score phải là số nguyên từ 1 đến 5');
  }
};

const validateFeedback = (feedback: string): void => {
  if (!feedback || feedback.trim().length === 0) {
    throw new Error('Feedback không được để trống');
  }
  if (feedback.length > 256) {
    throw new Error('Feedback không được quá 256 ký tự');
  }
};

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
// HTTP CLIENT
// ============================================

class RatingHttpClient {
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
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn(`⚠️ [Auth Warning]: Endpoint ${endpoint} cần token nhưng không tìm thấy.`);
      }
    }

    try {
      const response = await this.fetchWithTimeout(url, { ...options, headers });

      if (response.status === 204) return {} as T;

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`❌ [API Error Status]: ${response.status} tại ${endpoint}`);
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

const ratingHttpClient = new RatingHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

/**
 * Lấy điểm đánh giá trung bình (Score)
 * Đã cập nhật: includeAuth = true vì Swagger yêu cầu Authorize
 */
export async function getAverageRating(recipeId: string): Promise<AverageRatingResponse> {
  if (!recipeId) throw new Error('Recipe ID is required');

  return await ratingHttpClient.request<AverageRatingResponse>(
    `/recipe/${recipeId}/score`,
    { method: 'GET' },
    true // CHỈNH SỬA: Chuyển thành true để gửi kèm Token
  );
}

/**
 * Thêm hoặc cập nhật đánh giá
 */
export async function rateRecipe(
  recipeId: string,
  request: CreateRatingRequest
): Promise<RatingResponse> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateRating(request.score);
  validateFeedback(request.feedback);

  return await ratingHttpClient.request<RatingResponse>(
    `/rating/${recipeId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
    true
  );
}

/**
 * Xóa đánh giá
 */
export async function deleteRating(ratingId: string): Promise<void> {
  if (!ratingId) throw new Error('Rating ID is required');

  await ratingHttpClient.request<void>(
    `/rating/${ratingId}`,
    { method: 'DELETE' },
    true
  );
}

/**
 * Lấy danh sách đánh giá phân trang
 */
export async function getRecipeRatings(
  recipeId: string,
  params?: { pageNumber?: number; pageSize?: number }
): Promise<PaginatedRatingResponse> {
  if (!recipeId) throw new Error('Recipe ID is required');

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 12,
  });

  const endpoint = `/recipe/${recipeId}/rating?${queryParams.toString()}`;

  const result = await ratingHttpClient.request<PaginatedRatingResponse>(
    endpoint,
    { method: 'GET' },
    true
  );

  return {
    ...result,
    totalPages: result.totalPages || Math.ceil(result.totalCount / (result.pageSize || 12)),
  };
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getAverageRating,
  rateRecipe,
  deleteRating,
  getRecipeRatings,
};