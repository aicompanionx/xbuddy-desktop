/**
 * API configuration interface
 */
export interface ApiConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

/**
 * Response wrapper interface
 */
export interface FetchResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

/**
 * Request options interface
 */
export interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    data?: any;
    timeout?: number;
}

// Default API configuration
const defaultConfig: ApiConfig = {
    baseURL: 'http://localhost:3090',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
};

/**
 * API Client class using fetch
 */
class FetchClient {
    private config: ApiConfig;

    constructor(config: Partial<ApiConfig> = {}) {
        this.config = {
            ...defaultConfig,
            ...config,
            headers: {
                ...defaultConfig.headers,
                ...config.headers,
            }
        };
    }

    /**
     * Execute API request
     */
    private async request<T>(url: string, options: RequestOptions = {}): Promise<FetchResponse<T>> {
        const { method = 'GET', headers = {}, params, data, timeout = this.config.timeout } = options;

        // Build URL with query parameters
        const fullUrl = this.buildUrl(url, params);

        // Prepare request options
        const requestOptions: RequestInit = {
            method,
            headers: {
                ...this.config.headers,
                ...headers,
            },
            // Add body for POST, PUT, PATCH requests
            ...(data && method !== 'GET' && method !== 'HEAD' ? {
                body: typeof data === 'string' ? data : JSON.stringify(data)
            } : {})
        };

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = timeout
                ? setTimeout(() => controller.abort(), timeout)
                : null;

            // Execute fetch request
            const response = await fetch(fullUrl, {
                ...requestOptions,
                signal: controller.signal
            });

            // Clear timeout
            if (timeoutId) clearTimeout(timeoutId);

            // Process response headers
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Parse response based on content type
            let responseData: T;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text() as unknown as T;
            }

            // Return standardized response
            const apiResponse: FetchResponse<T> = {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders
            };

            // Throw error for non-2xx responses
            if (!response.ok) {
                throw this.createError(
                    `Request failed with status ${response.status}`,
                    apiResponse
                );
            }

            return apiResponse;
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * Build full URL with parameters
     */
    private buildUrl(url: string, params?: Record<string, string>): string {
        // Create full URL
        const baseUrl = this.config.baseURL.endsWith('/')
            ? this.config.baseURL.slice(0, -1)
            : this.config.baseURL;

        const endpoint = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = new URL(`${baseUrl}${endpoint}`);

        // Add query parameters
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    fullUrl.searchParams.append(key, value);
                }
            });
        }

        return fullUrl.toString();
    }

    /**
     * Create standardized error object
     */
    private createError(message: string, response?: FetchResponse): Error {
        const error = new Error(message) as Error & { response?: FetchResponse };
        if (response) error.response = response;
        return error;
    }

    /**
     * GET request
     */
    public async get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<FetchResponse<T>> {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    public async post<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<FetchResponse<T>> {
        return this.request<T>(url, { ...options, method: 'POST', data });
    }

    /**
     * PUT request
     */
    public async put<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<FetchResponse<T>> {
        return this.request<T>(url, { ...options, method: 'PUT', data });
    }

    /**
     * PATCH request
     */
    public async patch<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<FetchResponse<T>> {
        return this.request<T>(url, { ...options, method: 'PATCH', data });
    }

    /**
     * DELETE request
     */
    public async delete<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<FetchResponse<T>> {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }
}

// Export default client instance
export const apiClient = new FetchClient();

// Create custom client with configuration
export function createApiClient(config: Partial<ApiConfig> = {}): FetchClient {
    return new FetchClient(config);
}

// Helper function: Handle API response
export function handleApiResponse<T>(response: FetchResponse<T>): T {
    return response.data;
}

// Helper function: Unified error handling
export function handleApiError(error: any): never {
    let errorMessage = 'Unknown error';

    if (error.response) {
        // Server response error
        const status = error.response.status;
        const data = error.response.data;

        errorMessage = `Server error ${status}: ${data?.message || 'Unknown error'}`;
    } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server, please check network connection';
    } else {
        // Request setup error
        errorMessage = error.message || 'Request error';
    }

    // Add global error handling logic here if needed

    // Rethrow the error
    throw new Error(errorMessage);
} 