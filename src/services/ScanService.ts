import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 60000; // 60 seconds (AI processing might take longer)

// ============================================
// TYPES
// ============================================
export type DetectedIngredientResponse = {
    ingredient: string;
    confidence: number;
};

export type ScanIngredientPayload = {
    image: string; // Local URI of the image
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

// ============================================
// HTTP CLIENT FOR SCAN
// ============================================
class ScanHttpClient {
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
        const headers: Record<string, string> = {};

        // Only set Content-Type to json if body is NOT FormData
        // Fetch handles multipart/form-data boundary automatically when body is FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

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
const scanHttpClient = new ScanHttpClient(BASE_URL);

// ============================================
// SCAN SERVICE METHODS
// ============================================

/**
 * Detect ingredients from an image
 */
export async function detectIngredients(data: ScanIngredientPayload): Promise<DetectedIngredientResponse[]> {
    const formData = new FormData();
    const uri = data.image;

    if (!uri) {
        throw new Error('Image URI is required');
    }

    const filename = uri.split('/').pop() || `scan_image.${getFileExtension(uri)}`;
    const type = getMimeType(uri);

    // React Native FormData format
    formData.append('Image', {
        uri: uri,
        name: filename,
        type: type,
    } as any);

    const response = await scanHttpClient.request<DetectedIngredientResponse[]>(
        '/Ingredient/detect-gemini',
        { 
            method: 'POST',
            body: formData,
        },
        true // Include Auth token
    );
    
    return response;
}

// Export everything
export default {
    detectIngredients,
};