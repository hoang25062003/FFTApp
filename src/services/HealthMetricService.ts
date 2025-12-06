import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000;

// ============================================
// TYPES (Giữ nguyên)
// ============================================

export interface ActivityLevelInfo {
    value: string;
    factor: number;
}

export interface HealthMetric {
    id: string;
    weightKg: number;
    heightCm: number;
    bmi: number;
    bodyFatPercent: number | null;
    muscleMassKg: number | null;
    bmr: number;
    tdee: number;
    recordedAt: string;
    notes: string;
    activityLevel: ActivityLevelInfo;
}

// Dữ liệu đầu vào cho CREATE
export interface HealthMetricInput {
    weightKg: number;
    heightCm: number;
    bodyFatPercent?: number | null;
    muscleMassKg?: number | null;
    notes?: string;
}

// Dữ liệu đầu vào cho UPDATE (Tất cả đều là tùy chọn)
export interface HealthMetricUpdateInput {
    weightKg?: number | null;
    heightCm?: number | null;
    bodyFatPercent?: number | null;
    muscleMassKg?: number | null;
    notes?: string;
}


// ============================================
// HTTP CLIENT (Giữ nguyên)
// ============================================

class HealthMetricHttpClient {
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
                throw new ApiException('Request timeout - Vui lòng kiểm tra kết nối mạng', 408);
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
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
        };

        if (options.headers) {
            Object.assign(headers, options.headers);
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
            const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng không xác định.';
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

const apiClient = new HealthMetricHttpClient(BASE_URL);

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Get all health metrics history, sorted by recordedAt descending.
 * GET /api/UserHealthMetric
 */
export const getHealthMetrics = async (): Promise<HealthMetric[]> => {
    const data = await apiClient.request<HealthMetric[]>('/UserHealthMetric', {
        method: 'GET',
    });
    
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }
    
    return data.sort((a, b) => {
        const dateA = a.recordedAt || '';
        const dateB = b.recordedAt || '';
        return dateB.localeCompare(dateA);
    });
};

/**
 * Get a specific health metric by ID.
 * GET /api/UserHealthMetric/{metricId} 
 * * ✅ FIX 405: Nếu Backend KHÔNG hỗ trợ GET /ID, ta phải lấy tất cả và lọc ở FE.
 * Đây là phiên bản đã sửa để dùng getHealthMetrics()
 */
export const getMetricById = async (metricId: string): Promise<HealthMetric> => {
    // 1. Lấy TẤT CẢ dữ liệu
    const allMetrics = await getHealthMetrics(); 
    
    // 2. Lọc tìm bản ghi theo ID
    const foundMetric = allMetrics.find(metric => metric.id === metricId);

    if (!foundMetric) {
        // Ném lỗi 404 tùy chỉnh nếu không tìm thấy, thay vì nhận 405 từ backend
        throw new ApiException(`Không tìm thấy HealthMetric với ID: ${metricId}`, 404);
    }

    return foundMetric;
};


/**
 * Create a new health metric record.
 * POST /api/UserHealthMetric
 */
export const createHealthMetric = async (input: HealthMetricInput): Promise<HealthMetric> => {
    return apiClient.request<HealthMetric>('/UserHealthMetric', {
        method: 'POST',
        body: JSON.stringify(input),
    });
};

/**
 * Update an existing health metric (requires full payload).
 * PUT /api/UserHealthMetric/{id}
 * ⚠️ Nên dùng updateMetricOnlyChanges để tránh gửi thiếu trường dữ liệu.
 */
export const updateHealthMetric = async (
    metricId: string, 
    input: HealthMetricInput
): Promise<HealthMetric> => {
    return apiClient.request<HealthMetric>(`/UserHealthMetric/${metricId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
};

/**
 * Update an existing health metric by first GETting the original data, 
 * merging the changes, and then PUTting the full object.
 * (Giải quyết vấn đề FE không có đủ dữ liệu gốc)
 */
export const updateMetricOnlyChanges = async (
    metricId: string, 
    changes: HealthMetricUpdateInput // Chỉ gửi những trường muốn thay đổi
): Promise<HealthMetric> => {
    // 1. Lấy dữ liệu gốc (GET) - Bây giờ dùng hàm getMetricById đã được sửa
    const originalMetric = await getMetricById(metricId);

    // 2. Gộp dữ liệu (MERGE)
    // Sẽ giữ nguyên giá trị cũ nếu trường đó không được cung cấp trong 'changes'
    const mergedData: HealthMetricInput = {
        weightKg: changes.weightKg ?? originalMetric.weightKg,
        heightCm: changes.heightCm ?? originalMetric.heightCm,
        bodyFatPercent: changes.bodyFatPercent !== undefined ? changes.bodyFatPercent : originalMetric.bodyFatPercent,
        muscleMassKg: changes.muscleMassKg !== undefined ? changes.muscleMassKg : originalMetric.muscleMassKg,
        notes: changes.notes !== undefined ? changes.notes : originalMetric.notes,
        // Lưu ý: Đã dùng toán tử nullish coalescing (??) và check '!== undefined' 
        // để xử lý trường hợp giá trị muốn update là null
    };

    // 3. Gửi toàn bộ đối tượng đã gộp (PUT)
    return updateHealthMetric(metricId, mergedData);
};


/**
 * Delete a health metric record.
 * DELETE /api/UserHealthMetric/{id}
 */
export const deleteHealthMetric = async (metricId: string): Promise<void> => {
    await apiClient.request<void>(`/UserHealthMetric/${metricId}`, {
        method: 'DELETE',
    });
};

/**
 * Get the latest health metric record (the first one after sorting).
 */
export const getLatestHealthMetric = async (): Promise<HealthMetric | null> => {
    try {
        const metrics = await getHealthMetrics();
        return metrics.length > 0 ? metrics[0] : null;
    } catch (error) {
        console.warn('Không thể lấy chỉ số mới nhất:', error);
        return null;
    }
};

// ============================================
// EXPORT
// ============================================

export default {
    getHealthMetrics,
    getMetricById,
    createHealthMetric,
    updateHealthMetric,
    updateMetricOnlyChanges, // ✅ Hàm mới
    deleteHealthMetric,
    getLatestHealthMetric,
};