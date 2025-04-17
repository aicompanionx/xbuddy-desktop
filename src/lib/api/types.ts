/**
 * Base API response interface
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * URL safety check result interface
 */
export interface UrlSafetyResult {
    url: string;
    isSafe: boolean;
    riskScore?: number;
    category?: string;
    reason?: string;
    timestamp: number;
}

/**
 * URL safety check request parameters
 */
export interface UrlSafetyParams {
    url: string;
}

/**
 * Browser data interface
 */
export interface BrowserData {
    url?: string;
    process?: string;
    active?: boolean;
    time?: string;
    title?: string;
    status?: string;
    message?: string;
    error?: string;
    [key: string]: any;
} 